import { useTaskStore } from '../stores/task.store';
import { TaskCard } from './TaskCard';
import { TASK_STATUS } from '../interfaces/task.interface';
import { AddNewTask } from './AddNewTask';

export const BoardContent = () => {
  const { currentBoard } = useTaskStore();

  if (!currentBoard) return null;

  return (
    <div className="w-full h-full shadow-xl dark:bg-card-dark rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
        {TASK_STATUS.map(({ status, label, color }) => {
          const tasks = currentBoard.tasks?.filter((task) => task.status === status) ?? [];

          return (
            <div key={status}>
              <h3 className="font-bold text-lg mb-2 flex items-center">
                <span className={`${color} rounded-full w-2 h-2 mr-2 inline-block`}></span>
                {label} ({tasks.length})
              </h3>
              <div className="flex flex-col gap-4">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
              {status === TASK_STATUS[0].status && <AddNewTask />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
