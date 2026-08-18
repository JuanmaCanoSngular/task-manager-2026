// Edge Function: telegram-webhook
// Recibe updates de Telegram. Un solo bot para toda la app.
//
// Comandos:
//   /start [CODIGO]  — vincula el chat con la cuenta (código desde la web)
//   /pendientes      — lista tareas en Pendiente del tablero por defecto
//   /bloqueos        — lista tareas en Bloqueos
//   /desvincular     — quita el vínculo de este chat
//   /ayuda           — ayuda
// Texto libre / nota de voz — crea tarea en Pendiente (Gemini)
//
// Secrets: TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, GEMINI_API_KEY,
//          SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  createTaskOnDefault,
  listPendingTasks,
  listBlockedTasks,
  transcribeAudioWithGemini,
} from '../_shared/agent.js';

const PROVIDER = 'telegram';
const MAX_VOICE_SECONDS = 90;
const MAX_AUDIO_BYTES = 4 * 1024 * 1024;

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const expectedSecret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET');
  if (expectedSecret) {
    const got = req.headers.get('X-Telegram-Bot-Api-Secret-Token') ?? '';
    if (got !== expectedSecret) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN missing');
    return new Response('OK', { status: 200 });
  }

  let update;
  try {
    update = await req.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  try {
    await handleUpdate(update, botToken);
  } catch (err) {
    console.error('telegram-webhook:', err);
    try {
      const message = update?.message ?? update?.edited_message;
      const chatId = message?.chat?.id;
      if (chatId) {
        const detail = err instanceof Error ? err.message : 'Error interno';
        await sendMessage(
          botToken,
          String(chatId),
          `No pude completar la acción: ${detail}`
        );
      }
    } catch (sendErr) {
      console.error('telegram-webhook notify failed:', sendErr);
    }
  }

  return new Response('OK', { status: 200 });
});

