-- Archivar comentarios (soft-hide). El badge solo cuenta activos.
-- Ejecutar en el SQL Editor de Supabase.

alter table task_comments
  add column if not exists archived_at timestamptz null;

create index if not exists task_comments_task_active_idx
  on task_comments (task_id)
  where archived_at is null;
