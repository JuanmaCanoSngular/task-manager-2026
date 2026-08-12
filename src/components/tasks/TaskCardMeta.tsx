import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/20/solid';
import type { Task } from '../../../interfaces/task.interface';
import { formatRelativeCreatedAt } from '../../utils/relativeTime';

interface TaskCardMetaProps {
  task: Task;
  recent: boolean;
}

export const TaskCardMeta = ({ task, recent }: TaskCardMetaProps) => {
  const commentCount = task.commentCount ?? 0;
  const hasComments = commentCount > 0;
  const relativeLabel = task.createdAt ? formatRelativeCreatedAt(task.createdAt) : null;

  if (!hasComments && !relativeLabel) return null;

  const commentTitle = hasComments
    ? `${commentCount} comentario${commentCount === 1 ? '' : 's'}${
        task.latestCommentPreview ? `: ${task.latestCommentPreview}` : ''
      }`
    : undefined;

  return (
    <div className="mt-1.5 flex items-center justify-between gap-2 min-w-0">
      {hasComments ? (
        <span
          className="inline-flex items-center gap-1 min-w-0 text-[11px] font-medium text-teal-700/90 dark:text-teal-400/90"
          title={commentTitle}
        >
          <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5 shrink-0" aria-hidden />
          <span className="tabular-nums shrink-0">{commentCount}</span>
          {task.latestCommentPreview && (
            <span className="truncate font-normal opacity-75 hidden sm:inline max-w-[7rem] md:max-w-[9rem]">
              {task.latestCommentPreview}
            </span>
          )}
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
