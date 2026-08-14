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
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-transparent text-[var(--text-muted)] hover:text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-teal-500/40"
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
