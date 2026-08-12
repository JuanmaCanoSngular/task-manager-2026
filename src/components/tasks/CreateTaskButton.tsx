import { useState } from 'react';
import { TaskModal } from './task-modal/TaskModal';
import { useBoardStore } from '../../stores/board.store';
import { TaskDraft } from '../../interfaces/task.interface';
import { PlusIcon } from '@heroicons/react/20/solid';
import { TagsManagerDialog } from '../tags/TagsManagerDialog';

export const CreateTaskButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [manageTagsOpen, setManageTagsOpen] = useState(false);
  const currentBoardId = useBoardStore((state) => state.currentBoardId);
  const addNewTask = useBoardStore((state) => state.addNewTask);
  const disabled = currentBoardId === null;

  const handleSubmit = (taskData: TaskDraft) => {
    void addNewTask(taskData);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        disabled={disabled}
        className="btn-add w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Añadir nueva tarea"
        title={disabled ? 'Selecciona un tablero primero' : 'Añadir nueva tarea'}
      >
        <span>Añadir nueva tarea</span>
        <PlusIcon className="w-4 h-4" />
      </button>

      <TaskModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode="create"
        onSubmit={handleSubmit}
        onManageTags={() => setManageTagsOpen(true)}
      />
      <TagsManagerDialog open={manageTagsOpen} onClose={() => setManageTagsOpen(false)} />
    </>
  );
};
