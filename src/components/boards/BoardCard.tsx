import { useState } from 'react';
import { Board } from '../../interfaces/board.interface';
import { useBoardStore } from '../../stores/board.store';
import { TrashIcon } from '@heroicons/react/20/solid';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface BoardCardProps {
  board: Board;
}

export const BoardCard = ({ board }: BoardCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const currentBoardId = useBoardStore((state) => state.currentBoardId);
  const fetchBoardDetails = useBoardStore((state) => state.fetchBoardDetails);
  const removeBoard = useBoardStore((state) => state.removeBoard);
  const isActive = currentBoardId === board.id;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se seleccione el board
    setIsDeleteDialogOpen(true);
  };

  const handleClick = () => {
    if (isActive) {
      useBoardStore.setState({ currentBoardId: null });
    } else {
      fetchBoardDetails(board.link, board.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <>
      <div
        key={board.id}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${isActive ? 'Deselect' : 'Select'} board ${board.name}`}
        aria-pressed={isActive}
        className={`card-base ${isActive ? 'card-active' : 'card-hover'} relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset`}
      >
        {isActive && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 z-20 btn-remove bg-black/50 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-black/70"
            aria-label={`Delete board ${board.name}`}
          >
            <TrashIcon className="w-4 h-4 text-white" />
          </button>
        )}

        <span
          className="flex items-center justify-center w-10 h-10 rounded-full text-xl"
          style={{ backgroundColor: board.color }}
          aria-hidden="true"
        >
          {board.emoji}
        </span>
        <h2 className="text-lg">{board.name}</h2>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          removeBoard();
          setIsDeleteDialogOpen(false);
        }}
        title="Remove Board?"
        description="This action cannot be undone. All tasks associated with this board will be deleted."
        confirmText="Remove"
        cancelText="Cancel"
      />
    </>
  );
};
