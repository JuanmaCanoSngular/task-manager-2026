// Edge Function: approve-access
// La abre el owner desde el enlace del email. Valida el token, marca el perfil
// como 'approved' y provisiona un tablero de ejemplo con tareas para ese usuario.
// Pública (sin JWT): la seguridad la da el token de un solo uso.
//
// Variables de entorno: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (inyectadas).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

  const appUrl = Deno.env.get('APP_URL') ?? '';

  const subject = result === 'approved' ? 'Tu acceso ha sido aprobado' : 'Sobre tu solicitud de acceso';
  const heading = result === 'approved' ? '¡Acceso aprobado!' : 'Solicitud no aprobada';
  const body =
    result === 'approved'
      ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#475569">
           Tu acceso a <strong>Gestión de tareas</strong> ha sido aprobado. Ya puedes entrar y
           empezar a organizar tus tableros.
         </p>` +
        (appUrl
          ? `<a href="${appUrl}" style="display:inline-block;padding:12px 24px;border-radius:10px;background:#6366f1;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none">Entrar en la app</a>`
          : '')
      : `<p style="margin:0;font-size:15px;line-height:1.6;color:#475569">
           Tu solicitud de acceso a <strong>Gestión de tareas</strong> no ha sido aprobada. Si crees
           que se trata de un error, contacta con el administrador.
         </p>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: Deno.env.get('FROM_EMAIL') ?? 'onboarding@resend.dev',
        to: email,
        subject,
        html: layout(heading, body),
      }),
    });
    if (!res.ok) {
      console.error('Email al usuario falló:', await res.text());
    }
  } catch (error) {
    console.error('Email al usuario falló:', error);
  }
}

function layout(heading: string, bodyHtml: string) {
  return `<!doctype html><html lang="es"><body style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(15,23,42,.10)">
        <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:26px 32px">
          <div style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:.3px">Gestión de tareas</div>
        </td></tr>
        <tr><td style="padding:32px">
          <h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;color:#0f172a">${heading}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:18px 32px;border-top:1px solid #e2e8f0">
          <p style="margin:0;font-size:12px;color:#94a3b8">Mensaje automático de Gestión de tareas. Si no reconoces esta actividad, ignóralo.</p>
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
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
