import { useState } from 'react';
import { TagIcon } from '@heroicons/react/20/solid';
import { TagsManagerDialog } from './TagsManagerDialog';

const authEnabled = () => import.meta.env.VITE_AUTH_ENABLED === 'true';

interface TagsManagerButtonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Abrir gestor de etiquetas. Solo con auth (etiquetas por tablero). */
export const TagsManagerButton = ({ open: openProp, onOpenChange }: TagsManagerButtonProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  if (!authEnabled() && openProp === undefined) return null;

  return (
    <>
      {authEnabled() ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-secondary p-2 flex items-center justify-center flex-shrink-0"
          aria-label="Gestionar etiquetas"
          title="Gestionar etiquetas"
        >
          <TagIcon className="w-4 h-4" aria-hidden />
        </button>
      ) : null}
      <TagsManagerDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};
