-- A5: comentarios en tareas (hilo simple por tarea).
-- Ejecutar en el SQL Editor de Supabase.
-- Si ya ejecutaste una versión anterior, vuelve a ejecutar este script
-- (las políticas se recrean con drop policy if exists).

create table if not exists task_comments (
  id           uuid primary key default gen_random_uuid(),
  task_id      bigint not null references tasks(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  body         text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  archived_at  timestamptz null,
  deleted_at   timestamptz null
);

-- Si la tabla ya existía sin estas columnas:
alter table task_comments
  add column if not exists archived_at timestamptz null;
alter table task_comments
  add column if not exists deleted_at timestamptz null;

create index if not exists task_comments_task_id_idx on task_comments (task_id);
create index if not exists task_comments_user_id_idx on task_comments (user_id);
drop index if exists task_comments_task_active_idx;
create index if not exists task_comments_task_active_idx
  on task_comments (task_id)
  where archived_at is null and deleted_at is null;

alter table task_comments enable row level security;

-- Ownership vía tablero (como board_columns): cubre tareas con user_id null.
drop policy if exists "comentarios de tareas propias" on task_comments;
create policy "comentarios de tareas propias" on task_comments
  for all to authenticated
  using (
    exists (
      select 1
      from tasks t
      inner join boards b on b.id = t.board_id
      where t.id = task_comments.task_id
        and b.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from tasks t
      inner join boards b on b.id = t.board_id
      where t.id = task_comments.task_id
        and b.user_id = auth.uid()
    )
    and user_id = auth.uid()
  );

-- Modo demo sin auth (misma idea que tasks abiertas en schema.sql).
drop policy if exists "comentarios abiertos" on task_comments;
create policy "comentarios abiertos" on task_comments
  for all to anon
  using (true)
  with check (true);
