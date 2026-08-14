export interface Task {
  id: number;
  title: string;
  columnId: number;
  /** IDs de filas en `tags` (UUID como string). */
  tags: string[];
  /** Anclada arriba de su columna (orden fijo respecto a no ancladas). */
  pinned?: boolean;
  /** ISO timestamptz de creación (Supabase `created_at`). */
  createdAt?: string;
  /** Número de comentarios en la tarea (carga del tablero). */
  commentCount?: number;
  /** Primeros caracteres del comentario más reciente (tooltip en tarjeta). */
  latestCommentPreview?: string;
}

/** Campos editables al crear/actualizar (sin id ni metadatos de solo-lectura). */
export type TaskDraft = Omit<
  Task,
  'id' | 'createdAt' | 'commentCount' | 'latestCommentPreview' | 'pinned'
>;
