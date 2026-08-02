import { supabase } from './supabase';
import { Board } from '../interfaces/board.interface';
import { Task, TaskStatus, TaskTag } from '../interfaces/task.interface';

// Fila tal cual vive en la tabla `tasks` de Supabase.
interface TaskRow {
  id: number;
  board_id: number;
  title: string;
  status: string;
  background: string | null;
  tags: string[];
  position: number;
}

interface BoardRow {
  id: number;
  name: string;
  emoji: string;
  color: string;
}

const rowToTask = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  status: row.status as TaskStatus,
  tags: (row.tags ?? []) as TaskTag[],
  background: row.background ?? undefined,
});

export const boardService = {
  // Carga todos los tableros con sus tareas ya anidadas y ordenadas.
  async getBoards(): Promise<Board[]> {
    const [{ data: boards, error: boardsError }, { data: tasks, error: tasksError }] =
      await Promise.all([
        supabase.from('boards').select('*').order('created_at', { ascending: true }),
        supabase.from('tasks').select('*').order('position', { ascending: true }),
      ]);

    if (boardsError) throw boardsError;
    if (tasksError) throw tasksError;

    const tasksByBoard = new Map<number, Task[]>();
    for (const row of (tasks ?? []) as TaskRow[]) {
      const list = tasksByBoard.get(row.board_id) ?? [];
      list.push(rowToTask(row));
      tasksByBoard.set(row.board_id, list);
    }

    return ((boards ?? []) as BoardRow[]).map((board) => ({
      id: board.id,
      name: board.name,
      emoji: board.emoji,
      color: board.color,
      link: '',
      tasks: tasksByBoard.get(board.id) ?? [],
    }));
  },

  async insertBoard(board: Pick<Board, 'id' | 'name' | 'emoji' | 'color'>): Promise<void> {
    const { error } = await supabase.from('boards').insert({
      id: board.id,
      name: board.name,
      emoji: board.emoji,
      color: board.color,
    });
    if (error) throw error;
  },

  async deleteBoard(id: number): Promise<void> {
    const { error } = await supabase.from('boards').delete().eq('id', id);
    if (error) throw error;
  },

  async insertTask(boardId: number, task: Task, position: number): Promise<void> {
    const { error } = await supabase.from('tasks').insert({
      id: task.id,
      board_id: boardId,
      title: task.title,
      status: task.status,
      background: task.background ?? null,
      tags: task.tags,
      position,
    });
    if (error) throw error;
  },

  async updateTask(taskId: number, task: Omit<Task, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({
        title: task.title,
        status: task.status,
        background: task.background ?? null,
        tags: task.tags,
      })
      .eq('id', taskId);
    if (error) throw error;
  },

  async deleteTask(taskId: number): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw error;
  },

  // Persiste el nuevo orden y estado tras un drag & drop.
  // Update por fila: upsert fallaría por columnas NOT NULL (title) no incluidas.
  async saveTaskOrder(
    rows: { id: number; status: TaskStatus; position: number }[]
  ): Promise<void> {
    const results = await Promise.all(
      rows.map((row) =>
        supabase.from('tasks').update({ status: row.status, position: row.position }).eq('id', row.id)
      )
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
  },
};
