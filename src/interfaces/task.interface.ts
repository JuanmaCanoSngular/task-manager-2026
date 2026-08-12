export interface Task {
  id: number;
  title: string;
  columnId: number;
  /** IDs de filas en `tags` (UUID como string). */
  tags: string[];
  /** URL https de imagen externa (no hospedamos archivos). */
  background?: string;
  /** ISO timestamptz de creación (Supabase `created_at`). */
  createdAt?: string;
}

/** Campos editables al crear/actualizar (sin id ni timestamps). */
export type TaskDraft = Omit<Task, 'id' | 'createdAt'>;
