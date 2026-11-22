import { useRef, useState } from 'react';
import { ChatBubbleLeftEllipsisIcon, CheckCircleIcon } from '@heroicons/react/20/solid';
import type { Task } from '../../interfaces/task.interface';
import { formatRelativeCreatedAt } from '../../utils/relativeTime';
import { getStaleDaysInActiveColumn } from '../../utils/task-stale';
import { TaskCommentsPopover } from './TaskCommentsPopover';

interface TaskCardMetaProps {
  task: Task;
  recent: boolean;
}

const commentLabel = (count: number) =>
  `${count} comentario${count === 1 ? '' : 's'}. Abrir hilo`;

/** Icono + recuento: al hacer clic abre un popup tipo chat. */
export const TaskCommentBadge = ({ task }: { task: Task }) => {
  const commentCount = task.commentCount ?? 0;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  if (commentCount <= 0) return null;

  const title = (task.title ?? '').trim() || 'Sin título';

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="task-card__comment-badge relative inline-flex h-5 shrink-0 items-center gap-0.5 rounded-md text-[10px] font-medium leading-none text-teal-700/90 dark:text-teal-400/90 hover:bg-teal-500/10 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
        aria-label={commentLabel(commentCount)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Ver comentarios"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5 shrink-0" aria-hidden />
        <span className="tabular-nums">{commentCount}</span>
      </button>
      <TaskCommentsPopover
        taskId={task.id}
        taskTitle={title}
        columnId={task.columnId}
        anchorEl={buttonRef.current}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

/** Punto/aviso si lleva días en En progreso o Bloqueos. */
export const TaskStaleBadge = ({
  days,
  kind,
}: {
  days: number;
  kind: 'in-progress' | 'in-review';
}) => {
  const label =
    kind === 'in-review'
      ? `${days} día${days === 1 ? '' : 's'} en Bloqueos`
      : `${days} día${days === 1 ? '' : 's'} en progreso`;
  const tone =
    kind === 'in-review'
      ? 'bg-red-500/15 text-red-700 dark:text-red-300'
      : 'bg-amber-500/15 text-amber-800 dark:text-amber-200';

  return (
    <span
      className={`inline-flex h-5 shrink-0 items-center rounded-md px-1 text-[10px] font-semibold leading-none tabular-nums ${tone}`}
      aria-label={label}
      title={label}
    >
      {days}d
    </span>
  );
};

export const resolveTaskStale = (
  task: Task,
  columnSlug: string | null | undefined
): { days: number; kind: 'in-progress' | 'in-review' } | null => {
  const days = getStaleDaysInActiveColumn(
    columnSlug,
    task.columnChangedAt,
    task.createdAt
  );
  if (days == null) return null;
  if (columnSlug !== 'in-progress' && columnSlug !== 'in-review') return null;
  return { days, kind: columnSlug };
};

export const TaskChecklistBadge = ({ task }: { task: Task }) => {
  const total = task.checklistTotal ?? 0;
  const done = task.checklistDone ?? 0;
  if (total <= 0) return null;

  const complete = done === total;
  return (
    <span
      className={`inline-flex h-5 shrink-0 items-center gap-0.5 text-[10px] font-medium leading-none tabular-nums ${
        complete ? 'text-teal-700 dark:text-teal-400' : 'text-[var(--text-muted)]'
      }`}
      aria-label={`${done} de ${total} en el checklist`}
    >
      <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" aria-hidden />
      {done}/{total}
    </span>
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
