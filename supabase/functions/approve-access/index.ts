// Edge Function: approve-access
// La abre el owner desde el enlace del email. Valida el token, marca el perfil
// como 'approved' y provisiona un tablero de ejemplo con tareas para ese usuario.
// Pública (sin JWT): la seguridad la da el token de un solo uso.
//
// Variables de entorno: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (inyectadas).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { approvedEmail, deniedEmail } from '../_shared/emails.js';

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const action = url.searchParams.get('action') === 'deny' ? 'deny' : 'approve';
  if (!token) {
    return redirect('invalid');
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Buscar el perfil con ese token (aún pendiente). El token se invalida al
  // resolver, así que un enlace ya usado no encuentra perfil.
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, status')
    .eq('approval_token', token)
    .maybeSingle();

  if (!profile) {
    return redirect('invalid');
  }

  // Denegar: marcar denied e invalidar el token.
  if (action === 'deny') {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'denied', approval_token: null })
      .eq('id', profile.id);
    if (error) {
      return redirect('error');
    }
    await notifyUser(profile.email, 'denied');
    return redirect('denied', profile.email);
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
  await notifyUser(profile.email, 'approved');

  return redirect('ok', profile.email);
});

// Avisa al usuario del resultado de su solicitud (aprobada o denegada).
// NOTA: con el remitente de pruebas de Resend (onboarding@resend.dev) solo se
// entrega al email de la cuenta de Resend. Para enviar a terceros hay que
// verificar un dominio propio en Resend y usarlo como FROM_EMAIL.
async function notifyUser(email: string, result: 'approved' | 'denied') {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return;

  const { subject, html } =
    result === 'approved' ? approvedEmail(Deno.env.get('APP_URL') ?? '') : deniedEmail();

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: Deno.env.get('FROM_EMAIL') ?? 'onboarding@resend.dev',
        to: email,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error('Email al usuario falló:', await res.text());
    }
  } catch (error) {
    console.error('Email al usuario falló:', error);
  }
}

// Crea un tablero de ejemplo con tareas para el usuario recién aprobado.
async function provisionExampleBoard(
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
  // Los ids los asigna la secuencia de Postgres (no max+1 del cliente).
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .insert({
      user_id: userId,
      name: 'Bienvenida',
      emoji: '👋',
      color: '#0d9488',
      is_default: true,
    })
    .select('id')
    .single();

  if (boardError || !board) {
    console.error('Error creando el tablero de ejemplo:', boardError?.message);
    return;
  }

  const tasks = [
    { title: 'Explora tu primer tablero', status: 'backlog', tags: ['new-concept'] },
    { title: 'Crea una tarea nueva', status: 'in-progress', tags: [] },
    { title: 'Ejemplo de bloqueo: falta acceso a un recurso', status: 'in-review', tags: [] },
    { title: '¡Listo para empezar!', status: 'completed', tags: [] },
  ].map((task, index) => ({
    board_id: board.id,
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

// Redirige a la app con el resultado en query params; la confirmación se
// renderiza en React (evita el problema de content-type del runtime).
function redirect(result: 'ok' | 'already' | 'invalid' | 'error', email?: string) {
  const appUrl = Deno.env.get('APP_URL') ?? '';
  const url = new URL(appUrl || 'https://example.com');
  url.searchParams.set('approved', result);
  if (email) url.searchParams.set('email', email);
  return new Response(null, { status: 303, headers: { Location: url.toString() } });
}
