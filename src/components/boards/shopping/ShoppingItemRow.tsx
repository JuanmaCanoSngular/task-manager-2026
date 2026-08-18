import { useRef, useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { resolveShoppingSwipe, SHOPPING_SWIPE_MAX } from './shopping-swipe';

export type ShoppingItemMode = 'buy' | 'bought' | 'discarded';

interface ShoppingItemRowProps {
  title: string;
  mode: ShoppingItemMode;
  onBought?: () => void;
  onDiscarded?: () => void;
  onRestore?: () => void;
}

const isControlTarget = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest('button'));

export const ShoppingItemRow = ({
  title,
  mode,
  onBought,
  onDiscarded,
  onRestore,
}: ShoppingItemRowProps) => {
  const [dx, setDx] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<'x' | 'y' | null>(null);
  const dxRef = useRef(0);
  const capturing = useRef(false);
  const canSwipe = mode === 'buy' && Boolean(onBought || onDiscarded);
  const checked = mode === 'bought';
  const onToggle = mode === 'buy' ? onBought : onRestore;

  const reset = (el?: HTMLElement | null, pointerId?: number) => {
    if (capturing.current && el && pointerId !== undefined) {
      el.releasePointerCapture?.(pointerId);
    }
    capturing.current = false;
    start.current = null;
    axis.current = null;
    dxRef.current = 0;
    setDx(0);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canSwipe) return;
    if (isControlTarget(e.target)) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY };
    axis.current = null;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canSwipe || !start.current) return;
    const mx = e.clientX - start.current.x;
    const my = e.clientY - start.current.y;
    if (!axis.current) {
      if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
      axis.current = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
      if (axis.current === 'x') {
        capturing.current = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }
    }
    if (axis.current !== 'x') return;
    const clamped = Math.max(-SHOPPING_SWIPE_MAX, Math.min(SHOPPING_SWIPE_MAX, mx));
    dxRef.current = clamped;
    setDx(clamped);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canSwipe) return;
    const finalDx = dxRef.current;
    if (axis.current === 'x') {
      const action = resolveShoppingSwipe(finalDx);
      if (action === 'bought') onBought?.();
      else if (action === 'discarded') onDiscarded?.();
    }
    reset(e.currentTarget, e.pointerId);
  };

  const settled =
    mode === 'bought'
      ? 'line-through text-emerald-800 dark:text-emerald-300'
      : mode === 'discarded'
        ? 'line-through text-slate-400 dark:text-slate-500'
        : 'text-[var(--text)]';

  return (
    <div className="relative overflow-hidden rounded-xl" data-testid="shopping-item">
      {canSwipe && dx !== 0 ? (
        <div
          className={`absolute inset-0 flex items-center px-4 text-sm font-semibold text-white ${
            dx > 0 ? 'justify-start bg-emerald-500' : 'justify-end bg-slate-500'
          }`}
          aria-hidden
        >
          {dx > 0 ? 'Comprado' : 'Descartar'}
        </div>
      ) : null}
      <div
        className="relative flex items-center gap-1 min-h-[3.25rem] pl-1.5 pr-1.5 py-1.5 touch-pan-y select-none"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '0.75rem',
          transform: dx ? `translateX(${dx}px)` : undefined,
          transition: dx === 0 ? 'transform 160ms ease-out' : undefined,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={(e) => reset(e.currentTarget, e.pointerId)}
      >
        {onToggle ? (
          <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={`inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 ${
              checked
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
            aria-label={checked ? `Devolver ${title} a la lista` : `Marcar ${title} como comprado`}
            title={checked ? 'Devolver a la lista' : 'Comprado'}
          >
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-md border-2 ${
                checked
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-slate-300 bg-white dark:border-slate-500 dark:bg-transparent'
              }`}
              aria-hidden
            >
              {checked ? <CheckIcon className="w-4 h-4" /> : null}
            </span>
          </button>
        ) : null}
        <p className={`flex-1 min-w-0 text-base font-medium leading-snug ${settled}`}>{title}</p>
        {mode === 'buy' && onDiscarded ? (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDiscarded();
            }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
            aria-label={`Descartar ${title}`}
            title="Descartar"
          >
            <XMarkIcon className="w-5 h-5" aria-hidden />
          </button>
        ) : mode === 'discarded' && onRestore ? (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRestore();
            }}
            className="inline-flex h-11 items-center rounded-xl px-2.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-950/40 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            aria-label={`Devolver ${title} a la lista`}
          >
            Devolver
          </button>
        ) : null}
      </div>
    </div>
  );
};
