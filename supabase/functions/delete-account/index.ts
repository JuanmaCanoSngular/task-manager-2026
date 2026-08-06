// Edge Function: delete-account
// Elimina la cuenta del usuario autenticado en Auth.
// Los datos (profiles, boards, tasks, tags, channel_*) caen por ON DELETE CASCADE.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
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

    // Limpieza explícita por si alguna fila no tiene cascade (idempotente).
    await supabase.from('channel_link_codes').delete().eq('user_id', userId);
    await supabase.from('channel_links').delete().eq('user_id', userId);
    await supabase.from('tags').delete().eq('user_id', userId);
    await supabase.from('tasks').delete().eq('user_id', userId);
    await supabase.from('boards').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);

    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('deleteUser:', deleteError);
      return json({ error: deleteError.message }, 500);
    }

    return json({ ok: true });
  } catch (error) {
    console.error('delete-account:', error);
    return json({ error: error instanceof Error ? error.message : 'Error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
