-- Purga automática de artículos comprados o descartados (> 7 días).
-- La cuenta empieza cuando el artículo cambia de columna, no cuando se creó.
-- Ejecutar en el SQL Editor de Supabase (después de boards-kind.sql).

alter table tasks
  add column if not exists column_changed_at timestamptz not null default now();

comment on column tasks.column_changed_at is
  'Último cambio de column_id. En listas de la compra marca cuándo pasó a comprado/descartado.';

create or replace function public.set_task_column_changed_at()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.column_changed_at := coalesce(new.column_changed_at, now());
    return new;
  end if;
  if new.column_id is distinct from old.column_id then
    new.column_changed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_set_column_changed_at on tasks;
create trigger tasks_set_column_changed_at
  before insert or update on tasks
  for each row
  execute function public.set_task_column_changed_at();

create or replace function public.purge_stale_shopping_items()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  delete from tasks t
  where t.id in (
    select t2.id
    from tasks t2
    inner join boards b on b.id = t2.board_id
    inner join board_columns c on c.id = t2.column_id
    where b.kind = 'shopping'
      and c.slug in ('completed', 'discarded')
      and t2.column_changed_at < now() - interval '7 days'
  );
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.purge_stale_shopping_items() from public;
grant execute on function public.purge_stale_shopping_items() to anon, authenticated, service_role;

comment on function public.purge_stale_shopping_items() is
  'Borra artículos de listas de la compra en Comprado o Descartado desde hace más de 7 días.';
