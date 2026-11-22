import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Task } from '../../interfaces/task.interface';

const PREVIEW_COUNT = 3;
const POP_W = 220;

interface CollapsedColumnPreviewProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  columnName: string;
  columnColor: string;
  tasks: Task[];
}

/** Lista corta de tareas al pasar el ratón por una columna colapsada. */
export const CollapsedColumnPreview = ({
  open,
  anchorEl,
  columnName,
  columnColor,
  tasks,
}: CollapsedColumnPreviewProps) => {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const preview = tasks.slice(0, PREVIEW_COUNT);
  const more = Math.max(0, tasks.length - preview.length);

  useLayoutEffect(() => {
    if (!open || !anchorEl) {
      setPos(null);
      return;
    }
    const place = () => {
      const r = anchorEl.getBoundingClientRect();
      const left = Math.min(r.right + 8, window.innerWidth - POP_W - 8);
      const top = Math.min(Math.max(8, r.top), window.innerHeight - 160);
      setPos({ top, left: Math.max(8, left) });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, anchorEl]);

  if (!open || !pos) return null;

  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[85] rounded-xl border px-3 py-2.5 shadow-lg"
      style={{
        top: pos.top,
        left: pos.left,
        width: POP_W,
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--text)' }}>
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: columnColor }}
          aria-hidden
        />
        {columnName}
      </p>
      {preview.length === 0 ? (
        <p className="text-[11px] text-[var(--text-muted)]">Sin tareas</p>
      ) : (
        <ul className="space-y-1">
          {preview.map((task) => (
            <li
              key={task.id}
              className="truncate text-[12px] leading-snug"
              style={{ color: 'var(--text)' }}
            >
              {(task.title ?? '').trim() || 'Sin título'}
            </li>
          ))}
          {more > 0 ? (
            <li className="text-[11px] text-[var(--text-muted)]">+{more} más</li>
          ) : null}
        </ul>
      )}
    </div>,
    document.body
  );
};
