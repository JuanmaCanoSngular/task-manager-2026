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

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-add w-full" aria-label="Add new task">
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
