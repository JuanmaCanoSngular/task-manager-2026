import { useState } from 'react';
import { PlusCircleIcon } from '@heroicons/react/20/solid';
import { BoardModal } from './board-modal/BoardModal';
import { useBoardStore } from '../../stores/board.store';

export const AddNewBoardButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addNewBoard = useBoardStore((state) => state.addNewBoard);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (name: string, emoji: string, color: string) => {
    addNewBoard(name, emoji, color);
    handleCloseModal();
  };

  return (
    <>
      <button onClick={handleOpenModal} className="btn-add w-full" aria-label="Add new board">
        <h2 className="text-xl">Add new board</h2>
        <span className="flex items-center justify-center w-6 h-6">
          <PlusCircleIcon className="w-6 h-6 text-current" />
        </span>
      </button>

      <BoardModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} />
    </>
  );
};
