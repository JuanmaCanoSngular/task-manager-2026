export const TASK_STATUS = [
  { status: 'backlog', label: 'Pendiente', color: 'bg-gray-500' },
  { status: 'in-progress', label: 'En progreso', color: 'bg-yellow-300' },
  { status: 'in-review', label: 'Bloqueos', color: 'bg-red-500' },
  { status: 'completed', label: 'Completada', color: 'bg-green-400' },
] as const;

export type TaskStatus = (typeof TASK_STATUS)[number]['status'];

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  /** IDs de filas en `tags` (UUID como string). */
  tags: string[];
  /** URL https de imagen externa (no hospedamos archivos). */
  background?: string;
  /** ISO timestamptz de creación (Supabase `created_at`). */
  createdAt?: string;
}

/** Campos editables al crear/actualizar (sin id ni timestamps). */
export type TaskDraft = Omit<Task, 'id' | 'createdAt'>;
