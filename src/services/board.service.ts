import { supabase } from './supabase';
import { Board, parseBoardKind } from '../interfaces/board.interface';
import { BoardColumn, sortColumns } from '../interfaces/column.interface';
import { Task, TaskDraft } from '../interfaces/task.interface';
import { columnService } from './column.service';
import { commentService } from './comment.service';
import { checklistService } from './checklist.service';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface TaskRow {
  id: number;
  board_id: number;
  title: string;
  status: string;
  column_id: number | null;
  pinned?: boolean | null;
  tags: string[];
  position: number;
  created_at?: string | null;
  column_changed_at?: string | null;
}

interface BoardRow {
  id: number;
  name: string;
  emoji: string;
  color: string;
  is_default?: boolean | null;
  kind?: string | null;
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
  title: row.title ?? '',
  columnId: row.column_id ?? 0,
  tags: row.tags ?? [],
  ...(row.pinned ? { pinned: true } : {}),
  createdAt: row.created_at ?? undefined,
  ...(row.column_changed_at ? { columnChangedAt: row.column_changed_at } : {}),
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

const isMissingKindColumn = (error: { message?: string; code?: string }) => {
  const msg = error.message ?? '';
  return error.code === 'PGRST204' || /'?kind'?/i.test(msg);
};

export type TaskRealtimeHandlers = {
  onInsert: (boardId: number, task: Task) => void;
  onUpdate: (boardId: number, task: Task) => void;
  onDelete: (taskId: number) => void;
};

export const boardService = {
  async purgeStaleShoppingItems(): Promise<void> {
    const { error } = await supabase.rpc('purge_stale_shopping_items');
    if (error) {
      const msg = error.message ?? '';
      if (error.code === 'PGRST202' || /purge_stale_shopping_items/i.test(msg)) return;
      throw error;
    }
  },

  async getBoards(): Promise<Board[]> {
    try {
      await boardService.purgeStaleShoppingItems();
    } catch {
      /* RPC o columna aún no migrados */
    }

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

    for (const board of boardRows) {
      if (!columnsByBoard.has(board.id) || columnsByBoard.get(board.id)!.length === 0) {
        try {
          const seeded = await columnService.seedDefaultColumns(
            board.id,
            parseBoardKind(board.kind)
          );
          columnsByBoard.set(board.id, seeded);
        } catch {
          /* tabla aún no migrada; el front mostrará tablero vacío de columnas */
        }
      }
    }

    const taskRows = (tasks ?? []) as TaskRow[];
    const allTaskIds = taskRows.map((row) => row.id);

    let commentSummaries: Awaited<ReturnType<typeof commentService.summariesByTaskIds>> = {};
    try {
      commentSummaries = await commentService.summariesByTaskIds(allTaskIds);
    } catch {
      /* tabla task_comments aún no migrada */
    }

    let checklistSummaries: Awaited<ReturnType<typeof checklistService.summariesByTaskIds>> = {};
    try {
      checklistSummaries = await checklistService.summariesByTaskIds(allTaskIds);
    } catch {
      /* tabla task_checklist_items aún no migrada */
    }

    const tasksByBoard = new Map<number, Task[]>();
    for (const row of taskRows) {
      const task = rowToTask(row);
      const summary = commentSummaries[row.id];
      if (summary?.count) {
        task.commentCount = summary.count;
        task.latestCommentPreview = summary.latestPreview;
      }
      const checks = checklistSummaries[row.id];
      if (checks?.total) {
        task.checklistTotal = checks.total;
        task.checklistDone = checks.done;
      }
      const list = tasksByBoard.get(row.board_id) ?? [];
      list.push(task);
      tasksByBoard.set(row.board_id, list);
    }

    return boardRows.map((board) => ({
      id: board.id,
      name: board.name,
      emoji: board.emoji,
      color: board.color,
      link: '',
      isDefault: Boolean(board.is_default),
      kind: parseBoardKind(board.kind),
      columns: sortColumns(columnsByBoard.get(board.id) ?? []),
      tasks: tasksByBoard.get(board.id) ?? [],
    }));
  },

  async insertBoard(
    board: Pick<Board, 'name' | 'emoji' | 'color' | 'isDefault' | 'kind'>
  ): Promise<Board> {
    const userId = await getSessionUserId();
    const kind = parseBoardKind(board.kind);
    const row: Record<string, unknown> = {
      name: board.name,
      emoji: board.emoji,
      color: board.color,
      is_default: board.isDefault,
      kind,
    };
    if (userId) row.user_id = userId;

    let { data, error } = await supabase.from('boards').insert(row).select('*').single();
    if (error && isMissingKindColumn(error)) {
      delete row.kind;
      const retry = await supabase.from('boards').insert(row).select('*').single();
      data = retry.data;
      error = retry.error;
    }
    if (error) throw error;

    const boardId = data.id as number;
    const columns = await columnService.seedDefaultColumns(boardId, kind);

    return {
      id: boardId,
      name: data.name as string,
      emoji: data.emoji as string,
      color: data.color as string,
      link: '',
      isDefault: Boolean(data.is_default),
      kind,
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
    task: TaskDraft & { pinned?: boolean },
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
      tags: task.tags,
      position,
    };
    if (task.pinned) row.pinned = true;
    if (userId) row.user_id = userId;

    const { data, error } = await supabase.from('tasks').insert(row).select('*').single();
    if (error) throw error;

    const created = rowToTask(data as TaskRow);
    const labels = (task.checklistItems ?? [])
      .map((label) => label.trim())
      .filter((label) => label.length > 0);
    if (labels.length > 0) {
      try {
        const items = await checklistService.addMany(created.id, labels);
        created.checklistTotal = items.length;
        created.checklistDone = 0;
      } catch {
        /* tabla checklist aún no migrada */
      }
    }
    return created;
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
        tags: task.tags,
      })
      .eq('id', taskId);
    if (error) {
      throw error;
    }
  },

  async setTaskPinned(taskId: number, pinned: boolean): Promise<void> {
    const { error } = await supabase.from('tasks').update({ pinned }).eq('id', taskId);
    if (error) {
      const msg = error.message || '';
      if (/pinned/i.test(msg) || error.code === 'PGRST204') {
        throw new Error(
          'No se pudo anclar la tarea: falta la columna pinned. Ejecuta supabase/add-task-pinned.sql en Supabase.'
        );
      }
      throw error;
    }
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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' }, (payload) => {
        const row = payload.new as TaskRow;
        if (!row?.id || row.board_id == null) return;
        handlers.onInsert(row.board_id, rowToTask(row));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, (payload) => {
        const row = payload.new as TaskRow;
        if (!row?.id || row.board_id == null) return;
        handlers.onUpdate(row.board_id, rowToTask(row));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks' }, (payload) => {
        const row = payload.old as Partial<TaskRow>;
        if (row?.id == null) return;
        handlers.onDelete(row.id);
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },
};

export type { ColumnRow };
