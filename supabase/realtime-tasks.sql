-- Habilita Realtime en `tasks` para que el front reciba INSERT/UPDATE/DELETE
-- (p. ej. tareas creadas desde Telegram).
-- Ejecutar en el SQL Editor de Supabase.
-- Si ya está en la publication, el ADD fallará de forma segura; ignóralo.

alter publication supabase_realtime add table tasks;
