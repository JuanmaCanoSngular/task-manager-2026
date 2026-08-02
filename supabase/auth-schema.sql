-- ─────────────────────────────────────────────────────────────
-- Fase 3: autenticación (Google) + multiusuario + aprobación manual
--
-- NO EJECUTAR todavía en producción: este script cierra la RLS abierta y
-- rompería la app actual (que funciona sin auth) hasta que el login esté
-- integrado. Ejecutar solo cuando el flujo de auth del frontend esté listo.
--
-- Orden recomendado de despliegue:
--   1) Integrar login Google en el frontend.
--   2) Loguearte tú una vez con Google (crea tu fila en auth.users).
--   3) Ejecutar la sección A (profiles + columnas user_id), SIN cerrar RLS.
--   4) Asignar tus datos actuales a tu user_id (sección B, pon tu UID).
--   5) Cerrar la RLS (sección C).
-- ─────────────────────────────────────────────────────────────

-- ===== Sección A: tablas y columnas =====

-- Un perfil por usuario autenticado. El acceso a la app se controla con `status`.
create table if not exists profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  email          text not null,
  status         text not null default 'pending', -- 'pending' | 'approved'
  approval_token uuid,                              -- token de aprobación (un solo uso)
  created_at     timestamptz not null default now(),
  approved_at    timestamptz
);

-- Propietario de cada board/tarea. Nullable temporalmente para poder migrar
-- los datos existentes antes de hacerlo obligatorio.
alter table boards add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table tasks  add column if not exists user_id uuid references auth.users (id) on delete cascade;

create index if not exists boards_user_id_idx on boards (user_id);
create index if not exists tasks_user_id_idx  on tasks (user_id);

-- NOTA sobre IDs: hoy boards.id y tasks.id son bigint generados en el cliente
-- (max+1). Con varios usuarios eso puede colisionar en la PK global. Antes de
-- abrir a multiusuario conviene migrar a identidad generada por la DB
-- (bigint generated always as identity) o a uuid, y devolver el id en el insert.
-- Se aborda como tarea aparte (cambia el flujo de inserción del store).

-- ===== Sección B: migración de datos existentes =====
-- Sustituye 'TU-UUID-AQUI' por tu id real (auth.users) tras tu primer login.
--
-- update boards set user_id = 'TU-UUID-AQUI' where user_id is null;
-- update tasks  set user_id = 'TU-UUID-AQUI' where user_id is null;
--
-- Y crea tu perfil ya aprobado:
-- insert into profiles (id, email, status, approved_at)
-- values ('TU-UUID-AQUI', 'juanmacano@gmail.com', 'approved', now())
-- on conflict (id) do update set status = 'approved', approved_at = now();

-- ===== Sección C: cerrar RLS (ejecutar al final) =====
-- Quitar las políticas abiertas a anon que existen hoy.
-- drop policy if exists "boards abiertos" on boards;
-- drop policy if exists "tasks abiertas" on tasks;

-- alter table profiles enable row level security;

-- Cada usuario solo ve y modifica lo suyo.
-- create policy "boards propios" on boards for all to authenticated
--   using (user_id = auth.uid()) with check (user_id = auth.uid());

-- create policy "tasks propias" on tasks for all to authenticated
--   using (user_id = auth.uid()) with check (user_id = auth.uid());

-- El usuario solo lee su propio perfil. Las escrituras de profiles
-- (aprobación, provisión) las hace una Edge Function con service_role,
-- que salta la RLS; por eso no hay policy de insert/update para el usuario.
-- create policy "perfil propio" on profiles for select to authenticated
--   using (id = auth.uid());
