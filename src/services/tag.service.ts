import { supabase } from './supabase';
import { DEFAULT_TAGS, type Tag } from '../interfaces/tag.interface';

const getSessionUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
};

const rowToTag = (row: { id: string; name: string; color: string }): Tag => ({
  id: row.id,
  name: row.name,
  color: row.color,
});

const defaultsInflight = new Map<number, Promise<Tag[]>>();

export const tagService = {
  async listTags(boardId: number): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name, color')
      .eq('board_id', boardId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToTag);
  },

  /** Si el tablero no tiene etiquetas, inserta Urgente / Importante / Idea. */
  async ensureDefaults(boardId: number): Promise<Tag[]> {
    const pending = defaultsInflight.get(boardId);
    if (pending) return pending;

    const run = (async () => {
      const existing = await tagService.listTags(boardId);
      if (existing.length > 0) return existing;

      const userId = await getSessionUserId();
      if (!userId) return existing;

      const { data, error } = await supabase
        .from('tags')
        .insert(
          DEFAULT_TAGS.map((t) => ({
            user_id: userId,
            board_id: boardId,
            name: t.name,
            color: t.color,
          }))
        )
        .select('id, name, color');
      if (error) {
        const again = await tagService.listTags(boardId);
        if (again.length > 0) return again;
        throw error;
      }
      return (data ?? []).map(rowToTag);
    })().finally(() => {
      defaultsInflight.delete(boardId);
    });

    defaultsInflight.set(boardId, run);
    return run;
  },

  async createTag(boardId: number, name: string, color: string): Promise<Tag> {
    const userId = await getSessionUserId();
    if (!userId) throw new Error('No autenticado');
    const trimmed = name.trim();
    if (!trimmed) throw new Error('El nombre no puede estar vacío');

    const { data, error } = await supabase
      .from('tags')
      .insert({ user_id: userId, board_id: boardId, name: trimmed, color })
      .select('id, name, color')
      .single();
    if (error) throw error;
    return rowToTag(data);
  },

  async updateTag(id: string, patch: { name?: string; color?: string }): Promise<void> {
    const row: Record<string, string> = {};
    if (patch.name !== undefined) row.name = patch.name.trim();
    if (patch.color !== undefined) row.color = patch.color;
    if (!Object.keys(row).length) return;

    const { error } = await supabase.from('tags').update(row).eq('id', id);
    if (error) throw error;
  },

  async deleteTag(id: string): Promise<void> {
    const { error } = await supabase.from('tags').delete().eq('id', id);
    if (error) throw error;

    // Quita la etiqueta de las tareas que la tenían.
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, tags')
      .contains('tags', [id]);
    if (tasksError) throw tasksError;

    await Promise.all(
      (tasks ?? []).map((task) =>
        supabase
          .from('tasks')
          .update({ tags: (task.tags as string[]).filter((t) => t !== id) })
          .eq('id', task.id)
      )
    );
  },
};
