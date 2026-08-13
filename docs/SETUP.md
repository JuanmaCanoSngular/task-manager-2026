# Guía de configuración y desarrollo

Documentación para **poner en marcha**, **configurar** y **extender** el proyecto.

- Presentación y arranque rápido: [README.md](../README.md)
- Índice de toda la documentación: [docs/README.md](README.md)

---

## Índice

1. [Dos modos de uso](#dos-modos-de-uso)
2. [Arranque local](#arranque-local)
3. [Variables y API keys](#variables-y-api-keys)
4. [Base de datos (SQL)](#base-de-datos-sql)
5. [Autenticación y acceso](#autenticación-y-acceso)
6. [Telegram y Gemini](#telegram-y-gemini)
7. [Edge Functions](#edge-functions)
8. [Arquitectura del código](#arquitectura-del-código)
9. [Testing y despliegue](#testing-y-despliegue)

---

## Dos modos de uso

| | Modo demo | Modo producción |
|---|-----------|-----------------|
| `VITE_AUTH_ENABLED` | `false` | `true` |
| Login | No | Google OAuth |
| Datos | Compartidos (RLS abierta o demo) | Aislados por `user_id` |
| Telegram / Gemini | Opcional | Opcional |
| Emails (Resend) | No necesarios | Necesarios para aprobar accesos |

La mayoría de equipos pueden empezar en **modo demo** para probar la UI. El modo producción añade auth, RLS por usuario, aprobación manual y provisioning de tablero de ejemplo.

---

## Arranque local

```bash
git clone https://github.com/JuanmaCanoSngular/task-manager-2026.git
cd task-manager-2026
npm install
cp .env.example .env
# Edita .env con tu URL y anon key de Supabase
npm run dev    # http://localhost:5173
```

Scripts habituales: `npm test` · `npm run build` · `npm run lint` · `npm run typecheck`

---

## Variables y API keys

### Cliente — archivo `.env` (raíz del repo)

Estas variables van en el **frontend** (prefijo `VITE_`). La `anon key` es pública por diseño; **nunca** pongas la `service_role` en el cliente.

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `VITE_SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sí | Clave anónima (Settings → API) |
| `VITE_AUTH_ENABLED` | No | `"true"` activa login + gate de acceso. Default efectivo: `false` |

### Supabase — secrets de Edge Functions

Se configuran en **Supabase Dashboard → Edge Functions → Secrets** o con `supabase secrets set`.

| Secret | Cuándo | Para qué |
|--------|--------|----------|
| `RESEND_API_KEY` | Auth activo | Envío de emails (solicitud y aprobación de acceso) vía [Resend](https://resend.com) |
| `OWNER_EMAIL` | Auth activo | Email del administrador que recibe las solicitudes |
| `FROM_EMAIL` | Auth activo | Remitente verificado en Resend |
| `GEMINI_API_KEY` | Telegram / agente | Clave de [Google AI Studio](https://aistudio.google.com/apikey). Convierte texto libre en tarea estructurada |
| `GEMINI_MODEL` | Opcional | Modelo Gemini (default: `gemini-3.1-flash-lite`) |
| `TELEGRAM_BOT_TOKEN` | Telegram | Token del bot desde [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_BOT_USERNAME` | Telegram | Username del bot (sin `@`) para deep links desde la web |
| `TELEGRAM_WEBHOOK_SECRET` | Telegram | String aleatorio; protege el webhook (`X-Telegram-Bot-Api-Secret-Token`) |
| `UNSPLASH_ACCESS_KEY` | Buscador de imágenes (A6) | Access Key de [Unsplash Developers](https://unsplash.com/oauth/applications) |

Supabase inyecta automáticamente `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` al desplegar functions.

### GitHub Actions — keep-alive (plan free de Supabase)

Workflow: `.github/workflows/keepalive-supabase.yml` (cron cada 3 días).

| Secret del repo | Valor |
|-----------------|-------|
| `SUPABASE_URL` | Igual que `VITE_SUPABASE_URL` |
| `SUPABASE_ANON_KEY` | Igual que `VITE_SUPABASE_ANON_KEY` |

---

## Base de datos (SQL)

Ejecuta los scripts en el **SQL Editor** de Supabase, en este orden, en un proyecto **nuevo**:

| Orden | Archivo | Qué hace |
|-------|---------|----------|
| 1 | `supabase/schema.sql` | Tablas `boards` y `tasks`, datos de ejemplo, RLS demo |
| 2 | `supabase/auth-schema.sql` | Perfiles, `user_id`, RLS por usuario (necesario con auth) |
| 3 | `supabase/alter-default-board.sql` | Columna `is_default` en tableros |
| 4 | `supabase/alter-id-sequences.sql` | IDs autoincrementales en Postgres |
| 5 | `supabase/tags-schema.sql` | Etiquetas por usuario |
| 6 | `supabase/columns-schema.sql` | Columnas personalizables (`board_columns`, `tasks.column_id`) |
| 7 | `supabase/add-task-background.sql` | Columna `tasks.background` (URL de imagen) si no existe |
| 8 | `supabase/comments-schema.sql` | Comentarios en tareas (`task_comments`) |
| 9 | `supabase/realtime-tasks.sql` | Publicación Realtime para refresco en vivo |
| 10 | `supabase/telegram-schema.sql` | Vínculos Telegram ↔ usuario (solo si usas el bot) |

> Si el proyecto ya existía sin columnas personalizables, basta con ejecutar `columns-schema.sql` (y los que falten de la lista).

### Google OAuth (solo modo producción)

En Supabase → **Authentication → Providers → Google**: activa Google y configura el Client ID/Secret de Google Cloud Console. Añade la URL de callback que indica Supabase.

---

## Autenticación y acceso

Flujo cuando `VITE_AUTH_ENABLED=true`:

1. El usuario inicia sesión con **Google** (Supabase Auth).
2. La Edge Function `request-access` crea un perfil `pending` y envía email al **owner** (Resend).
3. El owner abre el enlace del email → `approve-access` marca el usuario como `approved` y crea un tablero de ejemplo con columnas por defecto.
4. El frontend (`AuthGate`) solo muestra la app si `status === 'approved'`.

**Frontend relevante:**

- `src/services/auth.service.ts` — login, sesión, estado de acceso
- `src/hooks/useAuth.ts` — `loading` / `signed-out` / `pending` / `approved`
- `src/components/auth/` — `Landing`, `PendingAccess`, `AuthGate`, `UserMenu`

**Desplegar functions de auth:**

```bash
supabase functions deploy request-access approve-access delete-account --project-ref TU-PROJECT-REF
```

Secrets mínimos: `RESEND_API_KEY`, `OWNER_EMAIL`, `FROM_EMAIL`.

---

## Telegram y Gemini

Funcionalidad **opcional** pero diferenciadora: crear y consultar tareas desde Telegram sin abrir la web.

### Qué hace Gemini

- **Modelo:** `gemini-3.1-flash-lite` por defecto (rápido y económico).
- **Entrada:** mensaje en lenguaje natural (ej. *«Mañana llamar al cliente sobre el presupuesto»*).
- **Salida:** título de tarea (+ metadatos si el agente los infiere) insertados en el **tablero por defecto** del usuario, columna **Pendiente**.
- **Dónde se usa:**
  - `supabase/functions/telegram-webhook` — mensajes del bot
  - `supabase/functions/agent-create-task` — mismo cerebro vía HTTP (JWT)
  - Lógica compartida en `supabase/functions/_shared/agent.js`

### Qué hace Telegram

1. El usuario inicia sesión en la web y pulsa **Telegram** en el header.
2. `telegram-link` genera un código de vinculación (deep link al bot).
3. El usuario envía `/start CODIGO` al bot o abre el enlace.
4. A partir de ahí puede:
   - Escribir texto libre → nueva tarea en Pendiente (vía Gemini)
   - `/pendientes` — listar tareas pendientes
   - `/bloqueos` — listar bloqueos
   - `/desvincular` — quitar el vínculo
   - `/ayuda` — comandos disponibles

**Setup paso a paso:** [supabase/TELEGRAM.md](../supabase/TELEGRAM.md) (BotFather, secrets, deploy, webhook).

**Frontend:** `src/services/telegram.service.ts` · `src/components/auth/TelegramLinkButton.tsx`

> Sin `GEMINI_API_KEY` el agente no puede interpretar mensajes. Sin secrets de Telegram el botón de vincular en la web no tendrá efecto útil.

### Buscador de imágenes (Unsplash)

1. Crea una app en [Unsplash Developers](https://unsplash.com/oauth/applications) y copia la **Access Key**.
2. Secret: `supabase secrets set UNSPLASH_ACCESS_KEY=...`
3. Despliega la función: `supabase functions deploy search-images --project-ref TU-PROJECT-REF`
4. En el modal de tarea: busca → elige thumbnail → vista previa → **Usar esta imagen**.

Sin la Access Key, la UI sigue permitiendo pegar URL manual; la búsqueda devolverá un error claro.

---

## Edge Functions

| Function | JWT | Rol |
|----------|-----|-----|
| `request-access` | No* | Solicitud de acceso tras login Google |
| `approve-access` | No | Aprobación desde email (token de un uso) |
| `delete-account` | Sí | Borrar cuenta y datos del usuario |
| `telegram-link` | Sí | Generar / consultar / eliminar vínculo Telegram |
| `telegram-webhook` | No | Recibir updates de Telegram (protegido por secret) |
| `agent-create-task` | Sí | Crear tarea vía agente Gemini (HTTP) |
| `search-images` | Sí* | Buscar imágenes en Unsplash (`UNSPLASH_ACCESS_KEY`) |

\*El cliente envía el JWT del usuario en `Authorization` cuando hay sesión. `search-images` solo necesita la anon key de invocación.

Despliegue de todas:

```bash
supabase functions deploy --project-ref TU-PROJECT-REF
```

---

## Arquitectura del código

```
src/
├── components/
│   ├── boards/       # Tablero, columnas, DnD
│   ├── columns/      # Gestor de columnas
│   ├── tasks/        # Tarjetas, modal, formulario
│   ├── tags/         # Gestor de etiquetas
│   ├── auth/         # Login, Telegram, menú usuario
│   ├── common/       # ColorPicker, ConfirmDialog, ErrorBanner
│   └── layout/       # Shell, tema
├── stores/           # Zustand (board, tag, theme)
├── services/         # Supabase, board, column, auth, telegram
├── interfaces/       # Tipos TypeScript
├── constants/        # Paleta de colores compartida
└── utils/            # Helpers (color, tiempo relativo)
```

### Flujo típico: crear una tarea

1. Usuario pulsa **Añadir nueva tarea** (sidebar) → `TaskModal` + `TaskForm`.
2. El formulario valida título, columna y etiquetas.
3. `useBoardStore().addNewTask()` actualiza el estado local (optimista).
4. `board.service.insertTask()` persiste en Supabase.
5. Realtime (si está activo) sincroniza otros clientes.

### Persistencia

- **Cliente:** `src/services/supabase.ts`
- **CRUD tableros/tareas:** `src/services/board.service.ts`
- **Columnas:** `src/services/column.service.ts`
- **Estado global:** `src/stores/board.store.ts` (write-through async; errores en `state.error`)

### Stack

React + TypeScript · Vite · Tailwind · Zustand (+ immer) · Supabase · @hello-pangea/dnd · Headless UI · Vitest + Testing Library

---

## Testing y despliegue

```bash
npm test              # todos los tests
npm run test:coverage # cobertura
npm test -- -t "nombre"  # un test concreto
```

Los tests mockean Supabase (`tests/utils/`). `ResizeObserver` y `matchMedia` se simulan en utilidades comunes.

### Despliegue frontend

Build estático (`dist/`). En **Vercel** (o similar) configura las variables `VITE_*` del entorno de producción.

### Checklist producción

- [ ] SQL ejecutado en orden
- [ ] `.env` / variables de hosting con `VITE_SUPABASE_*`
- [ ] `VITE_AUTH_ENABLED=true` si aplica
- [ ] Google OAuth configurado en Supabase
- [ ] Edge Functions desplegadas + secrets (Resend, etc.)
- [ ] (Opcional) Telegram: secrets + webhook según [TELEGRAM.md](../supabase/TELEGRAM.md)
- [ ] (Opcional) GitHub secrets para keep-alive

---

## FAQ

**¿Dónde añado lógica de negocio nueva?**  
Types en `interfaces/` → store en `stores/` → servicio en `services/` → UI en `components/`.

**¿Puedo usar la app sin Telegram ni Gemini?**  
Sí. Son opcionales. Solo necesitas Supabase para el Kanban web.

**¿La anon key es secreta?**  
No es un secreto de servidor (va en el cliente), pero la RLS debe impedir accesos no autorizados en producción.

**¿Más detalle del bot?**  
[supabase/TELEGRAM.md](../supabase/TELEGRAM.md)

**¿Roadmap del producto?**  
[ROADMAP.md](../ROADMAP.md)

---

*Última revisión: agosto 2026 — columnas personalizables, ColorPicker, auth y Telegram.*
