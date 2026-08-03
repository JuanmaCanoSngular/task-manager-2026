// Preview de los emails del flujo de acceso.
//
//   node scripts/preview-emails.mjs           -> escribe HTML en scripts/email-preview/
//   node scripts/preview-emails.mjs --send    -> además los envía a PREVIEW_TO por Resend
//
// Usa la MISMA plantilla que las Edge Functions (supabase/functions/_shared/emails.js),
// así que lo que ves es exactamente lo que se envía en producción.
//
// Variables (de .env): RESEND_API_KEY, FROM_EMAIL, APP_URL. PREVIEW_TO opcional
// (por defecto juanmacano@gmail.com).

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ownerRequestEmail,
  requestReceivedEmail,
  approvedEmail,
  deniedEmail,
} from '../supabase/functions/_shared/emails.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Carga simple de .env (sin dependencias).
function loadEnv() {
  const path = join(root, '.env');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnv();

const APP_URL = process.env.APP_URL || 'https://task-manager-2026-beta.vercel.app';
const PREVIEW_TO = process.env.PREVIEW_TO || 'juanmacano@gmail.com';
const APPROVE_URL = 'https://ejemplo.supabase.co/functions/v1/approve-access?token=demo&action=approve';
const DENY_URL = 'https://ejemplo.supabase.co/functions/v1/approve-access?token=demo&action=deny';

const emails = {
  'owner-request': ownerRequestEmail('usuario.demo@example.com', APPROVE_URL, DENY_URL),
  'request-received': requestReceivedEmail(),
  approved: approvedEmail(APP_URL),
  denied: deniedEmail(),
};

// 1) Escribir HTML local para abrir en el navegador.
const outDir = join(__dirname, 'email-preview');
mkdirSync(outDir, { recursive: true });
for (const [name, { html }] of Object.entries(emails)) {
  writeFileSync(join(outDir, `${name}.html`), html);
}
console.log(`HTML escrito en ${outDir}`);
console.log('Ábrelos en el navegador:', Object.keys(emails).map((n) => `${n}.html`).join(', '));

// 2) Enviar por Resend si se pasa --send.
if (process.argv.includes('--send')) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;
  if (!apiKey || !from) {
    console.error('Falta RESEND_API_KEY o FROM_EMAIL en .env; no se envía.');
    process.exit(1);
  }

  for (const [name, { subject, html }] of Object.entries(emails)) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: PREVIEW_TO, subject: `[preview:${name}] ${subject}`, html }),
    });
    console.log(`${name} -> ${res.ok ? 'enviado' : 'ERROR ' + (await res.text())}`);
  }
  console.log(`Enviados a ${PREVIEW_TO}`);
}
