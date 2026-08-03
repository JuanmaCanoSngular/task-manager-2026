import { Droppable } from '@hello-pangea/dnd';
import { TaskCard } from '../tasks/TaskCard';
import { useTasksByStatus } from '../../stores/board.store';
import { CreateTaskButton } from '../tasks/CreateTaskButton';
import { TASK_STATUS } from '../../interfaces/task.interface';

interface StatusColumnProps {
  status: string;
  label: string;
  color: string;
}

export const StatusColumn = ({ status, label, color }: StatusColumnProps) => {
  const tasks = useTasksByStatus(status);

  return (
    <div className="h-full flex flex-col">
      <h2
        className="font-semibold text-sm mb-3 flex items-center flex-shrink-0 tracking-wide"
        style={{ color: 'var(--text-muted)' }}
      >
        <span
          className={`${color} rounded-full w-2.5 h-2.5 mr-2 inline-block`}
          aria-hidden="true"
        ></span>
        {label} ({tasks.length})
      </h2>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            role="list"
            aria-label={`${label} tasks`}
            className={`flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto overflow-x-hidden transition-all duration-200 rounded-xl p-2 ${
              snapshot.isDraggingOver
                ? 'drop-zone-active'
                : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
            {status === TASK_STATUS[0].status && (
              <div className="flex flex-col gap-2">
                <CreateTaskButton />
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
