-- Etiquetas por tablero (CRUD).
-- Ejecutar en el SQL Editor de Supabase.
-- tasks.tags sigue siendo text[]: guarda los UUID de tags como texto.

create table if not exists tags (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  board_id    bigint not null references boards (id) on delete cascade,
  name        text not null,
  color       text not null,
  created_at  timestamptz not null default now(),
  unique (board_id, name)
);

create index if not exists tags_user_id_idx on tags (user_id);
create index if not exists tags_board_id_idx on tags (board_id);

alter table tags enable row level security;

drop policy if exists "tags propias" on tags;
create policy "tags propias" on tags
  for all to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from boards b
      where b.id = tags.board_id and b.user_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from boards b
      where b.id = tags.board_id and b.user_id = auth.uid()
    )
  );
