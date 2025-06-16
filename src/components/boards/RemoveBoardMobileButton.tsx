import { useState } from 'react';
import { TrashIcon } from '@heroicons/react/20/solid';
import { useBoardStore } from '../../stores/board.store';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const RemoveBoardMobileButton = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const currentBoardId = useBoardStore((state) => state.currentBoardId);
  const removeBoard = useBoardStore((state) => state.removeBoard);

  if (!currentBoardId) return null;

  return (
    <>
      <button
        onClick={() => setIsDeleteDialogOpen(true)}
        className="btn-remove w-full"
        title="Remove board"
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
