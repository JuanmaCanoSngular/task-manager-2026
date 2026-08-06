// Lógica compartida del agente (Gemini + tablero default).
// Importable desde Edge Functions Deno.

const GEMINI_MODEL = 'gemini-2.0-flash';

export async function extractTitleWithGemini(text) {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY no configurada en Supabase secrets');

  const prompt = `Eres un asistente de un tablero Kanban en español.
El usuario quiere crear UNA tarea. Extrae un título corto y claro (máx. 120 caracteres).
No inventes detalles que no estén en el mensaje. No uses comillas en el título.
Responde SOLO con JSON válido de esta forma: {"title":"..."}

Mensaje del usuario:
${text}`;

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent` +
    `?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 128,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error('Gemini error:', res.status, detail);
    throw new Error(`Gemini no disponible (${res.status})`);
  }

  const payload = await res.json();
  const raw =
    payload?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';

  try {
    const parsed = JSON.parse(raw);
    const title = typeof parsed.title === 'string' ? parsed.title.trim() : '';
    if (!title) return null;
    return title.slice(0, 120);
  } catch {
    const fallback = raw.replace(/^["'\s]+|["'\s]+$/g, '').split('\n')[0]?.trim();
    return fallback ? fallback.slice(0, 120) : null;
  }
}

export async function getDefaultBoard(supabase, userId) {
  const { data, error } = await supabase
    .from('boards')
    .select('id, name')
    .eq('user_id', userId)
    .eq('is_default', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createTaskOnDefault(supabase, userId, text) {
  const board = await getDefaultBoard(supabase, userId);
  if (!board) {
    return { error: 'No tienes un tablero por defecto. Ábrelo en la app y márcalo con la estrella.' };
  }

  const title = await extractTitleWithGemini(text);
  if (!title) {
    return { error: 'No pude entender la tarea. Prueba a reformular.' };
  }

  const { count } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('board_id', board.id)
    .eq('status', 'backlog');

  const { data: task, error: insertError } = await supabase
    .from('tasks')
    .insert({
      board_id: board.id,
      user_id: userId,
      title,
      status: 'backlog',
      tags: [],
      position: count ?? 0,
    })
    .select('id, title, status')
    .single();

  if (insertError) return { error: insertError.message };

  return { board, task };
}

export async function listPendingTasks(supabase, userId) {
  const board = await getDefaultBoard(supabase, userId);
  if (!board) {
    return { error: 'No tienes un tablero por defecto.' };
  }

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, title')
    .eq('board_id', board.id)
    .eq('status', 'backlog')
    .order('position', { ascending: true });

  if (error) return { error: error.message };

  return { board, tasks: tasks ?? [] };
}

export async function listBlockedTasks(supabase, userId) {
  const board = await getDefaultBoard(supabase, userId);
  if (!board) {
    return { error: 'No tienes un tablero por defecto.' };
  }

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, title')
    .eq('board_id', board.id)
    .eq('status', 'in-review')
    .order('position', { ascending: true });

  if (error) return { error: error.message };

  return { board, tasks: tasks ?? [] };
}
