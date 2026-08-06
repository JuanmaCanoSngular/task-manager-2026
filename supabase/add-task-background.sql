-- Añade la columna de URL de imagen en tarjetas (si falta).
-- Ejecutar en el SQL Editor de Supabase.

alter table tasks add column if not exists background text;

-- Si el error de schema cache sigue tras unos segundos:
-- Dashboard → Project Settings → API → Reload schema (o espera ~1 min).
