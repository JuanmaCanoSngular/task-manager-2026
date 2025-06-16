import { TaskCard } from '../tasks/TaskCard';
import { TASK_STATUS } from '../../interfaces/task.interface';
import { useBoardStore } from '../../stores/board.store';
import { CreateTaskButton } from '../tasks/CreateTaskButton';

export const BoardContent = () => {
  const tasks = useBoardStore((state) => state.currentBoardTasks);
  const currentBoardId = useBoardStore((state) => state.currentBoardId);

  if (currentBoardId === null) {
    return;
  }

  return (
    <div className="w-full h-full shadow-xl dark:bg-card-dark rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
        {TASK_STATUS.map(({ status, label, color }) => {
          const filteredTasks = tasks?.filter((task) => task.status === status) ?? [];

          return (
            <div key={status}>
              <h3 className="font-bold text-lg mb-2 flex items-center">
                <span className={`${color} rounded-full w-2 h-2 mr-2 inline-block`}></span>
                {label} ({filteredTasks.length})
              </h3>
              <div className="flex flex-col gap-4">
                {filteredTasks.map((task) => (
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
        })}
      </div>
    </div>
  );
};
