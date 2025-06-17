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
    <div>
      <h3 className="font-bold text-lg mb-2 flex items-center">
        <span className={`${color} rounded-full w-2 h-2 mr-2 inline-block`}></span>
        {label} ({tasks.length})
      </h3>
      <div className="flex flex-col gap-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
      {status === TASK_STATUS[0].status && (
        <div className="flex flex-col gap-2 mt-5">
          <CreateTaskButton />
        </div>
      )}
    </div>
  );
};
