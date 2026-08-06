# Telegram bot — setup

Un solo bot para toda la app. Cada usuario vincula su chat una vez desde la web
(«Telegram» en el header). El webhook usa Gemini para crear tareas en el
tablero por defecto → columna Pendiente.

## 1. SQL

En el SQL Editor de Supabase, ejecuta:

[`supabase/telegram-schema.sql`](telegram-schema.sql)

## 2. BotFather

1. Habla con [@BotFather](https://t.me/BotFather) → `/newbot`
2. Guarda el token (`123456:ABC…`)
3. Anota el username del bot (sin `@`)

## 3. Secrets en Supabase

```bash
supabase secrets set \
  TELEGRAM_BOT_TOKEN="123456:ABC..." \
  TELEGRAM_WEBHOOK_SECRET="$(openssl rand -hex 24)" \
  TELEGRAM_BOT_USERNAME="TuBotUsername" \
  GEMINI_API_KEY="tu-clave-ai-studio"
```

`TELEGRAM_WEBHOOK_SECRET` protege el webhook (header
`X-Telegram-Bot-Api-Secret-Token`). Guárdalo: lo necesitas al registrar el webhook.

## 4. Deploy de functions

```bash
supabase functions deploy --project-ref etbxynbhqzbhzogxytnn
```

(O push a `main` si el workflow de deploy está activo.)

## 5. Registrar webhook

Sustituye `TOKEN`, `SECRET` y el project ref si cambia:

```bash
curl -s "https://api.telegram.org/botTOKEN/setWebhook" \
  -d "url=https://etbxynbhqzbhzogxytnn.supabase.co/functions/v1/telegram-webhook" \
  -d "secret_token=SECRET" \
  -d "allowed_updates=[\"message\"]"
```

Comprobar:

```bash
curl -s "https://api.telegram.org/botTOKEN/getWebhookInfo"
```

## 6. Uso

1. Login en la app → **Telegram** → **Generar código**
2. Abre el deep link o envía `/start CODIGO` al bot
3. Texto libre → tarea en Pendiente
4. `/pendientes` · `/bloqueos` · `/desvincular` · `/ayuda`

## Functions

| Function | JWT | Rol |
|----------|-----|-----|
| `telegram-link` | sí | status / generate / unlink |
| `telegram-webhook` | no | updates de Telegram |
| `agent-create-task` | sí | mismo cerebro (HTTP); Telegram usa `_shared/agent.js` |
