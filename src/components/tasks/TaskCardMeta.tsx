import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/20/solid';
import type { Task } from '../../interfaces/task.interface';
import { formatRelativeCreatedAt } from '../../utils/relativeTime';

interface TaskCardMetaProps {
  task: Task;
  recent: boolean;
}

const commentLabel = (count: number, preview?: string) => {
  const n = `${count} comentario${count === 1 ? '' : 's'}`;
  const text = preview?.trim();
  return text ? `${n}: ${text}` : n;
};

const TIP_GAP = 8;
const TIP_H = 56;
const TIP_W = 224;

/** Icono + recuento a la izquierda del título. Tooltip en portal (no lo recorta la columna). */
export const TaskCommentBadge = ({ task }: { task: Task }) => {
  const commentCount = task.commentCount ?? 0;
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [tip, setTip] = useState<{ top: number; left: number; below: boolean } | null>(null);

  const preview = task.latestCommentPreview?.trim();
  const label = commentLabel(commentCount, preview);

  if (commentCount <= 0) return null;

  const showTip = () => {
    if (!preview) return;
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceAbove = r.top;
    const spaceBelow = window.innerHeight - r.bottom;
    const need = TIP_H + TIP_GAP;
    const below = spaceAbove < need && spaceBelow > spaceAbove;
    const left = Math.min(Math.max(8, r.left), window.innerWidth - TIP_W - 8);
    setTip({
      top: below ? r.bottom + TIP_GAP : r.top - TIP_GAP,
      left,
      below,
    });
  };

  return (
    <>
      <span
        ref={anchorRef}
        className="task-card__comment-badge relative inline-flex h-5 shrink-0 items-center gap-0.5 text-[10px] font-medium leading-none text-teal-700/90 dark:text-teal-400/90"
        aria-label={label}
        onMouseEnter={showTip}
        onMouseLeave={() => setTip(null)}
      >
        <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5 shrink-0" aria-hidden />
        <span className="tabular-nums">{commentCount}</span>
      </span>
      {tip && preview
        ? createPortal(
            <span
              role="tooltip"
              className="pointer-events-none fixed z-[80] w-max max-w-[14rem] rounded-lg px-2.5 py-1.5 text-left text-[11px] font-normal leading-snug shadow-lg ring-1 ring-[var(--border)]"
              style={{
                top: tip.top,
                left: tip.left,
                transform: tip.below ? undefined : 'translateY(-100%)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text)',
              }}
            >
              {preview}
            </span>,
            document.body
          )
        : null}
    </>
  );
};

export const TaskCardMeta = ({ task, recent }: TaskCardMetaProps) => {
  const relativeLabel = task.createdAt ? formatRelativeCreatedAt(task.createdAt) : null;
  if (!relativeLabel) return null;

  return (
    <div className="mt-1.5 flex items-center justify-end gap-2 min-w-0">
      <time
        className={`shrink-0 text-[11px] leading-snug tabular-nums ${
          recent ? 'text-teal-700 dark:text-teal-400 font-medium' : 'text-[var(--text-muted)]'
        }`}
        dateTime={task.createdAt}
        title={task.createdAt ? new Date(task.createdAt).toLocaleString('es') : undefined}
      >
        {relativeLabel}
      </time>
    </div>
  );
};
