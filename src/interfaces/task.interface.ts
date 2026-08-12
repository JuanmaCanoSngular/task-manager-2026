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
  /** Número de comentarios en la tarea (carga del tablero). */
  commentCount?: number;
  /** Primeros caracteres del comentario más reciente (tooltip en tarjeta). */
  latestCommentPreview?: string;
}

/** Campos editables al crear/actualizar (sin id ni timestamps). */
export type TaskDraft = Omit<Task, 'id' | 'createdAt'>;
