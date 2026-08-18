import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/20/solid';
import { BoardModal } from './board-modal/BoardModal';
import { useBoardStore } from '../../stores/board.store';
import { BoardKind } from '../../interfaces/board.interface';

export const AddNewBoardButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addNewBoard = useBoardStore((state) => state.addNewBoard);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (name: string, color: string, kind?: BoardKind) => {
    void addNewBoard(name, color, kind);
    handleCloseModal();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpenModal();
    }
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="w-full flex items-center justify-center py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400 hover:text-teal-600 hover:border-teal-400 dark:hover:text-teal-300 dark:hover:border-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset"
        aria-label="Añadir nuevo tablero"
        title="Añadir nuevo tablero"
      >
        <PlusIcon className="w-5 h-5" aria-hidden="true" />
      </button>

      <BoardModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} />
    </>
  );
};
