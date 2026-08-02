// Edge Function: request-access
// La invoca el cliente tras el login de Google. Crea (o reutiliza) el perfil en
// estado 'pending' con un token de aprobación y envía un email al owner con el
// enlace para aprobar.
//
// Variables de entorno necesarias (Supabase las inyecta SUPABASE_*; el resto se
// configuran como secrets):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (inyectadas)
//   RESEND_API_KEY   -> clave de Resend
//   OWNER_EMAIL      -> juanmacano@gmail.com
//   FROM_EMAIL       -> remitente verificado en Resend (p. ej. onboarding@resend.dev)

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

    // Identificar al usuario a partir de su JWT.
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !userData.user) {
      return json({ error: 'No autenticado' }, 401);
    }
    const user = userData.user;
    const email = user.email ?? '';

    // Si ya existe perfil, no duplicar. Si ya está aprobado, nada que hacer.
    const { data: existing } = await supabase
      .from('profiles')
      .select('status, approval_token')
      .eq('id', user.id)
      .maybeSingle();

    if (existing?.status === 'approved') {
      return json({ status: 'approved' });
    }

    const token = existing?.approval_token ?? crypto.randomUUID();

    // Crear/actualizar el perfil en pending con el token.
    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: user.id,
      email,
      status: 'pending',
      approval_token: token,
    });
    if (upsertError) {
      return json({ error: upsertError.message }, 500);
    }

    // Enviar email al owner con el enlace de aprobación.
    const approveUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/approve-access?token=${token}`;
    await sendOwnerEmail(email, approveUrl);

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

async function sendOwnerEmail(requesterEmail: string, approveUrl: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    console.warn('RESEND_API_KEY sin configurar; se omite el envío de email');
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: Deno.env.get('FROM_EMAIL') ?? 'onboarding@resend.dev',
      to: Deno.env.get('OWNER_EMAIL'),
      subject: `Solicitud de acceso: ${requesterEmail}`,
      html: `
        <p>Nueva solicitud de acceso a la app de tareas.</p>
        <p>Usuario: <strong>${requesterEmail}</strong></p>
        <p><a href="${approveUrl}">Aprobar acceso</a></p>
        <p style="color:#888">Si no reconoces esta solicitud, ignora este correo.</p>
      `,
    }),
  });

  if (!res.ok) {
    console.error('Fallo al enviar email con Resend:', await res.text());
  }
}
