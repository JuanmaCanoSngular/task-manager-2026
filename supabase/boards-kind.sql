-- Tipo de tablero: kanban (columnas) o shopping (lista de la compra).
-- Ejecutar en el SQL Editor de Supabase.

alter table boards
  add column if not exists kind text not null default 'kanban';

alter table boards drop constraint if exists boards_kind_check;
alter table boards
  add constraint boards_kind_check check (kind in ('kanban', 'shopping'));

-- Si el schema cache no ve la columna:
-- Dashboard → Project Settings → API → Reload schema (o espera ~1 min).
