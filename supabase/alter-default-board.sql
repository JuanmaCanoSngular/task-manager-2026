-- Migración: tablero por defecto
-- Ejecutar en el SQL Editor si el proyecto ya tiene el schema base.

alter table boards
  add column if not exists is_default boolean not null default false;

-- Si no hay ninguno marcado, el más antiguo pasa a ser el default.
update boards
set is_default = true
where id = (
  select id from boards order by created_at asc, id asc limit 1
)
and not exists (select 1 from boards where is_default = true);
