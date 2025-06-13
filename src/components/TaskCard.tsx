import { Task, TASK_TAGS } from '../interfaces/task.interface';

export const TaskCard = ({ task }: { task: Task }) => {
  return (
    <div
      key={task.id}
      className="card-base bg-card dark:bg-black flex-col gap-2 relative overflow-hidden items-start"
    >
      {task.background && (
        <img
          src={task.background}
          alt="background"
          className="absolute top-0 left-0 w-full h-28 object-cover rounded-t-xl"
          style={{ zIndex: 0 }}
        />
      )}
      <div className={`relative z-10 w-full ${task.background ? 'mt-28' : ''}`}>
        <p className="text-sm mb-2 text-left">{task.title}</p>
        <div className="mt-2 flex flex-wrap gap-2 justify-start">
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
