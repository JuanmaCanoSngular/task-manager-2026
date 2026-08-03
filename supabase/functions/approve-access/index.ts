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
    return redirect('invalid');
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
    return redirect('invalid');
  }

  if (profile.status === 'approved') {
    return redirect('already', profile.email);
  }

  // Aprobar: marcar approved e invalidar el token (un solo uso).
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ status: 'approved', approved_at: new Date().toISOString(), approval_token: null })
    .eq('id', profile.id);

  if (updateError) {
    return redirect('error');
  }

  await provisionExampleBoard(supabase, profile.id);
  await notifyUserApproved(profile.email);

  return redirect('ok', profile.email);
});

// Avisa al usuario de que su acceso ha sido aprobado.
// NOTA: con el remitente de pruebas de Resend (onboarding@resend.dev) solo se
// entrega al email de la cuenta de Resend. Para enviar a terceros hay que
// verificar un dominio propio en Resend y usarlo como FROM_EMAIL.
async function notifyUserApproved(email: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return;

  const appUrl = Deno.env.get('APP_URL') ?? '';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get('FROM_EMAIL') ?? 'onboarding@resend.dev',
        to: email,
        subject: 'Tu acceso ha sido aprobado',
        html:
          `<p>¡Tu acceso a la app de tareas ha sido aprobado!</p>` +
          (appUrl ? `<p><a href="${appUrl}">Entrar en la app</a></p>` : ''),
      }),
    });
    if (!res.ok) {
      console.error('Email de aprobación al usuario falló:', await res.text());
    }
  } catch (error) {
    console.error('Email de aprobación al usuario falló:', error);
  }
}

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

// Redirige a la app con el resultado en query params; la confirmación se
// renderiza en React (evita el problema de content-type del runtime).
function redirect(result: 'ok' | 'already' | 'invalid' | 'error', email?: string) {
  const appUrl = Deno.env.get('APP_URL') ?? '';
  const url = new URL(appUrl || 'https://example.com');
  url.searchParams.set('approved', result);
  if (email) url.searchParams.set('email', email);
  return new Response(null, { status: 303, headers: { Location: url.toString() } });
}
