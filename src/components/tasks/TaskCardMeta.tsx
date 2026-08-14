import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/20/solid';
import type { Task } from '../../interfaces/task.interface';
import { formatRelativeCreatedAt } from '../../utils/relativeTime';

interface TaskCardMetaProps {
  task: Task;
  recent: boolean;
}

export const TaskCardMeta = ({ task, recent }: TaskCardMetaProps) => {
  const commentCount = task.commentCount ?? 0;
  const hasComments = commentCount > 0;
  const relativeLabel = task.createdAt ? formatRelativeCreatedAt(task.createdAt) : null;
  const preview = task.latestCommentPreview?.trim();

  if (!hasComments && !relativeLabel) return null;

  const commentTitle = hasComments
    ? `${commentCount} comentario${commentCount === 1 ? '' : 's'}${preview ? `: ${preview}` : ''}`
    : undefined;

  return (
    <div className="mt-1.5 flex items-center justify-between gap-2 min-w-0">
      {hasComments ? (
        <span
          className="group/comment relative inline-flex items-center gap-1 min-w-0 text-[11px] font-medium text-teal-700/90 dark:text-teal-400/90"
          title={commentTitle}
        >
          <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5 shrink-0" aria-hidden />
          <span className="tabular-nums shrink-0">{commentCount}</span>
          {preview ? (
            <span
              role="tooltip"
              className="pointer-events-none absolute left-0 bottom-[calc(100%+8px)] z-40 hidden w-max max-w-[14rem] rounded-lg px-2.5 py-1.5 text-left text-[11px] font-normal leading-snug shadow-lg ring-1 ring-[var(--border)] group-hover/comment:block"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text)' }}
            >
              {preview}
            </span>
          ) : null}
        </span>
      ) : (
        <span aria-hidden />
      )}
      {relativeLabel && (
        <time
          className={`shrink-0 text-[11px] leading-snug tabular-nums ${
            recent ? 'text-teal-700 dark:text-teal-400 font-medium' : 'text-[var(--text-muted)]'
          }`}
          dateTime={task.createdAt}
          title={task.createdAt ? new Date(task.createdAt).toLocaleString('es') : undefined}
        >
          {relativeLabel}
        </time>
      )}
    </div>
  );
};
