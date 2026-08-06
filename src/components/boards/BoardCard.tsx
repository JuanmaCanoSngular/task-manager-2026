import { useState } from 'react';
import { Board } from '../../interfaces/board.interface';
import { useBoardStore } from '../../stores/board.store';
import { TrashIcon, PencilIcon } from '@heroicons/react/20/solid';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { BoardModal } from './board-modal/BoardModal';

interface BoardCardProps {
  board: Board;
}

export const BoardCard = ({ board }: BoardCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const currentBoardId = useBoardStore((state) => state.currentBoardId);
  const fetchBoardDetails = useBoardStore((state) => state.fetchBoardDetails);
  const removeBoard = useBoardStore((state) => state.removeBoard);
  const updateBoard = useBoardStore((state) => state.updateBoard);
  const isActive = currentBoardId === board.id;

  const handleDelete = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setIsEditOpen(true);
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

  const keyActivate = (handler: (e: React.KeyboardEvent) => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler(e);
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
        style={
          isActive
            ? { backgroundColor: `${board.color}1f`, borderColor: `${board.color}66` }
            : undefined
        }
        className={`card-base ${isActive ? '' : 'card-hover'} relative group cursor-pointer py-2.5 px-3 gap-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset ${
          isActive ? 'pr-16' : ''
        }`}
      >
        {isActive && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 flex items-center gap-0.5">
            <button
              onClick={handleEdit}
              onKeyDown={keyActivate(handleEdit)}
              tabIndex={0}
              className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              aria-label={`Editar tablero ${board.name}`}
            >
              <PencilIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              onKeyDown={keyActivate(handleDelete)}
              tabIndex={0}
              className="p-1 rounded-md text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              aria-label={`Eliminar tablero ${board.name}`}
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <span
          className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: board.color }}
          aria-hidden="true"
        />
        <h2 className="text-sm font-medium truncate">{board.name}</h2>
      </div>

      <BoardModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        mode="edit"
        initialName={board.name}
        initialColor={board.color}
        onSubmit={(name, color) => {
          updateBoard(board.id, name, color);
          setIsEditOpen(false);
        }}
      />

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
