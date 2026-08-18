-- Checklist / subtareas dentro de una tarea.
-- Ejecutar en el SQL Editor de Supabase.

create table if not exists task_checklist_items (
  id          uuid primary key default gen_random_uuid(),
  task_id     bigint not null references tasks(id) on delete cascade,
  title       text not null,
  done        boolean not null default false,
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists task_checklist_items_task_id_idx
  on task_checklist_items (task_id, position);

alter table task_checklist_items enable row level security;

drop policy if exists "checklist de tareas propias" on task_checklist_items;
create policy "checklist de tareas propias" on task_checklist_items
  for all to authenticated
  using (
    exists (
      select 1
      from tasks t
      inner join boards b on b.id = t.board_id
      where t.id = task_checklist_items.task_id
        and b.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from tasks t
      inner join boards b on b.id = t.board_id
      where t.id = task_checklist_items.task_id
        and b.user_id = auth.uid()
    )
  );

drop policy if exists "checklist abierto" on task_checklist_items;
create policy "checklist abierto" on task_checklist_items
  for all to anon
  using (true)
  with check (true);
