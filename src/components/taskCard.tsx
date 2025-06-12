import { Task } from '../interfaces/task.interface';

export const TaskCard = ({ task }: { task: Task }) => {
  return (
    <div
      key={task.id}
      className="bg-card text-text dark:bg-card-dark dark:text-text-dark p-4 rounded-xl shadow-md flex flex-col gap-2 min-h-[150px] relative overflow-hidden border border-transparent hover:border-primary dark:hover:border-primary-dark transition-colors duration-300"
    >
      {task.background && (
        <img
          src={task.background}
          alt="background"
          className="absolute top-0 left-0 w-full h-28 object-cover rounded-t-xl opacity-60"
          style={{ zIndex: 0 }}
        />
      )}
      <div className={task.background ? 'relative z-10 mt-28' : ''}>
        <h3 className="font-semibold text-lg mb-1 truncate">{task.title}</h3>
        <p className="text-gray-300 text-sm mb-2 truncate">{task.title}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-[#313543] text-primary dark:text-primary-dark text-xs rounded font-medium shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
