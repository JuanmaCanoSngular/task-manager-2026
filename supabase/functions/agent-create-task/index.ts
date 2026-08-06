// Edge Function: agent-create-task
// Cerebro del agente (Gemini): interpreta texto y crea una tarea en el
// tablero por defecto del usuario, columna Pendiente (backlog).
// Pensado para ser llamado desde clientes autenticados; Telegram usa
// telegram-webhook (misma lógica compartida).
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createTaskOnDefault } from '../_shared/agent.js';

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
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    if (!text) return json({ error: 'Falta el texto de la tarea' }, 400);
    if (text.length > 2000) return json({ error: 'Texto demasiado largo' }, 400);

    const result = await createTaskOnDefault(supabase, userId, text);
    if (result.error) {
      const status = result.error.includes('entender') ? 422 : 400;
      return json({ error: result.error }, status);
    }

    return json({
      ok: true,
      board: { id: result.board.id, name: result.board.name },
      task: {
        id: result.task.id,
        title: result.task.title,
        status: result.task.status,
        tags: [],
      },
    });
  } catch (error) {
    console.error('agent-create-task:', error);
    return json({ error: error instanceof Error ? error.message : 'Error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
