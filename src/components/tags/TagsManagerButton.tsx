import { useState } from 'react';
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
        className="btn-secondary text-sm px-3 py-1.5"
        aria-label="Gestionar etiquetas"
      >
        Etiquetas
      </button>
      <TagsManagerDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};
