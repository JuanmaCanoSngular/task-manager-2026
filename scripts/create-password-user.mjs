#!/usr/bin/env node
/**
 * Crea o actualiza un usuario Auth por nickname + contraseña (email sintético)
 * y deja el perfil approved.
 *
 * Crear o cambiar contraseña (misma orden):
 *
 *   NICKNAME=elisabeth PASSWORD='***' \
 *   SUPABASE_SERVICE_ROLE_KEY='***' \
 *   node scripts/create-password-user.mjs
 *
 * Si el usuario ya existe, solo actualiza la contraseña y el perfil.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DOMAIN = 'users.taskblero.local';

function loadDotEnv() {
  const path = resolve(process.cwd(), '.env');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadDotEnv();

const nickname = (process.env.NICKNAME || '').trim().toLowerCase();
const password = process.env.PASSWORD || '';
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!nickname || nickname.length < 2) {
  console.error('Falta NICKNAME (mín. 2 caracteres).');
  process.exit(1);
}
if (!/^[a-z0-9]([a-z0-9._-]*[a-z0-9])?$/i.test(nickname)) {
  console.error('NICKNAME no válido.');
  process.exit(1);
}
if (!password || password.length < 6) {
  console.error('Falta PASSWORD (mín. 6 caracteres).');
  process.exit(1);
}
if (!url || !serviceKey) {
  console.error('Faltan SUPABASE_URL (o VITE_SUPABASE_URL) y SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const email = `${nickname}@${DOMAIN}`;
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserIdByEmail(targetEmail) {
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (hit) return hit.id;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

let userId = null;
let action = 'creado';

const { data: created, error: createError } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { nickname },
});

if (!createError && created?.user) {
  userId = created.user.id;
} else {
  const already =
    createError &&
    (/already|registered|exists/i.test(createError.message) || createError.status === 422);
  if (!already) {
    console.error('No se pudo crear el usuario:', createError?.message);
    process.exit(1);
  }
  userId = await findUserIdByEmail(email);
  if (!userId) {
    console.error('El usuario parece existir, pero no se encontró por email:', email);
    process.exit(1);
  }
  const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
    user_metadata: { nickname },
  });
  if (updateError) {
    console.error('No se pudo cambiar la contraseña:', updateError.message);
    process.exit(1);
  }
  action = 'contraseña actualizada';
}

const { error: profileError } = await admin.from('profiles').upsert(
  {
    id: userId,
    email,
    status: 'approved',
    approved_at: new Date().toISOString(),
    approval_token: null,
  },
  { onConflict: 'id' }
);

if (profileError) {
  console.error(`Auth ${action}, pero falló profiles:`, profileError.message);
  console.error('UID:', userId);
  process.exit(1);
}

const { data: boards } = await admin.from('boards').select('id').eq('user_id', userId).limit(1);
if (!boards?.length) {
  const { data: board, error: boardError } = await admin
    .from('boards')
    .insert({
      user_id: userId,
      name: 'Bienvenida',
      emoji: '👋',
      color: '#0d9488',
      is_default: true,
      kind: 'kanban',
    })
    .select('id')
    .single();

  if (boardError) {
    console.warn('Perfil ok; tablero no creado:', boardError.message);
  } else if (board) {
    const cols = [
      { board_id: board.id, name: 'Pendiente', color: '#64748b', slug: 'backlog', is_inbox: true, position: 0 },
      { board_id: board.id, name: 'En progreso', color: '#eab308', slug: 'in-progress', is_inbox: false, position: 1 },
      { board_id: board.id, name: 'Bloqueos', color: '#ef4444', slug: 'in-review', is_inbox: false, position: 2 },
      { board_id: board.id, name: 'Completada', color: '#4ade80', slug: 'completed', is_inbox: false, position: 3 },
    ];
    const { error: colError } = await admin.from('board_columns').insert(cols);
    if (colError) console.warn('Columnas no creadas:', colError.message);
  }
}

console.log(`OK: ${nickname} → ${email} (${action}, approved)`);
console.log(`UID: ${userId}`);
console.log('Entra en la app con Usuario = nickname (sin el email).');
