import { useRef, useState } from 'react';
import { ChatBubbleLeftEllipsisIcon, CheckCircleIcon } from '@heroicons/react/20/solid';
import type { Task } from '../../interfaces/task.interface';
import { formatRelativeCreatedAt } from '../../utils/relativeTime';
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
        anchorEl={buttonRef.current}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
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
