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
        aria-label="Remove current board"
      >
        <h2 className="text-xl">Remove board</h2>
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
        title="Remove Board?"
        description="This action cannot be undone. All tasks associated with this board will be deleted."
        confirmText="Remove"
        cancelText="Cancel"
      />
    </>
  );
};
