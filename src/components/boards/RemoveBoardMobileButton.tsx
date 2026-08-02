import { useState } from 'react';
import { TrashIcon } from '@heroicons/react/20/solid';
import { useBoardStore } from '../../stores/board.store';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const RemoveBoardMobileButton = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const currentBoardId = useBoardStore((state) => state.currentBoardId);
  const removeBoard = useBoardStore((state) => state.removeBoard);

  if (currentBoardId === null) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsDeleteDialogOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsDeleteDialogOpen(true)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="btn-remove w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset"
        aria-label="Eliminar el tablero actual"
      >
        <h2 className="text-xl">Eliminar tablero</h2>
        <span className="flex items-center justify-center w-6 h-6">
          <TrashIcon className="w-6 h-6 text-current" />
        </span>
      </button>

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
