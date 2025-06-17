import { TASK_STATUS } from '../../interfaces/task.interface';
import { StatusColumn } from './StatusColumn';

export const BoardContent = () => {
  return (
    <div className="w-full h-full shadow-xl dark:bg-card-dark rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
        {TASK_STATUS.map(({ status, label, color }) => (
          <StatusColumn key={status} status={status} label={label} color={color} />
        ))}
      </div>
    </div>
  );
};
