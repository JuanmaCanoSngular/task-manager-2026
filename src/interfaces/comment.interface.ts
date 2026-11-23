export interface TaskComment {
  id: string;
  taskId: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  /** ISO timestamptz si está archivado; null/undefined = no archivado. */
  archivedAt?: string | null;
  /** ISO timestamptz si está en papelera; null/undefined = no eliminado. */
  deletedAt?: string | null;
}

export type TaskCommentDraft = Pick<TaskComment, 'body'>;

export const MAX_COMMENT_LENGTH = 2000;

export const isCommentArchived = (comment: TaskComment): boolean =>
  Boolean(comment.archivedAt) && !comment.deletedAt;

export const isCommentTrashed = (comment: TaskComment): boolean =>
  Boolean(comment.deletedAt);

/** En papelera: archivados o eliminados (recuperables). */
export const isCommentInBin = (comment: TaskComment): boolean =>
  Boolean(comment.archivedAt) || Boolean(comment.deletedAt);

export const activeComments = (list: TaskComment[]): TaskComment[] =>
  list.filter((c) => !isCommentInBin(c));

export const binComments = (list: TaskComment[]): TaskComment[] =>
  list.filter((c) => isCommentInBin(c));

/** @deprecated prefer binComments */
export const archivedComments = (list: TaskComment[]): TaskComment[] =>
  list.filter((c) => isCommentArchived(c) || isCommentTrashed(c));
