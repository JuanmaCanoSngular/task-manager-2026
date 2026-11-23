import {
  PointerEvent as ReactPointerEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ArchiveBoxIcon,
  ArrowUturnLeftIcon,
  TrashIcon,
} from '@heroicons/react/20/solid';

export const COMMENT_SWIPE_WIDTH = 76;
export const COMMENT_SWIPE_COMMIT = COMMENT_SWIPE_WIDTH * 0.55;

type SwipeAction = 'delete' | 'archive';

interface SwipeableCommentProps {
  disabled?: boolean;
  onDelete: () => void;
  onArchive: () => void;
  children: ReactNode;
  className?: string;
}

/** Resuelve acción a partir del desplazamiento horizontal. */
export const resolveSwipeAction = (offset: number): SwipeAction | null => {
  if (offset >= COMMENT_SWIPE_COMMIT) return 'delete';
  if (offset <= -COMMENT_SWIPE_COMMIT) return 'archive';
  return null;
};

/**
 * Swipe: derecha → eliminar (papelera), izquierda → archivar.
 */
export const SwipeableComment = ({
  disabled = false,
  onDelete,
  onArchive,
  children,
  className = '',
}: SwipeableCommentProps) => {
  const [offset, setOffset] = useState(0);
  const [animating, setAnimating] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startOffset = useRef(0);
  const locked = useRef<'h' | 'v' | null>(null);
  const offsetRef = useRef(0);
  const draggingRef = useRef(false);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  const settle = useCallback(
    (value: number) => {
      const action = resolveSwipeAction(value);
      setOffset(0);
      offsetRef.current = 0;
      if (action === 'delete') onDelete();
      if (action === 'archive') onArchive();
    },
    [onArchive, onDelete]
  );

  const begin = (clientX: number, clientY: number) => {
    if (disabled) return;
    startX.current = clientX;
    startY.current = clientY;
    startOffset.current = offsetRef.current;
    locked.current = null;
    draggingRef.current = true;
    setAnimating(true);
  };

  const move = (clientX: number, clientY: number) => {
    if (!draggingRef.current) return;
    const dx = clientX - startX.current;
    const dy = clientY - startY.current;

    if (!locked.current) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      locked.current = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
      if (locked.current === 'v') {
        draggingRef.current = false;
        setAnimating(false);
        return;
      }
    }
    if (locked.current !== 'h') return;

    const next = Math.max(
      -COMMENT_SWIPE_WIDTH,
      Math.min(COMMENT_SWIPE_WIDTH, startOffset.current + dx)
    );
    offsetRef.current = next;
    setOffset(next);
  };

  const end = () => {
    if (!draggingRef.current) return;
    const wasHorizontal = locked.current === 'h';
    const finalOffset = offsetRef.current;
    draggingRef.current = false;
    setAnimating(false);
    locked.current = null;
    if (wasHorizontal) settle(finalOffset);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button != null && e.button !== 0) return;
    begin(e.clientX, e.clientY);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* jsdom */
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    move(e.clientX, e.clientY);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    end();
  };

  const reveal: SwipeAction | null =
    offset > 8 ? 'delete' : offset < -8 ? 'archive' : null;

  return (
    <div
      className={`relative overflow-hidden rounded-xl select-none touch-pan-y ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      <div
        className="absolute inset-y-0 left-0 flex w-[76px] items-center justify-center bg-red-500 text-white"
        aria-hidden
        style={{ opacity: reveal === 'delete' ? 1 : 0.35 }}
      >
        <div className="flex flex-col items-center gap-0.5 text-[10px] font-semibold">
          <TrashIcon className="h-4 w-4" />
          Eliminar
        </div>
      </div>
      <div
        className="absolute inset-y-0 right-0 flex w-[76px] items-center justify-center bg-amber-500 text-white"
        aria-hidden
        style={{ opacity: reveal === 'archive' ? 1 : 0.35 }}
      >
        <div className="flex flex-col items-center gap-0.5 text-[10px] font-semibold">
          <ArchiveBoxIcon className="h-4 w-4" />
          Archivar
        </div>
      </div>

      <div
        role="group"
        aria-label="Desliza a la derecha para eliminar, a la izquierda para archivar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`relative z-[1] ${animating ? '' : 'transition-transform duration-200 ease-out'}`}
        style={{
          transform: `translateX(${offset}px)`,
          backgroundColor: 'var(--surface-2)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

interface BinCommentActionsProps {
  disabled?: boolean;
  onRestore: () => void;
  onPurge: () => void;
}

export const BinCommentActions = ({
  disabled = false,
  onRestore,
  onPurge,
}: BinCommentActionsProps) => (
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
      onClick={onPurge}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
      aria-label="Eliminar definitivamente"
      title="Eliminar definitivamente"
    >
      <TrashIcon className="h-3.5 w-3.5" />
    </button>
  </div>
);
