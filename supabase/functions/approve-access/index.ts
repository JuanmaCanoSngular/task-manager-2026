// Edge Function: approve-access
// La abre el owner desde el enlace del email. Valida el token, marca el perfil
// como 'approved' y provisiona un tablero de ejemplo con tareas para ese usuario.
// Pública (sin JWT): la seguridad la da el token de un solo uso.
//
// Variables de entorno: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (inyectadas).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const token = new URL(req.url).searchParams.get('token');
  if (!token) {
    return html('Enlace inválido: falta el token.', 400);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Buscar el perfil con ese token (aún pendiente).
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, status')
    .eq('approval_token', token)
    .maybeSingle();

  if (!profile) {
    return html('Enlace inválido o ya utilizado.', 404);
  }

  if (profile.status === 'approved') {
    return html(`El acceso de ${profile.email} ya estaba aprobado.`);
  }

  // Aprobar: marcar approved e invalidar el token (un solo uso).
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ status: 'approved', approved_at: new Date().toISOString(), approval_token: null })
    .eq('id', profile.id);

  if (updateError) {
    return html(`Error al aprobar: ${updateError.message}`, 500);
  }

  await provisionExampleBoard(supabase, profile.id);

  return html(`Acceso aprobado para ${profile.email}. Ya puede entrar en la app.`);
});

// Crea un tablero de ejemplo con tareas para el usuario recién aprobado.
async function provisionExampleBoard(
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
  // IDs únicos a nivel global: partimos del máximo actual de cada tabla.
  const boardId = (await nextId(supabase, 'boards')) ?? 1;
  const baseTaskId = (await nextId(supabase, 'tasks')) ?? 1;

  const { error: boardError } = await supabase.from('boards').insert({
    id: boardId,
    user_id: userId,
    name: 'Bienvenida',
    emoji: '👋',
    color: '#6366f1',
  });
  if (boardError) {
    console.error('Error creando el tablero de ejemplo:', boardError.message);
    return;
  }

  const tasks = [
    { title: 'Explora tu primer tablero', status: 'backlog', tags: ['new-concept'] },
    { title: 'Crea una tarea nueva', status: 'in-progress', tags: [] },
    { title: 'Arrastra tareas entre columnas', status: 'in-review', tags: ['interactivity'] },
    { title: '¡Listo para empezar!', status: 'completed', tags: [] },
  ].map((task, index) => ({
    id: baseTaskId + index,
    board_id: boardId,
    user_id: userId,
    title: task.title,
    status: task.status,
    tags: task.tags,
    position: index,
  }));

  const { error: tasksError } = await supabase.from('tasks').insert(tasks);
  if (tasksError) {
    console.error('Error creando las tareas de ejemplo:', tasksError.message);
  }
}

async function nextId(
  supabase: ReturnType<typeof createClient>,
  table: 'boards' | 'tasks'
): Promise<number | null> {
  const { data } = await supabase
    .from(table)
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? (data.id as number) + 1 : null;
}

function html(message: string, status = 200) {
  return new Response(
    `<!doctype html><html lang="es"><head><meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <title>Aprobación de acceso</title></head>
     <body style="font-family:system-ui;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#f8fafc">
       <div style="max-width:28rem;padding:2rem;text-align:center;border-radius:12px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.1)">
         <p style="font-size:1.1rem;color:#0f172a">${message}</p>
       </div>
     </body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
