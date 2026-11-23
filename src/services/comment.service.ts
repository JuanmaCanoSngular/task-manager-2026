import { supabase } from './supabase';
import type { TaskComment } from '../interfaces/comment.interface';

const getSessionUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
};

type CommentRow = {
  id: string;
  task_id: number;
  body: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
};

type CommentSummaryRow = {
  task_id: number;
  body: string;
  created_at: string;
};

export type TaskCommentSummary = {
  count: number;
  latestPreview?: string;
};

const COMMENT_COLUMNS = 'id, task_id, body, created_at, updated_at, archived_at';

const rowToComment = (row: CommentRow): TaskComment => ({
  id: row.id,
  taskId: row.task_id,
  body: row.body,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  archivedAt: row.archived_at ?? null,
});

export const commentService = {
  /** Resumen de comentarios activos por tarea (conteo + último comentario). */
  async summariesByTaskIds(taskIds: number[]): Promise<Record<number, TaskCommentSummary>> {
    if (taskIds.length === 0) return {};

    const { data, error } = await supabase
      .from('task_comments')
      .select('task_id, body, created_at')
      .in('task_id', taskIds)
      .is('archived_at', null);
    if (error) throw error;

    const summaries: Record<number, TaskCommentSummary & { latestAt?: string }> = {};

    for (const row of (data ?? []) as CommentSummaryRow[]) {
      const current = summaries[row.task_id] ?? { count: 0 };
      current.count += 1;

      if (!current.latestAt || row.created_at > current.latestAt) {
        current.latestAt = row.created_at;
        current.latestPreview = row.body.trim();
      }

      summaries[row.task_id] = current;
    }

    const result: Record<number, TaskCommentSummary> = {};
    for (const [taskId, summary] of Object.entries(summaries)) {
      const preview = summary.latestPreview;
      result[Number(taskId)] = {
        count: summary.count,
        latestPreview:
          preview && preview.length > 80 ? `${preview.slice(0, 77)}…` : preview,
      };
    }

    return result;
  },

  /** Lista activos + archivados (orden de creación). */
  async listByTask(taskId: number): Promise<TaskComment[]> {
    const { data, error } = await supabase
      .from('task_comments')
      .select(COMMENT_COLUMNS)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToComment);
  },

  async create(taskId: number, body: string): Promise<TaskComment> {
    const userId = await getSessionUserId();
    if (!userId) {
      throw new Error('Inicia sesión para añadir comentarios');
    }

    const trimmed = body.trim();
    if (!trimmed) throw new Error('El comentario no puede estar vacío');

    const { data, error } = await supabase
      .from('task_comments')
      .insert({ task_id: taskId, user_id: userId, body: trimmed })
      .select(COMMENT_COLUMNS)
      .single();
    if (error) throw error;
    return rowToComment(data);
  },

  async update(commentId: string, body: string): Promise<TaskComment> {
    const trimmed = body.trim();
    if (!trimmed) throw new Error('El comentario no puede estar vacío');

    const { data, error } = await supabase
      .from('task_comments')
      .update({ body: trimmed, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .select(COMMENT_COLUMNS)
      .single();
    if (error) throw error;
    return rowToComment(data);
  },

  async archive(commentId: string): Promise<TaskComment> {
    const { data, error } = await supabase
      .from('task_comments')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', commentId)
      .select(COMMENT_COLUMNS)
      .single();
    if (error) throw error;
    return rowToComment(data);
  },

  async unarchive(commentId: string): Promise<TaskComment> {
    const { data, error } = await supabase
      .from('task_comments')
      .update({ archived_at: null })
      .eq('id', commentId)
      .select(COMMENT_COLUMNS)
      .single();
    if (error) throw error;
    return rowToComment(data);
  },

  async delete(commentId: string): Promise<void> {
    const { error } = await supabase.from('task_comments').delete().eq('id', commentId);
    if (error) throw error;
  },
};
