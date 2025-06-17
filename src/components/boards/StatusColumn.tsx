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
      <h2 className="font-bold text-lg mb-2 flex items-center flex-shrink-0">
        <span
          className={`${color} rounded-full w-2 h-2 mr-2 inline-block`}
          aria-hidden="true"
        ></span>
        {label} ({tasks.length})
      </h2>
      <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {status === TASK_STATUS[0].status && (
          <div className="flex flex-col gap-2">
            <CreateTaskButton />
          </div>
        )}
      </div>
    </div>
  );
};
