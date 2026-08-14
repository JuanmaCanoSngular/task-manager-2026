import { Droppable } from '@hello-pangea/dnd';
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { TaskCard } from '../tasks/TaskCard';
import { useTasksByColumn } from '../../stores/board.store';
import { BoardColumn } from '../../interfaces/column.interface';
import { Task } from '../../interfaces/task.interface';
import { taskMatchesTagFilter } from '../../interfaces/tag.interface';
import { Bars2Icon } from '@heroicons/react/20/solid';
import { useTagStore } from '../../stores/tag.store';

export const TASK_PINNED_TYPE = 'TASK-PINNED';
export const TASK_UNPINNED_TYPE = 'TASK-UNPINNED';

export const taskDroppableId = (columnId: number, zone: 'pinned' | 'unpinned') =>
  `${columnId}:${zone}`;

interface StatusColumnProps {
  column: BoardColumn;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isColumnDragging?: boolean;
}

export const StatusColumn = ({
  column,
  dragHandleProps,
  isColumnDragging = false,
}: StatusColumnProps) => {
  const allTasks = useTasksByColumn(column.id);
  const filterTagIds = useTagStore((s) => s.filterTagIds);
  const tasks = allTasks.filter((task) => taskMatchesTagFilter(task.tags, filterTagIds));
  const filtering = filterTagIds.length > 0;
  const pinned = tasks.filter((task) => task.pinned);
  const rest = tasks.filter((task) => !task.pinned);

  return (
    <div className="h-full flex flex-col min-h-0">
      <h2
        {...dragHandleProps}
        className="font-semibold text-sm mb-3 flex items-center flex-shrink-0 tracking-wide cursor-grab active:cursor-grabbing touch-none select-none rounded-lg px-1 -mx-1 py-0.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        style={{ color: 'var(--text-muted)' }}
        title="Arrastra para reordenar la columna"
      >
        <Bars2Icon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 opacity-50" aria-hidden />
        <span
          className="rounded-full w-2.5 h-2.5 mr-2 inline-block flex-shrink-0"
          style={{ backgroundColor: column.color }}
          aria-hidden="true"
        />
        <span className="truncate">
          {column.name} ({tasks.length})
        </span>
      </h2>

      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <TaskDropZone
          columnId={column.id}
          columnColor={column.color}
          zone="pinned"
          label={`Tareas destacadas en ${column.name}`}
          tasks={pinned}
          dndType={TASK_PINNED_TYPE}
          isColumnDragging={isColumnDragging}
          emptyUntilHover
          dragDisabled={filtering}
        />

        {pinned.length > 0 && rest.length > 0 ? (
          <div
            className="mx-1 my-1.5 border-t border-dashed"
            style={{ borderColor: 'var(--border)' }}
            aria-hidden
          />
        ) : null}

        <TaskDropZone
          columnId={column.id}
          columnColor={column.color}
          zone="unpinned"
          label={`Tareas en ${column.name}`}
          tasks={rest}
          dndType={TASK_UNPINNED_TYPE}
          isColumnDragging={isColumnDragging}
          fillRemaining
          dragDisabled={filtering}
        />
      </div>
    </div>
  );
};

interface TaskDropZoneProps {
  columnId: number;
  columnColor: string;
  zone: 'pinned' | 'unpinned';
  label: string;
  tasks: Task[];
  dndType: string;
  isColumnDragging: boolean;
  emptyUntilHover?: boolean;
  fillRemaining?: boolean;
  dragDisabled?: boolean;
}

const TaskDropZone = ({
  columnId,
  columnColor,
  zone,
  label,
  tasks,
  dndType,
  isColumnDragging,
  emptyUntilHover = false,
  fillRemaining = false,
  dragDisabled = false,
}: TaskDropZoneProps) => (
  <Droppable droppableId={taskDroppableId(columnId, zone)} type={dndType} isDropDisabled={dragDisabled}>
    {(provided, snapshot) => {
      const emptyPinnedIdle = emptyUntilHover && tasks.length === 0 && !snapshot.isDraggingOver;
      return (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          role="list"
          aria-label={label}
          className={`flex flex-col gap-1.5 md:gap-2 rounded-xl p-1.5 md:p-2 transition-all duration-200 ${
            fillRemaining ? 'flex-1 min-h-0' : 'flex-shrink-0'
          } ${emptyPinnedIdle ? '!p-0 min-h-0' : ''} ${
            snapshot.isDraggingOver && !isColumnDragging
              ? 'drop-zone-active'
              : isColumnDragging
                ? 'opacity-60'
                : fillRemaining
                  ? 'hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
                  : ''
          } ${emptyUntilHover && snapshot.isDraggingOver && tasks.length === 0 ? 'min-h-12' : ''}`}
        >
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              dragType={dndType}
              columnColor={columnColor}
              dragDisabled={dragDisabled}
            />
          ))}
          {provided.placeholder}
        </div>
      );
    }}
  </Droppable>
);
