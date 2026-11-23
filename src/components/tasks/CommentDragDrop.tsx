import { DragEvent, ReactNode, useCallback, useState } from 'react';
import {
  ArchiveBoxIcon,
  ArrowUturnLeftIcon,
  TrashIcon,
} from '@heroicons/react/20/solid';

export const COMMENT_DND_MIME = 'application/x-taskblero-comment';

type DropAction = 'archive' | 'delete';

export const startCommentDrag = (e: DragEvent, commentId: string) => {
  const dt = e.dataTransfer;
  if (!dt) return;
  try {
    dt.setData(COMMENT_DND_MIME, commentId);
    dt.setData('text/plain', commentId);
    dt.effectAllowed = 'move';
  } catch {
    /* jsdom / entornos sin DnD completo */
  }
};

export const readCommentDragId = (e: DragEvent): string | null => {
  const dt = e.dataTransfer;
  if (!dt) return null;
  try {
    return dt.getData(COMMENT_DND_MIME) || dt.getData('text/plain') || null;
  } catch {
    return null;
  }
};

const canAcceptComment = (e: DragEvent) =>
  Array.from(e.dataTransfer.types).some(
    (t) => t === COMMENT_DND_MIME || t === 'text/plain'
  );

interface CommentDropZonesProps {
  visible: boolean;
  disabled?: boolean;
  onArchive: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}

/** Zonas Archivar / Eliminar; visibles al arrastrar un comentario. */
export const CommentDropZones = ({
  visible,
  disabled = false,
  onArchive,
  onDelete,
}: CommentDropZonesProps) => {
  const [over, setOver] = useState<DropAction | null>(null);

  const makeHandlers = (action: DropAction, run: (id: string) => void) => ({
    onDragOver: (e: DragEvent) => {
      if (disabled || !canAcceptComment(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setOver(action);
    },
    onDragLeave: () => setOver((cur) => (cur === action ? null : cur)),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setOver(null);
      if (disabled) return;
      const id = readCommentDragId(e);
      if (id) run(id);
    },
  });

  if (!visible) return null;

  return (
    <div
      className="grid grid-cols-2 gap-2 pt-2"
      role="group"
      aria-label="Soltar comentario para archivar o eliminar"
    >
      <div
        {...makeHandlers('archive', onArchive)}
        className={`flex min-h-[3rem] flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-2 py-2 text-center text-[11px] font-semibold transition-colors ${
          over === 'archive'
            ? 'border-amber-500 bg-amber-500/15 text-amber-800 dark:text-amber-200'
            : 'border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-300'
        }`}
      >
        <ArchiveBoxIcon className="h-4 w-4" aria-hidden />
        Archivar
      </div>
      <div
        {...makeHandlers('delete', onDelete)}
        className={`flex min-h-[3rem] flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-2 py-2 text-center text-[11px] font-semibold transition-colors ${
          over === 'delete'
            ? 'border-red-500 bg-red-500/15 text-red-800 dark:text-red-200'
            : 'border-red-500/40 bg-red-500/5 text-red-700 dark:text-red-300'
        }`}
      >
        <TrashIcon className="h-4 w-4" aria-hidden />
        Eliminar
      </div>
    </div>
  );
};

interface DraggableCommentShellProps {
  commentId: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  onDragActiveChange?: (active: boolean) => void;
}

/** Envuelve un comentario para arrastrarlo a las zonas de acción. */
export const DraggableCommentShell = ({
  commentId,
  disabled = false,
  className = '',
  children,
  onDragActiveChange,
}: DraggableCommentShellProps) => {
  const handleStart = useCallback(
    (e: DragEvent) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      startCommentDrag(e, commentId);
      onDragActiveChange?.(true);
    },
    [commentId, disabled, onDragActiveChange]
  );

  const handleEnd = useCallback(() => {
    onDragActiveChange?.(false);
  }, [onDragActiveChange]);

  return (
    <div
      draggable={!disabled}
      onDragStart={handleStart}
      onDragEnd={handleEnd}
      className={`${disabled ? '' : 'cursor-grab active:cursor-grabbing'} ${className}`}
    >
      {children}
    </div>
  );
};

interface ArchivedCommentActionsProps {
  disabled?: boolean;
  onRestore: () => void;
  onDelete: () => void;
}

export const ArchivedCommentActions = ({
  disabled = false,
  onRestore,
  onDelete,
}: ArchivedCommentActionsProps) => (
  <div className="flex items-center gap-0.5">
    <button
      type="button"
      disabled={disabled}
      onClick={onRestore}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:text-teal-700 dark:hover:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
      aria-label="Restaurar comentario"
      title="Restaurar"
    >
      <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
    </button>
    <button
      type="button"
      disabled={disabled}
      onClick={onDelete}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
      aria-label="Eliminar comentario"
      title="Eliminar"
    >
      <TrashIcon className="h-3.5 w-3.5" />
    </button>
  </div>
);
