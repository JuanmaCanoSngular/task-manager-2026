import { useState } from 'react';
import { Task, TASK_TAGS } from '../../interfaces/task.interface';
import { TaskModal } from './task-modal/TaskModal';
import { useBoardStore } from '../../stores/board.store';

export const TaskCard = ({ task }: { task: Task }) => {
  const [isOpen, setIsOpen] = useState(false);
  const updateTask = useBoardStore((state) => state.updateTask);

  const handleSubmit = (data: Omit<Task, 'id'>) => {
    updateTask(task.id, data);
    setIsOpen(false);
  };

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="card-base bg-card dark:bg-black flex-col gap-2 relative overflow-hidden items-start cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
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
          <p className="text-sm mb-2 text-left">
            #{task.id} {task.title}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 justify-start">
            {task.tags.map((tag, index) => {
              const tagInfo = TASK_TAGS.find((t) => t.tag === tag);
              if (!tagInfo) return null;

              return (
                <span key={index} className={`tag-base ${tagInfo.bgColor} ${tagInfo.textColor}`}>
                  {tagInfo.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode="edit"
        task={task}
        onSubmit={handleSubmit}
      />
    </>
  );
};
