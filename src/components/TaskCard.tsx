import { Task, TASK_TAGS } from '../interfaces/task.interface';

export const TaskCard = ({ task }: { task: Task }) => {
  return (
    <div
      key={task.id}
      className="bg-card text-light dark:bg-black dark:text-dark p-4 rounded-xl shadow-md flex flex-col gap-2 relative overflow-hidden border border-transparent hover:border-primary dark:hover:border-primary-dark transition-colors duration-300"
    >
      {task.background && (
        <img
          src={task.background}
          alt="background"
          className="absolute top-0 left-0 w-full h-28 object-cover rounded-t-xl"
          style={{ zIndex: 0 }}
        />
      )}
      <div className={task.background ? 'relative z-10 mt-28' : ''}>
        <p className="text-sm mb-2">{task.title}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {task.tags.map((tag, index) => {
            const tagInfo = TASK_TAGS.find((t) => t.tag === tag);
            if (!tagInfo) return null;

            return (
              <span
                key={index}
                className={`px-2 py-1 text-xs rounded font-medium shadow-sm ${tagInfo.bgColor} ${tagInfo.textColor}`}
              >
                {tagInfo.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
