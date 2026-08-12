import { useState } from 'react';
import { TagIcon } from '@heroicons/react/20/solid';
import { TagsManagerDialog } from './TagsManagerDialog';

const authEnabled = () => import.meta.env.VITE_AUTH_ENABLED === 'true';

/** Abrir gestor de etiquetas. Solo con auth (etiquetas por usuario). */
export const TagsManagerButton = () => {
  const [open, setOpen] = useState(false);

  if (!authEnabled()) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary text-sm p-2 sm:px-3 sm:py-1.5 flex items-center justify-center"
        aria-label="Gestionar etiquetas"
        title="Gestionar etiquetas"
      >
        <TagIcon className="w-4 h-4 sm:hidden" aria-hidden />
        <span className="hidden sm:inline">Etiquetas</span>
      </button>
      <TagsManagerDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};