async function handleUpdate(update, botToken) {
  const message = update.message ?? update.edited_message;
  if (!message?.chat?.id) return;

  const chatId = String(message.chat.id);
  const text = typeof message.text === 'string' ? message.text.trim() : '';
  const caption = typeof message.caption === 'string' ? message.caption.trim() : '';
  const media = getAudioMedia(message);

  if (!text && !media) {
    await sendMessage(
      botToken,
      chatId,
      'Escribe una tarea o envía una nota de voz. /ayuda'
    );
    return;
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const cmd = parseCommand(text);

  if (cmd.name === 'start' || cmd.name === 'vincular') {
    await handleStart(supabase, botToken, chatId, cmd.arg);
    return;
  }
  if (cmd.name === 'ayuda' || cmd.name === 'help') {
    await sendMessage(botToken, chatId, helpText());
    return;
  }
  if (cmd.name === 'desvincular') {
    await handleUnlink(supabase, botToken, chatId);
    return;
  }

  const userId = await resolveUserId(supabase, chatId);
  if (!userId) {
    await sendMessage(
      botToken,
      chatId,
      'Tu Telegram aún no está vinculado.\n\n' +
        '1. Entra en la app web\n' +
        '2. Pulsa «Vincular Telegram»\n' +
        '3. Envía aquí el código con /start CODIGO'
    );
    return;
  }

  if (cmd.name === 'pendientes') {
    const result = await listPendingTasks(supabase, userId);
    if (result.error) {
      await sendMessage(botToken, chatId, result.error);
      return;
    }
    await sendMessage(botToken, chatId, formatTaskList('Pendiente', result.board.name, result.tasks));
    return;
  }

  if (cmd.name === 'bloqueos') {
    const result = await listBlockedTasks(supabase, userId);
    if (result.error) {
      await sendMessage(botToken, chatId, result.error);
      return;
    }
    await sendMessage(botToken, chatId, formatTaskList('Bloqueos', result.board.name, result.tasks));
    return;
  }

  if (text.startsWith('/')) {
    await sendMessage(botToken, chatId, 'Comando no reconocido. Prueba /ayuda.');
    return;
  }

  if (media) {
    await handleVoiceTask(supabase, botToken, chatId, userId, media, caption);
    return;
  }

  if (text.length > 2000) {
    await sendMessage(botToken, chatId, 'Ese mensaje es demasiado largo.');
    return;
  }

  await createAndConfirm(supabase, botToken, chatId, userId, text);
}

async function handleStart(supabase, botToken, chatId, code) {
  if (!code) {
    const linked = await resolveUserId(supabase, chatId);
    if (linked) {
      await sendMessage(
        botToken,
        chatId,
        'Ya estás vinculado. Escribe una tarea, envía una nota de voz o usa /pendientes, /bloqueos, /ayuda.'
      );
      return;
    }
    await sendMessage(
      botToken,
      chatId,
      'Para vincular tu cuenta, abre la app web → «Vincular Telegram» y envía:\n\n/start TU_CODIGO'
    );
    return;
  }

  const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const { data: row, error } = await supabase
    .from('channel_link_codes')
    .select('code, user_id, expires_at')
    .eq('code', normalized)
    .maybeSingle();

  if (error || !row) {
    await sendMessage(botToken, chatId, 'Código no válido. Genera uno nuevo en la app.');
    return;
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await supabase.from('channel_link_codes').delete().eq('code', normalized);
    await sendMessage(botToken, chatId, 'El código ha caducado. Genera uno nuevo en la app.');
    return;
  }

  // Un chat → un usuario; un usuario → un telegram
  await supabase.from('channel_links').delete().eq('provider', PROVIDER).eq('external_id', chatId);
  await supabase.from('channel_links').delete().eq('provider', PROVIDER).eq('user_id', row.user_id);

  const { error: upsertError } = await supabase.from('channel_links').insert({
    user_id: row.user_id,
    provider: PROVIDER,
    external_id: chatId,
  });

  if (upsertError) {
    console.error('link insert:', upsertError);
    await sendMessage(botToken, chatId, 'No pude vincular la cuenta. Inténtalo de nuevo.');
    return;
  }

  await supabase.from('channel_link_codes').delete().eq('user_id', row.user_id);

  await sendMessage(
    botToken,
    chatId,
    '🔗 Cuenta vinculada.\n\n' +
      'Escribe una tarea o envía una nota de voz → Pendiente.\n' +
      '/pendientes · /bloqueos · /ayuda'
  );
}

async function handleUnlink(supabase, botToken, chatId) {
  const { error } = await supabase
    .from('channel_links')
    .delete()
    .eq('provider', PROVIDER)
    .eq('external_id', chatId);

  if (error) {
    await sendMessage(botToken, chatId, 'No pude desvincular. Inténtalo más tarde.');
    return;
  }
  await sendMessage(botToken, chatId, 'Desvinculado. Para volver a usar el bot, genera un código en la app.');
}

async function resolveUserId(supabase, chatId) {
  const { data } = await supabase
    .from('channel_links')
    .select('user_id')
    .eq('provider', PROVIDER)
    .eq('external_id', chatId)
    .maybeSingle();
  return data?.user_id ?? null;
}

function parseCommand(text) {
  if (!text.startsWith('/')) return { name: null, arg: null };
  const withoutSlash = text.slice(1);
  const [rawName, ...rest] = withoutSlash.split(/\s+/);
  const name = (rawName.split('@')[0] || '').toLowerCase();
  const arg = rest.join(' ').trim() || null;
  return { name, arg };
}

function formatTaskList(columnLabel, boardName, tasks) {
  if (!tasks.length) {
    return `«${boardName}» — ${columnLabel}: (vacío)`;
  }
  const lines = tasks.slice(0, 30).map((t, i) => `${i + 1}. ${t.title}`);
  const more = tasks.length > 30 ? `\n…y ${tasks.length - 30} más` : '';
  return `«${boardName}» — ${columnLabel} (${tasks.length}):\n${lines.join('\n')}${more}`;
}

function helpText() {
  return (
    'Taskblero — bot\n\n' +
    '• Escribe una tarea en castellano → va a Pendiente\n' +
    '• Nota de voz → se transcribe y crea la tarea\n' +
    '• /pendientes — lista Pendiente\n' +
    '• /bloqueos — lista Bloqueos\n' +
    '• /desvincular — quita el vínculo\n' +
    '• /start CODIGO — vincula con tu cuenta web'
  );
}

function getAudioMedia(message) {
  if (message.voice) {
    return {
      fileId: message.voice.file_id,
      duration: message.voice.duration ?? 0,
      mimeType: message.voice.mime_type || 'audio/ogg',
    };
  }
  if (message.audio) {
    return {
      fileId: message.audio.file_id,
      duration: message.audio.duration ?? 0,
      mimeType: message.audio.mime_type || 'audio/mpeg',
    };
  }
  return null;
}

async function handleVoiceTask(supabase, botToken, chatId, userId, media, caption) {
  if (media.duration > MAX_VOICE_SECONDS) {
    await sendMessage(
      botToken,
      chatId,
      'La nota de voz es demasiado larga (máx. 1,5 min). Acórtala o escribe la tarea.'
    );
    return;
  }

  await sendChatAction(botToken, chatId, 'typing');

  let bytes;
  try {
    bytes = await downloadTelegramFile(botToken, media.fileId);
  } catch (err) {
    console.error('telegram audio download:', err);
    const tooBig = err instanceof Error && err.message.includes('too large');
    await sendMessage(
      botToken,
      chatId,
      tooBig
        ? 'El audio es demasiado pesado (máx. 4 MB). Envía una nota de voz más corta.'
        : 'No pude descargar el audio. Prueba otra vez.'
    );
    return;
  }

  let transcript;
  try {
    const extracted = await transcribeAudioWithGemini(bytes, media.mimeType);
    if (extracted && typeof extracted === 'object' && extracted.rejected === 'solo_castellano') {
      await sendMessage(
        botToken,
        chatId,
        'Solo entiendo notas de voz en castellano. Prueba otra vez o escribe la tarea.'
      );
      return;
    }
    transcript = typeof extracted === 'string' ? extracted : null;
  } catch (err) {
    console.error('telegram audio transcribe:', err);
    await sendMessage(
      botToken,
      chatId,
      'No pude transcribir el audio. Escribe la tarea o prueba con una nota más corta.'
    );
    return;
  }

  if (!transcript) {
    await sendMessage(botToken, chatId, 'No entendí el audio. Prueba a escribir la tarea.');
    return;
  }

  const combined = caption ? `${transcript}\n${caption}` : transcript;
  const preview = transcript.length > 180 ? `${transcript.slice(0, 177)}…` : transcript;
  await createAndConfirm(supabase, botToken, chatId, userId, combined, preview);
}

async function createAndConfirm(supabase, botToken, chatId, userId, text, transcriptPreview) {
  const result = await createTaskOnDefault(supabase, userId, text);
  if (result.error) {
    await sendMessage(botToken, chatId, result.error);
    return;
  }

  let body =
    `✅ Añadida a Pendiente en «${result.board.name}»:\n• ${result.task.title}` +
    (result.usedGemini ? '' : '\n_(sin Gemini: título = mensaje)_');
  if (transcriptPreview) {
    body += `\n\n«${transcriptPreview}»`;
  }
  await sendMessage(botToken, chatId, body);
}

async function downloadTelegramFile(botToken, fileId) {
  const infoRes = await fetch(
    `https://api.telegram.org/bot${botToken}/getFile?file_id=${encodeURIComponent(fileId)}`
  );
  const info = await infoRes.json();
  if (!info.ok || !info.result?.file_path) {
    throw new Error('getFile failed');
  }
  if ((info.result.file_size ?? 0) > MAX_AUDIO_BYTES) {
    throw new Error('audio too large');
  }
  const fileRes = await fetch(
    `https://api.telegram.org/file/bot${botToken}/${info.result.file_path}`
  );
  if (!fileRes.ok) throw new Error(`file download ${fileRes.status}`);
  const buf = new Uint8Array(await fileRes.arrayBuffer());
  if (buf.byteLength > MAX_AUDIO_BYTES) throw new Error('audio too large');
  return buf;
}

async function sendChatAction(botToken, chatId, action) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action }),
  });
  if (!res.ok) {
    console.error('sendChatAction failed:', res.status, await res.text());
  }
}

async function sendMessage(botToken, chatId, text) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    console.error('sendMessage failed:', res.status, await res.text());
  }
}
