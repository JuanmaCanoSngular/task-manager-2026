import { supabase } from './supabase';
import type { ChecklistItem } from '../interfaces/checklist.interface';
import { MAX_CHECKLIST_ITEM_LENGTH, MAX_CHECKLIST_ITEMS } from '../interfaces/checklist.interface';

type ItemRow = {
  id: string;
  task_id: number;
  title: string;
  done: boolean;
  position: number;
};

export type ChecklistSummary = {
  total: number;
  done: number;
};

const rowToItem = (row: ItemRow): ChecklistItem => ({
  id: row.id,
  taskId: row.task_id,
  title: row.title,
  done: Boolean(row.done),
  position: row.position ?? 0,
});

const sanitizeTitle = (title: string) => title.trim().slice(0, MAX_CHECKLIST_ITEM_LENGTH);

export const checklistService = {
  async summariesByTaskIds(taskIds: number[]): Promise<Record<number, ChecklistSummary>> {
    if (taskIds.length === 0) return {};

    const { data, error } = await supabase
      .from('task_checklist_items')
      .select('task_id, done')
      .in('task_id', taskIds);
    if (error) throw error;

    const summaries: Record<number, ChecklistSummary> = {};
    for (const row of (data ?? []) as { task_id: number; done: boolean }[]) {
      const current = summaries[row.task_id] ?? { total: 0, done: 0 };
      current.total += 1;
      if (row.done) current.done += 1;
      summaries[row.task_id] = current;
    }
    return summaries;
  },

  async listByTask(taskId: number): Promise<ChecklistItem[]> {
    const { data, error } = await supabase
      .from('task_checklist_items')
      .select('id, task_id, title, done, position')
      .eq('task_id', taskId)
      .order('position', { ascending: true });
    if (error) throw error;
    return ((data ?? []) as ItemRow[]).map(rowToItem);
  },

  async addMany(taskId: number, titles: string[]): Promise<ChecklistItem[]> {
    const rows = titles
      .map((title, index) => ({ title: sanitizeTitle(title), position: index }))
      .filter((row) => row.title.length >= 1)
      .slice(0, MAX_CHECKLIST_ITEMS)
      .map((row) => ({
        task_id: taskId,
        title: row.title,
        done: false,
        position: row.position,
      }));
    if (rows.length === 0) return [];

    const { data, error } = await supabase
      .from('task_checklist_items')
      .insert(rows)
      .select('id, task_id, title, done, position')
      .order('position', { ascending: true });
    if (error) throw error;
    return ((data ?? []) as ItemRow[]).map(rowToItem);
  },

  async add(taskId: number, title: string, position: number): Promise<ChecklistItem> {
    const trimmed = sanitizeTitle(title);
    if (!trimmed) throw new Error('El ítem no puede estar vacío');

    const { data, error } = await supabase
      .from('task_checklist_items')
      .insert({ task_id: taskId, title: trimmed, done: false, position })
      .select('id, task_id, title, done, position')
      .single();
    if (error) throw error;
    return rowToItem(data as ItemRow);
  },

  async setDone(id: string, done: boolean): Promise<ChecklistItem> {
    const { data, error } = await supabase
      .from('task_checklist_items')
      .update({ done })
      .eq('id', id)
      .select('id, task_id, title, done, position')
      .single();
    if (error) throw error;
    return rowToItem(data as ItemRow);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('task_checklist_items').delete().eq('id', id);
    if (error) throw error;
  },
};
