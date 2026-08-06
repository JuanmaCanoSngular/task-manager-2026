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

  const prompt = `Eres un asistente de un tablero Kanban. Trabajas SOLO en castellano (español de España).

Reglas:
- El mensaje del usuario debe estar en castellano. Si está en otro idioma o es incomprensible, responde exactamente: {"title":null,"error":"solo_castellano"}
- El título de la tarea SIEMPRE en castellano. Nunca inglés ni otros idiomas.
- Extrae UNA tarea: título corto y claro (máx. 80 caracteres).
- Quita muletillas ("recuérdame", "por favor", "mañana"…) si no aportan al título.
- No inventes detalles que no estén en el mensaje. No uses comillas en el título.
- Responde SOLO con JSON: {"title":"..."} o {"title":null,"error":"solo_castellano"}

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

  const parsed = parseTitleFromModelText(raw);
  if (parsed && typeof parsed === 'object' && parsed.rejected) {
    return parsed;
  }
  return typeof parsed === 'string' ? parsed.slice(0, 120) : null;
}

function parseTitleFromModelText(raw) {
  if (!raw) return null;

  // 1) JSON completo
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.error === 'solo_castellano' || parsed?.title === null) {
      return { rejected: 'solo_castellano' };
    }
    const t = normalizeTitle(parsed?.title);
    if (t) return t;
  } catch {
    // sigue
  }

  // 2) Extrae el primer objeto {"title":"..."} embebido (por si hay texto alrededor)
  const match = raw.match(/\{[\s\S]*?"title"\s*:\s*(null|"((?:\\.|[^"\\])*)")[\s\S]*?\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (parsed?.error === 'solo_castellano' || parsed?.title === null) {
        return { rejected: 'solo_castellano' };
      }
      const t = normalizeTitle(parsed?.title);
      if (t) return t;
    } catch {
      if (match[1] === 'null') return { rejected: 'solo_castellano' };
      const t = normalizeTitle(match[2]?.replace(/\\"/g, '"'));
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
    const extracted = await extractTitleWithGemini(text);
    if (extracted && typeof extracted === 'object' && extracted.rejected === 'solo_castellano') {
      return {
        error:
          'Solo entiendo mensajes en castellano. Escribe la tarea en español, por favor.',
      };
    }
    title = typeof extracted === 'string' ? extracted : null;
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

  // Coloca la nueva tarea arriba de su columna (position mínima entre hermanas).
  const { data: siblings } = await supabase
    .from('tasks')
    .select('id, position')
    .eq('board_id', board.id)
    .eq('status', 'backlog')
    .order('position', { ascending: true });

  const insertAt =
    siblings && siblings.length > 0
      ? Math.min(...siblings.map((s) => s.position ?? 0))
      : 0;

  const { data: toShift } = await supabase
    .from('tasks')
    .select('id, position')
    .eq('board_id', board.id)
    .gte('position', insertAt);

  if (toShift?.length) {
    await Promise.all(
      toShift.map((row) =>
        supabase
          .from('tasks')
          .update({ position: (row.position ?? 0) + 1 })
          .eq('id', row.id)
      )
    );
  }

  const { data: task, error: insertError } = await supabase
    .from('tasks')
    .insert({
      board_id: board.id,
      user_id: userId,
      title,
      status: 'backlog',
      tags: [],
      position: insertAt,
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
