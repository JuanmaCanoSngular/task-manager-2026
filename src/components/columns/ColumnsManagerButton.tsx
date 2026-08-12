import { useEffect, useState } from 'react';
import { PlusIcon, ViewColumnsIcon } from '@heroicons/react/20/solid';
import { ColumnsManagerDialog } from './ColumnsManagerDialog';

interface ColumnsManagerButtonProps {
  boardId: number;
}

export const ColumnsManagerButton = ({ boardId }: ColumnsManagerButtonProps) => {
  const [open, setOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const showSuccess = (message: string) => {
    setOpen(false);
    setSuccessMessage(message);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary p-2 flex items-center gap-0.5"
        aria-label="Gestionar columnas"
        title="Gestionar columnas"
      >
        <ViewColumnsIcon className="w-4 h-4" aria-hidden />
        <PlusIcon className="w-3.5 h-3.5" aria-hidden />
      </button>
      <ColumnsManagerDialog
        boardId={boardId}
        open={open}
        onClose={() => setOpen(false)}
        onColumnCreated={(name) => showSuccess(`Columna «${name}» creada`)}
        onColumnDeleted={(name) => showSuccess(`Columna «${name}» eliminada`)}
      />
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900 shadow-lg dark:border-teal-700 dark:bg-teal-900/40 dark:text-teal-100"
        >
          {successMessage}
        </div>
      )}
    </>
  );
};
