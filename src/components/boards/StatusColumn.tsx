import { Droppable } from '@hello-pangea/dnd';
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { TaskCard } from '../tasks/TaskCard';
import { useTasksByColumn } from '../../stores/board.store';
import { BoardColumn } from '../../interfaces/column.interface';
import { Bars2Icon } from '@heroicons/react/20/solid';

interface StatusColumnProps {
  column: BoardColumn;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  taskDndType?: string;
  isColumnDragging?: boolean;
}

export const StatusColumn = ({
  column,
  dragHandleProps,
  taskDndType,
  isColumnDragging = false,
}: StatusColumnProps) => {
  const tasks = useTasksByColumn(column.id);

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
      <Droppable droppableId={String(column.id)} type={taskDndType}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            role="list"
            aria-label={`Tareas en ${column.name}`}
            className={`flex flex-col gap-2 md:gap-3 flex-1 min-h-0 overflow-y-auto overflow-x-hidden transition-all duration-200 rounded-xl p-1.5 md:p-2 ${
              snapshot.isDraggingOver && !isColumnDragging
                ? 'drop-zone-active'
                : isColumnDragging
                  ? 'opacity-60'
                  : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} dragType={taskDndType} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
