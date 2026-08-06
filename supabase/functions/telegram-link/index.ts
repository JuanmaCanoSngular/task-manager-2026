// Edge Function: telegram-link
// Genera / consulta / elimina el vínculo Telegram del usuario autenticado.
//
// POST { action: 'status' | 'generate' | 'unlink' }
//
// Secrets: TELEGRAM_BOT_USERNAME (sin @), opcional pero recomendado para deep link.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROVIDER = 'telegram';
const CODE_TTL_MS = 15 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const jwt = authHeader.replace(/^Bearer\s+/i, '');
    if (!jwt) return json({ error: 'No autenticado' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !userData.user) {
      return json({ error: 'No autenticado' }, 401);
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const action = typeof body.action === 'string' ? body.action : 'status';

    if (action === 'status') {
      return json(await getStatus(supabase, userId));
    }
    if (action === 'generate') {
      return json(await generateCode(supabase, userId));
    }
    if (action === 'unlink') {
      await supabase.from('channel_links').delete().eq('user_id', userId).eq('provider', PROVIDER);
      await supabase.from('channel_link_codes').delete().eq('user_id', userId);
      return json(await getStatus(supabase, userId));
    }

    return json({ error: 'Acción no válida' }, 400);
  } catch (error) {
    console.error('telegram-link:', error);
    return json({ error: error instanceof Error ? error.message : 'Error' }, 500);
  }
});

async function getStatus(supabase, userId) {
  const { data: link } = await supabase
    .from('channel_links')
    .select('external_id, created_at')
    .eq('user_id', userId)
    .eq('provider', PROVIDER)
    .maybeSingle();

  const botUsername = (Deno.env.get('TELEGRAM_BOT_USERNAME') || '').replace(/^@/, '');

  return {
    linked: Boolean(link),
    linkedAt: link?.created_at ?? null,
    botUsername: botUsername || null,
    botUrl: botUsername ? `https://t.me/${botUsername}` : null,
  };
}

async function generateCode(supabase, userId) {
  await supabase.from('channel_link_codes').delete().eq('user_id', userId);

  const code = makeCode(6);
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

  const { error } = await supabase.from('channel_link_codes').insert({
    code,
    user_id: userId,
    expires_at: expiresAt,
  });
  if (error) throw error;

  const status = await getStatus(supabase, userId);
  const deepLink = status.botUsername
    ? `https://t.me/${status.botUsername}?start=${code}`
    : null;

  return {
    ...status,
    code,
    expiresAt,
    deepLink,
    startCommand: `/start ${code}`,
  };
}

function makeCode(length) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
