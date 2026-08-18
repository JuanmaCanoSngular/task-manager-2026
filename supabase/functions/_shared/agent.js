// Lógica compartida del agente (Gemini + tablero default).
// Importable desde Edge Functions Deno.

import {
  getBlockersColumnId,
  getInboxColumnId,
  seedDefaultColumns,
} from './columns.js';

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

export async function extractTitleWithGemini(text, boards = []) {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY no configurada en Supabase secrets');

  const boardList =
    boards.length > 0
      ? boards
          .map((b) => {
            const name = typeof b === 'string' ? b : b?.name;
            if (!name) return null;
            const kind = typeof b === 'string' ? null : b?.kind;
            const tipo = kind === 'shopping' ? 'lista de la compra' : 'kanban';
            return `- ${name} (${tipo})`;
          })
          .filter(Boolean)
          .join('\n')
      : '(ninguno listado)';

  const prompt = `Eres un asistente de un tablero de tareas. Trabajas SOLO en castellano (español de España).

Reglas:
- El mensaje del usuario debe estar en castellano. Si está en otro idioma o es incomprensible, responde exactamente: {"title":null,"error":"solo_castellano"}
- El título SIEMPRE en castellano. Nunca inglés ni otros idiomas.
- Extrae UNA tarea: título corto y claro (máx. 80 caracteres).
- Quita muletillas ("recuérdame", "por favor", "mañana"…) si no aportan al título.
- No inventes detalles que no estén en el mensaje. No uses comillas en el título.
- NO pongas el nombre del tablero en el título.
- Tableros del usuario:
${boardList}
- "board" SOLO si el mensaje indica con claridad uno de esos tableros, O si es una lista de la compra (ver abajo). Debe ser el nombre EXACTO de la lista. Si no aplica: null.

Lista de la compra:
- Si el mensaje nombra alimentos, bebidas, droguería o cosas típicas de supermercado (leche, pan, huevos, tomates, detergente, papel higiénico…), es una COMPRA aunque NO diga "compra" ni el nombre del tablero.
- En ese caso: "shopping": true, "items": cada producto por separado (máx. 40, cortos; también si solo hay UNO), "title": un resumen ("Compra") SIN enumerar productos, "board": el tablero marcado como lista de la compra si existe.
- Si es una LISTA de recados o subtareas que NO son de supermercado, extrae cada uno en "items" y "shopping": false.
- Si es una sola acción que no es de supermercado, "items": [] y "shopping": false.
- Responde SOLO con JSON: {"title":"...","board":null,"items":[],"shopping":false} o {"title":"Compra","board":"Nombre","items":["leche","pan"],"shopping":true} o {"title":null,"error":"solo_castellano"}

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
        maxOutputTokens: 512,
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
  if (parsed && typeof parsed === 'object' && parsed.title) {
    return parsed;
  }
  return null;
}

const SOLO_CASTELLANO = 'SOLO_CASTELLANO';

function uint8ToBase64(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    binary += String.fromCharCode(...u8.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** Transcribe audio (nota de voz / archivo) a castellano. */
export async function transcribeAudioWithGemini(bytes, mimeType) {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY no configurada en Supabase secrets');

  const mime = mimeType && mimeType.startsWith('audio/') ? mimeType : 'audio/ogg';
  const prompt = `Transcribe este audio a castellano (español de España).
Responde SOLO con el texto hablado, sin comillas, sin títulos y sin comentarios.
Si no hay habla, no se entiende, o no está en castellano, responde exactamente: ${SOLO_CASTELLANO}`;

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent` +
    `?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: mime, data: uint8ToBase64(bytes) } },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error('Gemini audio error:', res.status, detail);
    throw new Error(`Gemini no disponible (${res.status})`);
  }

  const payload = await res.json();
  const parts = payload?.candidates?.[0]?.content?.parts ?? [];
  const raw = parts
    .filter((p) => !p.thought && typeof p.text === 'string')
    .map((p) => p.text)
    .join('\n')
    .trim();

  if (!raw || raw.toUpperCase().includes(SOLO_CASTELLANO)) {
    return { rejected: 'solo_castellano' };
  }

  const transcript = raw.replace(/^["'«»]+|["'«»]+$/g, '').trim();
  if (transcript.length < 3) return { rejected: 'solo_castellano' };
  return transcript.slice(0, 2000);
}

function parseTitleFromModelText(raw) {
  if (!raw) return null;

  const fromParsed = (parsed) => {
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.error === 'solo_castellano' || parsed.title === null) {
      return { rejected: 'solo_castellano' };
    }
    const title = normalizeTitle(parsed.title);
    if (!title) return null;
    const board =
      typeof parsed.board === 'string' && parsed.board.trim() ? parsed.board.trim() : null;
    const items = normalizeChecklistItems(parsed.items);
    const shopping = parsed.shopping === true;
    return { title: title.slice(0, 120), board, items, shopping };
  };

  try {
    const parsed = JSON.parse(raw);
    const got = fromParsed(parsed);
    if (got) return got;
  } catch {
    // sigue
  }

  const match = raw.match(/\{[\s\S]*?"title"\s*:\s*(null|"((?:\\.|[^"\\])*)")[\s\S]*?\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      const got = fromParsed(parsed);
      if (got) return got;
    } catch {
      if (match[1] === 'null') return { rejected: 'solo_castellano' };
      const title = normalizeTitle(match[2]?.replace(/\\"/g, '"'));
      if (title) return { title: title.slice(0, 120), board: null, items: [], shopping: false };
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

function normalizeChecklistItems(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seen = new Set();
  for (const value of raw) {
    if (typeof value !== 'string') continue;
    const item = value.trim().replace(/^[-*•]\s+/, '').slice(0, 80);
    if (item.length < 2) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= 40) break;
  }
  return out;
}

function guessItemsFromText(text) {
  const lines = String(text)
    .split('\n')
    .map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter((line) => line.length >= 2 && line.length <= 80);
  if (lines.length >= 2) return lines.slice(0, 40);

  const parts = String(text)
    .split(/,\s*(?:y\s+)?|\s+y\s+/i)
    .map((part) => part.trim().replace(/[.?]$/, ''))
    .filter((part) => part.length >= 2 && part.length <= 40);
  if (parts.length >= 2 && parts.every((part) => part.split(/\s+/).length <= 5)) {
    return parts.slice(0, 40);
  }
  return [];
}

const GROCERY_HINT =
  /\b(lista de la compra|hacer la compra|comprar|del super|al super|supermercado|mercadona|carrefour|alcampo|lidl|aldi|hipermercado|para la compra)\b/i;

const GROCERY_WORDS = new Set(
  [
    'leche',
    'pan',
    'huevos',
    'huevo',
    'aceite',
    'arroz',
    'pasta',
    'tomate',
    'tomates',
    'lechuga',
    'pollo',
    'carne',
    'pescado',
    'yogur',
    'yogures',
    'queso',
    'manzana',
    'manzanas',
    'naranja',
    'naranjas',
    'platano',
    'platanos',
    'banana',
    'agua',
    'cerveza',
    'vino',
    'cafe',
    'azucar',
    'sal',
    'harina',
    'mantequilla',
    'jamon',
    'atun',
    'galletas',
    'cereales',
    'detergente',
    'lejia',
    'champu',
    'gel',
    'patatas',
    'patata',
    'cebolla',
    'cebollas',
    'ajo',
    'pimiento',
    'pimientos',
    'fresa',
    'fresas',
    'uva',
    'uvas',
    'limon',
    'limones',
    'papel',
    'higienico',
    'servilletas',
    'zanahoria',
    'zanahorias',
    'pepino',
    'calabacin',
    'brocoli',
    'espinacas',
    'lentejas',
    'garbanzos',
    'alubias',
    'chorizo',
    'bacon',
    'nata',
    'miel',
    'mermelada',
    'bollos',
    'croissants',
    'pizza',
    'helado',
    'chocolate',
    'garbanzo',
  ].map((w) => w.normalize('NFD').replace(/\p{M}/gu, ''))
);

function itemLooksGrocery(item) {
  const n = normalizeForMatch(item);
  if (!n) return false;
  if (GROCERY_WORDS.has(n)) return true;
  const first = n.split(' ')[0];
  return GROCERY_WORDS.has(first);
}

export function looksLikeGroceries(text, items = []) {
  if (GROCERY_HINT.test(String(text))) return true;
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) {
    const guessed = guessItemsFromText(text);
    if (guessed.length === 0) return itemLooksGrocery(String(text).split('\n')[0] ?? '');
    return looksLikeGroceries(text, guessed);
  }
  const hits = list.filter(itemLooksGrocery);
  if (hits.length === 0) return false;
  return hits.length >= Math.max(1, Math.ceil(list.length * 0.5));
}

function pickShoppingBoard(boards) {
  if (!boards?.length) return null;
  const byKind = boards.filter((b) => b.kind === 'shopping');
  if (byKind.length === 1) return byKind[0];
  if (byKind.length > 1) return byKind.find((b) => b.is_default) ?? byKind[0];
  return (
    boards.find((b) => /compra|super|mercadona|alcampo|carrefour/i.test(b.name ?? '')) ?? null
  );
}

export async function getDefaultBoard(supabase, userId) {
  const boards = await getUserBoards(supabase, userId);
  return pickDefaultBoard(boards);
}

export async function getUserBoards(supabase, userId) {
  const withKind = await supabase
    .from('boards')
    .select('id, name, is_default, kind')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (!withKind.error) return withKind.data ?? [];

  const fallback = await supabase
    .from('boards')
    .select('id, name, is_default')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (fallback.error) throw fallback.error;
  return fallback.data ?? [];
}

function pickDefaultBoard(boards) {
  if (!boards.length) return null;
  return boards.find((b) => b.is_default) ?? boards[0];
}

function normalizeForMatch(value) {
  return String(value)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function matchBoardHint(hint, boards) {
  if (!hint || !boards.length) return null;
  const needle = normalizeForMatch(hint);
  if (needle.length < 2) return null;

  const exact = boards.find((b) => normalizeForMatch(b.name) === needle);
  if (exact) return exact;

  const hits = boards.filter((b) => {
    const name = normalizeForMatch(b.name);
    return name.includes(needle) || needle.includes(name);
  });
  if (hits.length === 1) return hits[0];
  if (hits.length > 1) {
    hits.sort((a, b) => normalizeForMatch(b.name).length - normalizeForMatch(a.name).length);
    return hits[0];
  }
  return null;
}

/** Menciona el tablero con una pista ("en Personal", "tablero Trabajo"). */
function findBoardMentionedInText(text, boards) {
  if (!text || !boards.length) return null;
  const hay = normalizeForMatch(text);
  const sorted = [...boards].sort(
    (a, b) => normalizeForMatch(b.name).length - normalizeForMatch(a.name).length
  );
  for (const board of sorted) {
    const name = normalizeForMatch(board.name);
    if (name.length < 3) continue;
    const cues = [
      `en el tablero ${name}`,
      `al tablero ${name}`,
      `tablero ${name}`,
      `en ${name}`,
      `al ${name}`,
      `para ${name}`,
    ];
    if (cues.some((cue) => hay.includes(cue))) return board;
  }
  return null;
}

function stripBoardCueFromTitle(title, board) {
  if (!title || !board?.name) return title;
  const name = board.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return title
    .replace(new RegExp(`\\s*(?:en|al|para)(?:\\s+el)?(?:\\s+tablero)?\\s+${name}\\.?$`, 'i'), '')
    .replace(new RegExp(`\\s*tablero\\s+${name}\\.?$`, 'i'), '')
    .trim() || title;
}

async function insertInboxTasks(supabase, { userId, boardId, inboxColumnId, titles }) {
  const n = titles.length;
  if (n === 0) return [];

  const siblingFilter = inboxColumnId
    ? { column: 'column_id', value: inboxColumnId }
    : { column: 'status', value: 'backlog' };

  const { data: siblings } = await supabase
    .from('tasks')
    .select('id, position')
    .eq('board_id', boardId)
    .eq(siblingFilter.column, siblingFilter.value)
    .order('position', { ascending: true });

  const insertAt =
    siblings && siblings.length > 0
      ? Math.min(...siblings.map((s) => s.position ?? 0))
      : 0;

  const { data: toShift } = await supabase
    .from('tasks')
    .select('id, position')
    .eq('board_id', boardId)
    .gte('position', insertAt);

  if (toShift?.length) {
    await Promise.all(
      toShift.map((row) =>
        supabase
          .from('tasks')
          .update({ position: (row.position ?? 0) + n })
          .eq('id', row.id)
      )
    );
  }

  const rows = titles.map((taskTitle, index) => {
    const insertRow = {
      board_id: boardId,
      user_id: userId,
      title: taskTitle,
      status: 'backlog',
      tags: [],
      position: insertAt + index,
    };
    if (inboxColumnId) insertRow.column_id = inboxColumnId;
    return insertRow;
  });

  const { data, error } = await supabase
    .from('tasks')
    .insert(rows)
    .select('id, title, status, column_id');
  if (error) throw error;
  return data ?? [];
}

export async function createTaskOnDefault(supabase, userId, text) {
  const boards = await getUserBoards(supabase, userId);
  const defaultBoard = pickDefaultBoard(boards);
  if (!defaultBoard) {
    return { error: 'No tienes un tablero por defecto. Ábrelo en la app y márcalo con la estrella.' };
  }

  let title;
  let usedGemini = false;
  let boardHint = null;
  let checklistItems = [];
  let groceryIntent = false;
  try {
    const extracted = await extractTitleWithGemini(text, boards);
    if (extracted && typeof extracted === 'object' && extracted.rejected === 'solo_castellano') {
      return {
        error:
          'Solo entiendo mensajes en castellano. Escribe la tarea en español, por favor.',
      };
    }
    if (extracted && typeof extracted === 'object' && extracted.title) {
      title = extracted.title;
      boardHint = extracted.board;
      checklistItems = extracted.items ?? [];
      groceryIntent = extracted.shopping === true;
      usedGemini = true;
    }
  } catch (err) {
    console.error('Gemini fallback:', err);
    title = null;
  }
  if (!title) {
    title = text.split('\n')[0].trim().slice(0, 120);
  }
  if (!title) {
    return { error: 'No pude entender la tarea. Prueba a reformular.' };
  }
  if (checklistItems.length === 0) {
    checklistItems = guessItemsFromText(text);
  }
  if (!groceryIntent) {
    groceryIntent = looksLikeGroceries(text, checklistItems);
  }

  const namedBoard =
    matchBoardHint(boardHint, boards) ?? findBoardMentionedInText(text, boards);
  const shoppingBoard = pickShoppingBoard(boards);
  const board =
    namedBoard ?? (groceryIntent ? shoppingBoard : null) ?? defaultBoard;
  title = stripBoardCueFromTitle(title, board);

  let inboxColumnId = await getInboxColumnId(supabase, board.id);
  if (!inboxColumnId) {
    try {
      const cols = await seedDefaultColumns(
        supabase,
        board.id,
        userId,
        board.kind === 'shopping' ? 'shopping' : 'kanban'
      );
      inboxColumnId = cols.find((c) => c.is_inbox)?.id ?? cols[0]?.id ?? null;
    } catch {
      inboxColumnId = null;
    }
  }

  const asArticles = board.kind === 'shopping' || groceryIntent;
  const articleTitles = asArticles
    ? checklistItems.length >= 1
      ? checklistItems
      : [title]
    : null;
  const titlesToInsert = articleTitles ?? [title];

  let tasks;
  try {
    tasks = await insertInboxTasks(supabase, {
      userId,
      boardId: board.id,
      inboxColumnId,
      titles: titlesToInsert,
    });
  } catch (insertError) {
    return { error: insertError.message };
  }

  const task = tasks[0];
  if (!task) return { error: 'No se pudo crear la tarea.' };

  if (!asArticles && checklistItems.length >= 2) {
    const rows = checklistItems.map((itemTitle, index) => ({
      task_id: task.id,
      title: itemTitle,
      done: false,
      position: index,
    }));
    const { error: checkError } = await supabase.from('task_checklist_items').insert(rows);
    if (checkError) {
      console.error('checklist insert:', checkError);
    }
  }

  return {
    board,
    task,
    usedGemini,
    items: articleTitles ?? (checklistItems.length >= 2 ? checklistItems : []),
    shopping: Boolean(articleTitles),
  };
}

export async function listPendingTasks(supabase, userId) {
  const board = await getDefaultBoard(supabase, userId);
  if (!board) {
    return { error: 'No tienes un tablero por defecto.' };
  }

  let inboxColumnId = await getInboxColumnId(supabase, board.id);
  if (!inboxColumnId) {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, title')
      .eq('board_id', board.id)
      .eq('status', 'backlog')
      .order('position', { ascending: true });
    if (error) return { error: error.message };
    return { board, tasks: tasks ?? [] };
  }

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, title')
    .eq('board_id', board.id)
    .eq('column_id', inboxColumnId)
    .order('position', { ascending: true });

  if (error) return { error: error.message };

  return { board, tasks: tasks ?? [] };
}

export async function listBlockedTasks(supabase, userId) {
  const board = await getDefaultBoard(supabase, userId);
  if (!board) {
    return { error: 'No tienes un tablero por defecto.' };
  }

  let blockersColumnId = await getBlockersColumnId(supabase, board.id);
  if (!blockersColumnId) {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, title')
      .eq('board_id', board.id)
      .eq('status', 'in-review')
      .order('position', { ascending: true });
    if (error) return { error: error.message };
    return { board, tasks: tasks ?? [] };
  }

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, title')
    .eq('board_id', board.id)
    .eq('column_id', blockersColumnId)
    .order('position', { ascending: true });

  if (error) return { error: error.message };

  return { board, tasks: tasks ?? [] };
}
