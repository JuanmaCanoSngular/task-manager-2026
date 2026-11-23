-- Soft-delete de comentarios (papelera) + índice de activos.
-- Ejecutar en el SQL Editor de Supabase.
-- Si aún no tienes archived_at, ejecuta también comments-archive.sql.

alter table task_comments
  add column if not exists archived_at timestamptz null;

alter table task_comments
  add column if not exists deleted_at timestamptz null;

drop index if exists task_comments_task_active_idx;
create index if not exists task_comments_task_active_idx
  on task_comments (task_id)
  where archived_at is null and deleted_at is null;
