import { useState } from 'react';
import { TaskModal } from './task-modal/TaskModal';
import { useBoardStore } from '../../stores/board.store';
import { Task } from '../../interfaces/task.interface';
import { PlusIcon } from '@heroicons/react/20/solid';

export const CreateTaskButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const addNewTask = useBoardStore((state) => state.addNewTask);

  const handleSubmit = (taskData: Omit<Task, 'id'>) => {
    addNewTask(taskData);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="btn-add w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        aria-label="Add new task"
      >
        <span>Add new task</span>
        <PlusIcon className="w-4 h-4" />
      </button>

      <TaskModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode="create"
        onSubmit={handleSubmit}
      />
    </>
  );
};
