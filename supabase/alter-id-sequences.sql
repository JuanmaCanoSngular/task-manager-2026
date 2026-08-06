-- IDs generados en la DB (evita colisiones max+1 del cliente con RLS / seed).
-- Ejecutar en el SQL Editor de Supabase.

create sequence if not exists boards_id_seq;
select setval(
  'boards_id_seq',
  coalesce((select max(id) from boards), 0)
);
alter table boards alter column id set default nextval('boards_id_seq');
alter sequence boards_id_seq owned by boards.id;

create sequence if not exists tasks_id_seq;
select setval(
  'tasks_id_seq',
  coalesce((select max(id) from tasks), 0)
);
alter table tasks alter column id set default nextval('tasks_id_seq');
alter sequence tasks_id_seq owned by tasks.id;
