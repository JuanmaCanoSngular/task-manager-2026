import { supabase } from './supabase';
import { Board } from '../interfaces/board.interface';
import { BoardColumn, sortColumns } from '../interfaces/column.interface';
import { Task } from '../interfaces/task.interface';
import { columnService } from './column.service';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface TaskRow {
  id: number;
  board_id: number;
  title: string;
  status: string;
  column_id: number | null;
  background: string | null;
  tags: string[];
  position: number;
  created_at?: string | null;
}

interface BoardRow {
  id: number;
  name: string;
  emoji: string;
  color: string;
  is_default?: boolean | null;
}

interface ColumnRow {
  id: number;
  board_id: number;
  name: string;
  color: string;
  position: number;
  slug: string | null;
  is_inbox: boolean;
}

export const rowToTask = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  columnId: row.column_id ?? 0,
  tags: row.tags ?? [],
  background: row.background ?? undefined,
  createdAt: row.created_at ?? undefined,
});

const slugForColumn = (columns: BoardColumn[], columnId: number): string | null => {
  const col = columns.find((c) => c.id === columnId);
  return col?.slug ?? null;
};

/** UID de la sesión actual (null si auth off / sin login). Necesario para RLS por user_id. */
const getSessionUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
};

export type TaskRealtimeHandlers = {
  onInsert: (boardId: number, task: Task) => void;
  onUpdate: (boardId: number, task: Task) => void;
  onDelete: (taskId: number) => void;
};

export const boardService = {
  async getBoards(): Promise<Board[]> {
    const [{ data: boards, error: boardsError }, { data: tasks, error: tasksError }] =
      await Promise.all([
        supabase.from('boards').select('*').order('created_at', { ascending: true }),
        supabase.from('tasks').select('*').order('position', { ascending: true }),
      ]);

    if (boardsError) throw boardsError;
    if (tasksError) throw tasksError;

    const boardRows = (boards ?? []) as BoardRow[];
    const boardIds = boardRows.map((b) => b.id);

    const columnsByBoard = await columnService.fetchColumnsForBoards(boardIds);

    for (const boardId of boardIds) {
      if (!columnsByBoard.has(boardId) || columnsByBoard.get(boardId)!.length === 0) {
        try {
          const seeded = await columnService.seedDefaultColumns(boardId);
          columnsByBoard.set(boardId, seeded);
        } catch {
          /* tabla aún no migrada; el front mostrará tablero vacío de columnas */
        }
      }
    }

    const tasksByBoard = new Map<number, Task[]>();
    for (const row of (tasks ?? []) as TaskRow[]) {
      const list = tasksByBoard.get(row.board_id) ?? [];
      list.push(rowToTask(row));
      tasksByBoard.set(row.board_id, list);
    }

    return boardRows.map((board) => ({
      id: board.id,
      name: board.name,
      emoji: board.emoji,
      color: board.color,
      link: '',
      isDefault: Boolean(board.is_default),
      columns: sortColumns(columnsByBoard.get(board.id) ?? []),
      tasks: tasksByBoard.get(board.id) ?? [],
    }));
  },

  async insertBoard(
    board: Pick<Board, 'name' | 'emoji' | 'color' | 'isDefault'>
  ): Promise<Board> {
    const userId = await getSessionUserId();
    const row: Record<string, unknown> = {
      name: board.name,
      emoji: board.emoji,
      color: board.color,
      is_default: board.isDefault,
    };
    if (userId) row.user_id = userId;

    const { data, error } = await supabase.from('boards').insert(row).select('*').single();
    if (error) throw error;

    const boardId = data.id as number;
    const columns = await columnService.seedDefaultColumns(boardId);

    return {
      id: boardId,
      name: data.name as string,
      emoji: data.emoji as string,
      color: data.color as string,
      link: '',
      isDefault: Boolean(data.is_default),
      columns,
      tasks: [],
    };
  },

  async deleteBoard(id: number): Promise<void> {
    const { error } = await supabase.from('boards').delete().eq('id', id);
    if (error) throw error;
  },

  async updateBoard(id: number, data: { name: string; color: string }): Promise<void> {
    const { error } = await supabase
      .from('boards')
      .update({ name: data.name, color: data.color })
      .eq('id', id);
    if (error) throw error;
  },

  async setDefaultBoard(id: number): Promise<void> {
    const { error: clearError } = await supabase
      .from('boards')
      .update({ is_default: false })
      .neq('id', id);
    if (clearError) throw clearError;

    const { error } = await supabase.from('boards').update({ is_default: true }).eq('id', id);
    if (error) throw error;
  },

  async insertTask(
    boardId: number,
    task: Omit<Task, 'id' | 'createdAt'>,
    position: number,
    columns: BoardColumn[]
  ): Promise<Task> {
    const userId = await getSessionUserId();
    const slug = slugForColumn(columns, task.columnId);
    const row: Record<string, unknown> = {
      board_id: boardId,
      title: task.title,
      column_id: task.columnId,
      status: slug ?? 'backlog',
      background: task.background?.trim() || null,
      tags: task.tags,
      position,
    };
    if (userId) row.user_id = userId;

    const { data, error } = await supabase.from('tasks').insert(row).select('*').single();
    if (error) throw error;

    return rowToTask(data as TaskRow);
  },

  async updateTask(
    taskId: number,
    task: Omit<Task, 'id' | 'createdAt'>,
    columns: BoardColumn[]
  ): Promise<void> {
    const slug = slugForColumn(columns, task.columnId);
    const { error } = await supabase
      .from('tasks')
      .update({
        title: task.title,
        column_id: task.columnId,
        status: slug ?? 'backlog',
        background: task.background?.trim() || null,
        tags: task.tags,
      })
      .eq('id', taskId);
    if (error) throw error;
  },

  async deleteTask(taskId: number): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw error;
  },

  async moveTasksToColumn(
    fromColumnId: number,
    toColumnId: number,
    columns: BoardColumn[]
  ): Promise<void> {
    const slug = slugForColumn(columns, toColumnId);
    const { error } = await supabase
      .from('tasks')
      .update({ column_id: toColumnId, status: slug ?? 'backlog' })
      .eq('column_id', fromColumnId);
    if (error) throw error;
  },

  async saveTaskOrder(rows: { id: number; columnId: number; position: number }[]): Promise<void> {
    const results = await Promise.all(
      rows.map((row) =>
        supabase
          .from('tasks')
          .update({ column_id: row.columnId, position: row.position })
          .eq('id', row.id)
      )
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
  },

  subscribeTasks(handlers: TaskRealtimeHandlers): () => void {
    const channel: RealtimeChannel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks' },
        (payload) => {
          const row = payload.new as TaskRow;
          if (!row?.id || row.board_id == null) return;
          handlers.onInsert(row.board_id, rowToTask(row));
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tasks' },
        (payload) => {
          const row = payload.new as TaskRow;
          if (!row?.id || row.board_id == null) return;
          handlers.onUpdate(row.board_id, rowToTask(row));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'tasks' },
        (payload) => {
          const row = payload.old as Partial<TaskRow>;
          if (row?.id == null) return;
          handlers.onDelete(row.id);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },
};

export type { ColumnRow };
