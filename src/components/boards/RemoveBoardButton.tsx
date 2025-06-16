import { useBoardStore } from '../../stores/board.store';
import { useState } from 'react';
import { TrashIcon } from '@heroicons/react/20/solid';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const RemoveBoardButton = () => {
  const removeBoard = useBoardStore((state) => state.removeBoard);
  const [isOpen, setIsOpen] = useState(false);

  const handleRemove = () => {
    removeBoard();
    setIsOpen(false);
  };

  return (
    <>
      <button className="btn-remove w-full" onClick={() => setIsOpen(true)}>
        <span className="text-sm font-semibold">Remove board</span>
        <TrashIcon className="w-[18px] h-[18px]" />
      </button>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleRemove}
        title="Remove Board?"
        description="This action cannot be undone. All tasks associated with this board will be deleted."
        confirmText="Remove"
      />
    </>
  );
};
