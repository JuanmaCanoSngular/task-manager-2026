-- Migración: etiquetas por tablero (board_id).
-- Ejecutar si ya tenías `tags` por usuario (sin board_id).
-- En un proyecto nuevo basta con tags-schema.sql (ya incluye board_id).

alter table tags
  add column if not exists board_id bigint references boards (id) on delete cascade;

-- Las etiquetas existentes pasan al tablero por defecto (o al más antiguo).
update tags t
set board_id = (
  select b.id
  from boards b
  where b.user_id = t.user_id
  order by b.is_default desc nulls last, b.created_at asc, b.id asc
  limit 1
)
where t.board_id is null;

delete from tags where board_id is null;

alter table tags drop constraint if exists tags_user_id_name_key;

-- Clona las etiquetas del tablero por defecto al resto y remapea tasks.tags.
do $$
declare
  target record;
  src record;
  default_board_id bigint;
  mapping jsonb;
  new_id uuid;
begin
  for target in
    select b.id, b.user_id
    from boards b
    where not exists (select 1 from tags t where t.board_id = b.id)
  loop
    select b2.id into default_board_id
    from boards b2
    where b2.user_id = target.user_id
    order by b2.is_default desc nulls last, b2.created_at asc, b2.id asc
    limit 1;

    if default_board_id is null or default_board_id = target.id then
      continue;
    end if;

    mapping := '{}'::jsonb;

    for src in
      select id, user_id, name, color
      from tags
      where board_id = default_board_id
    loop
      new_id := gen_random_uuid();
      insert into tags (id, user_id, board_id, name, color)
      values (new_id, src.user_id, target.id, src.name, src.color);
      mapping := mapping || jsonb_build_object(src.id::text, new_id::text);
    end loop;

    if mapping = '{}'::jsonb then
      continue;
    end if;

    update tasks tk
    set tags = coalesce((
      select array_agg(coalesce(mapping ->> x, x) order by ord)
      from unnest(tk.tags) with ordinality as u(x, ord)
    ), '{}'::text[])
    where tk.board_id = target.id
      and cardinality(tk.tags) > 0;
  end loop;
end $$;

alter table tags alter column board_id set not null;

create unique index if not exists tags_board_id_name_idx on tags (board_id, name);
create index if not exists tags_board_id_idx on tags (board_id);

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
