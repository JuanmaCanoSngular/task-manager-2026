// Edge Function: request-access
// La invoca el cliente tras el login de Google. Crea (o reutiliza) el perfil en
// estado 'pending' con un token de aprobación, avisa al owner (con enlaces de
// aprobar/denegar) y confirma al solicitante que su petición se ha recibido.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (inyectadas), RESEND_API_KEY,
//      OWNER_EMAIL, FROM_EMAIL.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const jwt = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !userData.user) {
      return json({ error: 'No autenticado' }, 401);
    }
    const user = userData.user;
    const email = user.email ?? '';

    const { data: existing } = await supabase
      .from('profiles')
      .select('status, approval_token')
      .eq('id', user.id)
      .maybeSingle();

    if (existing?.status === 'approved') {
      return json({ status: 'approved' });
    }

    const token = existing?.approval_token ?? crypto.randomUUID();

    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: user.id,
      email,
      status: 'pending',
      approval_token: token,
    });
    if (upsertError) {
      return json({ error: upsertError.message }, 500);
    }

    const base = `${Deno.env.get('SUPABASE_URL')}/functions/v1/approve-access?token=${token}`;
    await Promise.all([
      sendOwnerEmail(email, `${base}&action=approve`, `${base}&action=deny`),
      sendRequesterEmail(email),
    ]);

    return json({ status: 'pending' });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ── Emails ────────────────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    console.warn('RESEND_API_KEY sin configurar; se omite el envío de email');
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: Deno.env.get('FROM_EMAIL') ?? 'onboarding@resend.dev',
      to,
      subject,
      html,
    }),
  });
  if (!res.ok) console.error('Fallo al enviar email con Resend:', await res.text());
}

async function sendOwnerEmail(requesterEmail: string, approveUrl: string, denyUrl: string) {
  const buttons = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:4px">
      <tr>
        <td>${button(approveUrl, 'Aprobar acceso', '#16a34a')}</td>
        <td style="width:12px"></td>
        <td>${button(denyUrl, 'Denegar', '#dc2626')}</td>
      </tr>
    </table>`;
  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569">
      Has recibido una nueva solicitud de acceso a <strong>Gestión de tareas</strong>.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f8fafc;border-radius:12px;margin:0 0 20px">
      <tr><td style="padding:14px 16px;font-size:14px;color:#0f172a">
        Solicitante: <strong>${requesterEmail}</strong>
      </td></tr>
    </table>
    ${buttons}`;
  await sendEmail(Deno.env.get('OWNER_EMAIL') ?? '', `Solicitud de acceso: ${requesterEmail}`, layout('Nueva solicitud de acceso', body));
}

async function sendRequesterEmail(email: string) {
  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569">
      Hemos recibido tu solicitud de acceso a <strong>Gestión de tareas</strong>.
      La revisaremos y te avisaremos por email en cuanto haya una respuesta.
    </p>
    <p style="margin:0;font-size:14px;color:#94a3b8">No necesitas hacer nada más por ahora.</p>`;
  await sendEmail(email, 'Hemos recibido tu solicitud de acceso', layout('Solicitud recibida', body));
}

// ── Plantilla ───────────────────────────────────────────────────────────────

function button(href: string, label: string, color: string) {
  return `<a href="${href}" style="display:inline-block;padding:12px 22px;border-radius:10px;background:${color};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none">${label}</a>`;
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
