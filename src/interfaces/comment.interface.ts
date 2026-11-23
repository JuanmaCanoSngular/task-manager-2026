export interface TaskComment {
  id: string;
  taskId: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  /** ISO timestamptz si está archivado; null/undefined = activo. */
  archivedAt?: string | null;
}

export type TaskCommentDraft = Pick<TaskComment, 'body'>;

export const MAX_COMMENT_LENGTH = 2000;

export const isCommentArchived = (comment: TaskComment): boolean =>
  Boolean(comment.archivedAt);

export const activeComments = (list: TaskComment[]): TaskComment[] =>
  list.filter((c) => !isCommentArchived(c));

export const archivedComments = (list: TaskComment[]): TaskComment[] =>
  list.filter((c) => isCommentArchived(c));
