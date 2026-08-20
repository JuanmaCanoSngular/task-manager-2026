# Roadmap del proyecto

Documento vivo de evolución del gestor de tareas. Prioriza valor de uso real
sin sobrecargar el mantenimiento.

La app se mantiene únicamente en español (la internacionalización se descartó).

---

## Visión

Herramienta personal Kanban, usable fuera del escritorio (voz / mensajería) y
con identidad de producto clara.

**Pendiente** (columna inbox / `is_inbox`) es el punto de entrada de todas las
tareas nuevas. El agente / dictado crea siempre ahí, en el tablero por defecto
del usuario.

Producción: [https://taskblero.vercel.app/](https://taskblero.vercel.app/)

---

## Estado actual (agosto 2026)

### Completado

| Área | Detalle |
|------|---------|
| Persistencia | Boards y tasks en Supabase; IDs por secuencia Postgres |
| Auth | Login Google + aprobación + emails + Edge Functions; `VITE_AUTH_ENABLED`; RLS/`user_id`; menú cuenta (cerrar / borrar) |
| Tablero por defecto | `is_default`; estrella; carga al entrar |
| Columnas | Personalizables por tablero (`board_columns`); Bloqueos en rojo (`slug` `in-review`) |
| Marca / UI | **Taskblero**; tinta + teal; logo columnas; Source Sans 3; OG/Twitter |
| Tema | Claro/oscuro: View Transitions + `clip-path`; toggle sol/luna en header |
| Etiquetas | CRUD por tablero; estándar Urgente / Importante / Idea; **filtro** en cabecera |
| Anclar | Chincheta: tarea fija arriba de su columna (`tasks.pinned`) |
| Comentarios | Hilo en el modal; icono + conteo en la card |
| Checklist | Subtareas / artículos en la tarea; Telegram lista → ítems |
| Telegram | Bot + Gemini: vincular, crear, voz, tablero indicado, `/pendientes`, `/bloqueos` |
| Keep-alive | Cron GitHub Actions cada 3 días (Supabase free) |
| Idioma | Solo español |
| Calidad | Tests + deploy Vercel |

### Pendiente relevante

- **D** Telegram (texto + voz) — ✅. WhatsApp y Alexa: descartados de momento.
- **F1** Posible integración bidireccional con Google Calendar (exploración).
- SQL en el proyecto de Supabase si aún falta: `columns-schema.sql`,
  `add-task-pinned.sql`, `tags-board-id.sql`, `checklist-schema.sql`,
  `boards-kind.sql`, `shopping-purge.sql`.

---

## Fase A — Producto e identidad

### A1. Nombre y header — ✅

- Nombre oficial: **Taskblero** (antes Task Manager App).
- URL: [https://taskblero.vercel.app/](https://taskblero.vercel.app/) (definitiva).
- Tagline: *Tu tablero, sin ruido.*
- Descripción: *Tu tablero de tareas, sin ruido. Personaliza columnas, etiquetas y mucho más. Más fácil que la tabla del uno.*
- Logo: tres columnas + punto rojo (Bloqueos).
- Look: tinta + teal; Source Sans 3 (self-hosted).

### A2. Columna «Bloqueos» — ✅

- Semilla por tablero: nombre **Bloqueos**, color rojo, `slug` `in-review`.
- Editable como el resto de columnas (A3).
- En la provisión de usuarios nuevos hay una tarea de ejemplo en Bloqueos.

### A3. Columnas personalizables por tablero — ✅

- Tabla `board_columns` (`supabase/columns-schema.sql`).
- CRUD en UI: botón **Columnas** (renombrar, color, añadir, eliminar con cascade).
- Reordenar arrastrando la cabecera; scroll horizontal si hay más de 4.
- Kanban, DnD, formularios y Telegram usan `column_id`; inbox (`is_inbox`) = Pendiente.

### A4. Imagen de fondo de tarjeta (URL) — descartado

- Se quitó: no aportaba valor (URL, Unsplash, portada en card).

### A5. Comentarios en tarea — ✅

- Añadir, editar y eliminar comentarios (hilo simple, no colaboración multi-usuario).
- Caso de uso: al pasar a Bloqueos, dejar contexto — p. ej. *«Pasado a bloqueo: llamar el martes a Julián a ver si me manda el listado»*.
- Tabla `task_comments` (`supabase/comments-schema.sql`).
- UI: modal (`TaskComments`) + badge en la card compacta.

### A6. Buscador de imágenes en la tarea — descartado

- Se retiró junto con A4 (Unsplash + `tasks.background`).

### A7. Anclar tareas — ✅

- Chincheta en la tarjeta: ancla arriba de su columna (`tasks.pinned`).
- El drag & drop no puede dejar una no anclada por encima de las ancladas.
- SQL: `supabase/add-task-pinned.sql`.

---

## Fase B — Preferencias y operación

### B1. Tema claro / oscuro — ✅

- `localStorage` (`theme-storage`); default oscuro; anti-FOUC con `public/theme.js`.
- View Transitions + `clip-path` en `::view-transition-new(root)` (600 ms).
- Toggle minimal sol/luna arriba a la izquierda.
- Sync multi-dispositivo vía Supabase: fuera de alcance por ahora.

### B2. Keep-alive Supabase (plan free) — ✅

- Workflow `.github/workflows/keepalive-supabase.yml`
- Cron cada 3 días + `workflow_dispatch`
- Secrets del repo: `SUPABASE_URL`, `SUPABASE_ANON_KEY`

---

## Fase C — Auth / datos

### C1. Acceso restringido — ✅ en uso

- Google + perfiles + RLS + `user_id` + secuencias de ID + borrado de cuenta.

### C2. Etiquetas personalizadas — ✅

- Tabla `tags` por tablero (`board_id`; `supabase/tags-schema.sql` + `tags-board-id.sql` si se migró desde etiquetas por usuario).
- Estándar al aprobar / al crear tablero: **Urgente**, **Importante**, **Idea**.
- CRUD en UI (gestor en el tablero + modal de tarea).
- Filtro en cabecera (OR entre etiquetas); recuento *Filtrando X de Y*; DnD de tareas desactivado con filtro.
- `tasks.tags` guarda UUIDs de etiquetas.

---

## Fase D — Agente Telegram + Gemini (móvil)

### Objetivo de producto

Estar fuera → hablar o escribir a un **bot de Telegram** → crear cards o
consultar pendientes/bloqueos **sin abrir la web**.

La UI web **no** incluye captura con IA (redundante con el formulario normal).

### Estado MVP — ✅ en uso

- Edge Function `agent-create-task` + `_shared/agent.js`: Gemini → tarea en
  tablero default + Pendiente (`is_inbox`).
- Edge Functions `telegram-webhook` + `telegram-link`: bot, emparejamiento,
  crear / listar. Setup: [`supabase/TELEGRAM.md`](supabase/TELEGRAM.md).
- `/pendientes` → columna inbox; `/bloqueos` → columna `slug` `in-review`.
- UI: botón «Telegram» en el header (código de vinculación).

### Infra MVP Telegram

| Pieza | Rol |
|-------|-----|
| BotFather / token | `TELEGRAM_BOT_TOKEN` en secrets |
| Edge Function `telegram-webhook` | Updates; chat↔user; create / list |
| Edge Function `telegram-link` | Códigos de emparejamiento (JWT) |
| Tablas `channel_links` + `channel_link_codes` | `telegram-schema.sql` |
| Emparejamiento | `/start` + código en la app (una vez) |
| `GEMINI_API_KEY` | NL + transcripción de voz |

Comandos:

- Mensaje libre → crear en Pendiente del default
- `/pendientes` → lista de inbox
- `/bloqueos` → tareas en Bloqueos
- `/desvincular` · `/ayuda`

### Ampliación

- **Hecho:** voz en Telegram (notas de voz → Gemini → tarea).
- WhatsApp y Alexa: **descartados de momento** (WhatsApp = Cloud API + negocio Meta;
  Alexa = skill + Account Linking, y la lista de la compra nativa de Amazon
  compite con la de Taskblero). El canal de captura fuera de la web es Telegram.

### D1. Criterios de aceptación (MVP) — ✅

1. Usuario empareja Telegram con su cuenta (una vez).
2. Texto en el bot → una tarea en `is_default` + inbox.
3. Nota de voz → transcripción Gemini → misma tarea en inbox.
4. `/pendientes` responde con la lista del default.
5. Sin API keys en el cliente web.

---

## Fase F — Integraciones (exploración)

### F1. Google Calendar (bidireccional)

- Posible sincronización **bidireccional** con Google Calendar.
- Casos de uso orientativos:
  - Tarea con fecha límite o recordatorio → evento en el calendario.
  - Evento del calendario → tarea en Pendiente (o columna configurable).
- Requiere OAuth con Google Calendar API, mapeo tarea↔evento y reglas de
  resolución de conflictos (última modificación gana, o por origen).
- Prioridad baja; evaluar cuando Telegram/voz estén estables.

---

## Fuera de alcance (por ahora)

- Internacionalización.
- Login por email + código (descartado; Google).
- Imágenes en tareas (URL / Unsplash / storage) — descartado; no aportaba valor.
- Dominio propio / redirect corto — descartado; vale [taskblero.vercel.app](https://taskblero.vercel.app/).
- Colaboración multi-usuario en el mismo tablero.
- Sync de tema multi-dispositivo.
- WhatsApp (Cloud API) y Alexa (skill) como canales del agente.

---

## Prioridad recomendada

### Alta
1. ~~**D** Telegram (texto + voz)~~ ✅ — canal de captura cerrado por ahora

### Media
2. Docs: README + `docs/SETUP.md` al día si cambia el setup

### Baja / exploración
3. **F1** Google Calendar bidireccional

---

## Arquitectura

- React + TypeScript + Vite + Tailwind + Zustand.
- Supabase: Postgres, Auth, Edge Functions, RLS.
- Agentes / LLM **solo en servidor**.

### Modelo de datos orientativo

```
profiles          — auth + status de acceso
boards            — user_id, name, color, is_default, …
columns           — board_id, name, color, position, slug, is_inbox   ← A3 ✅
tasks             — board_id, column_id, title, tags, pinned, …
task_comments     — task_id, body, timestamps   ← A5 ✅
tags              — C2 ✅ (por tablero + filtro)
channel_links     — user_id, provider, external_id    ← D Telegram ✅
```

---

## Entregables por iteración

### Hecho recientemente
- Voz en Telegram (nota de voz → Gemini → Pendiente)
- Filtro por etiqueta + recuento en cabecera
- Anclar tareas, comentarios en card, copy OG
- Columnas personalizables, Telegram MVP, keep-alive

### Siguiente
- Nada bloqueante en canales. Telegram cubre la captura fuera de la web.

### Después
- **F1** Google Calendar bidireccional (exploración)

---

## Notas

Pendiente = inbox de captura (humano, agente o canal externo). Bloqueos = rojo,
atención especial.
