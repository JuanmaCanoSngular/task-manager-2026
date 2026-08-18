import { supabase } from './supabase';
import {
  BoardColumn,
  BoardColumnDraft,
  columnDefsForKind,
  rowToColumn,
  sortColumns,
} from '../interfaces/column.interface';
import type { BoardKind } from '../interfaces/board.interface';

interface ColumnRow {
  id: number;
  board_id: number;
  name: string;
  color: string;
  position: number;
  slug: string | null;
  is_inbox: boolean;
}

const getSessionUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
};

export const columnService = {
  async fetchColumnsForBoards(boardIds: number[]): Promise<Map<number, BoardColumn[]>> {
    if (boardIds.length === 0) return new Map();

    const { data, error } = await supabase
      .from('board_columns')
      .select('*')
      .in('board_id', boardIds)
      .order('position', { ascending: true });

    if (error) throw error;

    const byBoard = new Map<number, BoardColumn[]>();
    for (const row of (data ?? []) as ColumnRow[]) {
      const col = rowToColumn(row);
      const list = byBoard.get(col.boardId) ?? [];
      list.push(col);
      byBoard.set(col.boardId, list);
    }
    for (const [id, cols] of byBoard) {
      byBoard.set(id, sortColumns(cols));
    }
    return byBoard;
  },

  async seedDefaultColumns(boardId: number, kind: BoardKind = 'kanban'): Promise<BoardColumn[]> {
    const userId = await getSessionUserId();
    const rows = columnDefsForKind(kind).map((def) => ({
      board_id: boardId,
      user_id: userId,
      name: def.name,
      color: def.color,
      position: def.position,
      slug: def.slug,
      is_inbox: def.isInbox,
    }));

    const { data, error } = await supabase.from('board_columns').insert(rows).select('*');
    if (error) throw error;

    return sortColumns(((data ?? []) as ColumnRow[]).map(rowToColumn));
  },

  async insertColumn(boardId: number, draft: BoardColumnDraft): Promise<BoardColumn> {
    const userId = await getSessionUserId();

    const { data: existing } = await supabase
      .from('board_columns')
      .select('position')
      .eq('board_id', boardId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition =
      existing && existing.length > 0
        ? ((existing[0] as { position: number }).position ?? 0) + 1
        : 0;

    const row: Record<string, unknown> = {
      board_id: boardId,
      name: draft.name.trim(),
      color: draft.color,
      position: nextPosition,
      slug: null,
      is_inbox: false,
    };
    if (userId) row.user_id = userId;

    const { data, error } = await supabase.from('board_columns').insert(row).select('*').single();
    if (error) throw error;

    return rowToColumn(data as ColumnRow);
  },

  async updateColumn(
    columnId: number,
    patch: Partial<Pick<BoardColumn, 'name' | 'color' | 'position'>>
  ): Promise<void> {
    const row: Record<string, unknown> = {};
    if (patch.name !== undefined) row.name = patch.name.trim();
    if (patch.color !== undefined) row.color = patch.color;
    if (patch.position !== undefined) row.position = patch.position;

    const { error } = await supabase.from('board_columns').update(row).eq('id', columnId);
    if (error) throw error;
  },

  async deleteColumn(columnId: number): Promise<void> {
    const { error } = await supabase.from('board_columns').delete().eq('id', columnId);
    if (error) throw error;
  },

  async saveColumnOrder(rows: { id: number; position: number }[]): Promise<void> {
    const results = await Promise.all(
      rows.map((row) =>
        supabase.from('board_columns').update({ position: row.position }).eq('id', row.id)
      )
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
  },
};
