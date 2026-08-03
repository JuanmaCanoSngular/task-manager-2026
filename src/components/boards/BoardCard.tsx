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

  const handleDelete = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
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

  const handleDeleteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDelete(e);
    }
  };

  return (
    <>
      <div
        key={board.id}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="listitem"
        aria-label={`${isActive ? 'Deseleccionar' : 'Seleccionar'} tablero ${board.name}`}
        aria-pressed={isActive}
        className={`card-base ${isActive ? 'card-active' : 'card-hover'} relative group cursor-pointer py-2.5 px-3 gap-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset`}
      >
        {isActive && (
          <button
            onClick={handleDelete}
            onKeyDown={handleDeleteKeyDown}
            tabIndex={0}
            className="absolute top-1.5 right-1.5 z-20 btn-icon-remove p-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            aria-label={`Eliminar tablero ${board.name}`}
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        )}

        <span
          className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: board.color }}
          aria-hidden="true"
        />
        <h2 className="text-sm font-medium truncate">{board.name}</h2>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          removeBoard();
          setIsDeleteDialogOpen(false);
        }}
        title="¿Eliminar tablero?"
        description="Esta acción no se puede deshacer. Se eliminarán todas las tareas asociadas a este tablero."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
};
