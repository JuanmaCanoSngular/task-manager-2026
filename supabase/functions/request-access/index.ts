// Edge Function: request-access
// La invoca el cliente tras el login de Google. Crea (o reutiliza) el perfil en
// estado 'pending' con un token de aprobación, avisa al owner (con enlaces de
// aprobar/denegar) y confirma al solicitante que su petición se ha recibido.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (inyectadas), RESEND_API_KEY,
//      OWNER_EMAIL, FROM_EMAIL.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ownerRequestEmail, requestReceivedEmail } from '../_shared/emails.js';

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
  const { subject, html } = ownerRequestEmail(requesterEmail, approveUrl, denyUrl);
  await sendEmail(Deno.env.get('OWNER_EMAIL') ?? '', subject, html);
}

async function sendRequesterEmail(email: string) {
  const { subject, html } = requestReceivedEmail();
  await sendEmail(email, subject, html);
}
