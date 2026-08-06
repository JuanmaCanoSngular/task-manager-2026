// Lógica compartida del agente (Gemini + tablero default).
// Importable desde Edge Functions Deno.

// 3.1 flash-lite: barato y sin “thinking” ruidoso. Override con secret GEMINI_MODEL.
const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-3.1-flash-lite';

const JUNK_TITLES = new Set([
  'h',
  'here',
  'ok',
  'yes',
  'sure',
  'title',
  'json',
  'task',
  'tarea',
]);

export async function extractTitleWithGemini(text) {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY no configurada en Supabase secrets');

  const prompt = `Eres un asistente de un tablero Kanban en español.
El usuario quiere crear UNA tarea. Extrae un título corto y claro en español (máx. 80 caracteres).
Quita muletillas como "recuérdame", "por favor", "mañana" si no aportan.
No inventes detalles. No uses comillas en el título.
Responde SOLO con JSON: {"title":"..."}

Mensaje:
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
        temperature: 0.1,
        maxOutputTokens: 256,
        responseMimeType: 'application/json',
        // Evita que el razonamiento en inglés contamine el parseo ("Here", "H", …).
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error('Gemini error:', res.status, detail);
    throw new Error(`Gemini no disponible (${res.status})`);
  }

  const payload = await res.json();
  const parts = payload?.candidates?.[0]?.content?.parts ?? [];
  // Ignora partes de "thought" si el modelo las envía.
  const raw = parts
    .filter((p) => !p.thought && typeof p.text === 'string')
    .map((p) => p.text)
    .join('\n')
    .trim();

  const title = parseTitleFromModelText(raw);
  return title ? title.slice(0, 120) : null;
}

function parseTitleFromModelText(raw) {
  if (!raw) return null;

  // 1) JSON completo
  try {
    const parsed = JSON.parse(raw);
    const t = normalizeTitle(parsed?.title);
    if (t) return t;
  } catch {
    // sigue
  }

  // 2) Extrae el primer objeto {"title":"..."} embebido (por si hay texto alrededor)
  const match = raw.match(/\{[\s\S]*?"title"\s*:\s*"((?:\\.|[^"\\])*)"[\s\S]*?\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      const t = normalizeTitle(parsed?.title);
      if (t) return t;
    } catch {
      const t = normalizeTitle(match[1]?.replace(/\\"/g, '"'));
      if (t) return t;
    }
  }

  return null;
}

function normalizeTitle(value) {
  if (typeof value !== 'string') return null;
  const t = value.trim().replace(/^["'«»]+|["'«»]+$/g, '');
  if (!t || t.length < 3) return null;
  if (JUNK_TITLES.has(t.toLowerCase())) return null;
  return t;
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

  let title;
  let usedGemini = false;
  try {
    title = await extractTitleWithGemini(text);
    usedGemini = Boolean(title);
  } catch (err) {
    console.error('Gemini fallback:', err);
    title = null;
  }
  if (!title) {
    // Sin Gemini (o basura rechazada): usa el mensaje tal cual como título.
    title = text.split('\n')[0].trim().slice(0, 120);
  }
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

  return { board, task, usedGemini };
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
