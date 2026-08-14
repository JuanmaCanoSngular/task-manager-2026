-- Anclar tareas arriba de su columna (chincheta).
-- Ejecutar en el SQL Editor de Supabase.

alter table tasks
  add column if not exists pinned boolean not null default false;

-- Si el schema cache no ve la columna:
-- Dashboard → Project Settings → API → Reload schema (o espera ~1 min).
