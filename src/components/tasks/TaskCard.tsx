import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task, TASK_TAGS } from '../../interfaces/task.interface';
import { TaskModal } from './task-modal/TaskModal';
import { useBoardStore } from '../../stores/board.store';
import { TrashIcon } from '@heroicons/react/20/solid';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface TaskCardProps {
  task: Task;
  index: number;
}

export const TaskCard = ({ task, index }: TaskCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const updateTask = useBoardStore((state) => state.updateTask);
  const removeTask = useBoardStore((state) => state.removeTask);

  const handleSubmit = (data: Omit<Task, 'id'>) => {
    updateTask(task.id, data);
    setIsOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se abra el modal de edición
    setIsDeleteDialogOpen(true);
  };

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <>
      <Draggable draggableId={task.id.toString()} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`Edit task: ${task.title}`}
            className={`card-base bg-card dark:bg-black flex-col gap-2 relative overflow-hidden items-start cursor-pointer hover:bg-slate-100/80 dark:hover:bg-white/5 hover:shadow-md group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset card-move-transition drag-handle ${
              snapshot.isDragging ? 'card-dragging' : ''
            }`}
            style={{
              ...provided.draggableProps.style,
            }}
          >
            <button
              onClick={handleDelete}
              className="absolute top-2 right-2 z-20 btn-remove opacity-0 group-hover:opacity-100 bg-black/50 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-black/70"
              aria-label={`Delete task: ${task.title}`}
            >
              <TrashIcon className="w-4 h-4 text-white" />
            </button>

            {task.background && (
              <img
                src={task.background}
                alt="Task background"
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
                      className={`tag-base ${tagInfo.bgColor} ${tagInfo.textColor}`}
                    >
                      {tagInfo.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Draggable>

      <TaskModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode="edit"
        task={task}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          removeTask(task.id);
          setIsDeleteDialogOpen(false);
        }}
        title="Remove Task?"
        description="Are you sure you want to remove this task? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
      />
    </>
  );
};
