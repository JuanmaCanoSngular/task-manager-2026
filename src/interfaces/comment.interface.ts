export interface TaskComment {
  id: string;
  taskId: number;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskCommentDraft = Pick<TaskComment, 'body'>;

export const MAX_COMMENT_LENGTH = 2000;
