# Roadmap del proyecto

Documento vivo de evolución del gestor de tareas. Prioriza valor de uso real
sin sobrecargar el mantenimiento.

La app se mantiene únicamente en español (la internacionalización se descartó).

---

## Visión

Pasar de una demo Kanban a una herramienta personalizable, usable fuera del
escritorio (voz / mensajería) y con identidad de producto clara.

**Pendiente (columna `backlog`) es el punto de entrada de todas las tareas
nuevas** — backlog de captura. El agente / dictado crea siempre ahí, en el
tablero por defecto del usuario.

---

## Estado actual (agosto 2026)

### Completado

| Área | Detalle |
|------|---------|
| Persistencia | Boards y tasks en Supabase; IDs por secuencia Postgres |
| Auth | Login Google + aprobación + emails + Edge Functions; `VITE_AUTH_ENABLED`; RLS/`user_id`; menú cuenta (cerrar / borrar) |
| Tablero por defecto | `is_default`; estrella; carga al entrar |
| Columna Bloqueos | Label **Bloqueos** + rojo (status interno `in-review`) |
| Marca / UI | Tinta + teal; logo columnas; Source Sans 3 self-hosted |
| Tema | Claro/oscuro: View Transitions + `clip-path`; toggle sol/luna en header |
| Etiquetas | CRUD por usuario; estándar Urgente / Importante / Idea |
| Imagen tarjeta | URL externa opcional (`tasks.background`); sin hosting |
| Telegram | Bot + Gemini: vincular, crear, `/pendientes`, `/bloqueos` |
| Keep-alive | Cron GitHub Actions cada 3 días (Supabase free) |
| Idioma | Solo español |
| Calidad | Tests + deploy Vercel |
| Comentarios | Hilo simple por tarea en modal de edición (`task_comments`) |

### Pendiente relevante

- **A6** Buscador de imágenes en creación/edición de tarea (thumbnails, vista grande, quitar/cambiar).
- Voz en Telegram / canales extra (WhatsApp, Alexa) — Fase D ampliación.
- **F1** Posible integración bidireccional con Google Calendar (exploración).
- Dominio corto `juanmacano.eu/tablero` → producción (**E1**, al final).
- Ejecutar `supabase/columns-schema.sql` en Supabase si el tablero aún no carga columnas.

---

## Fase A — Producto e identidad

### A1. Nombre y header — ✅ decidido

- Nombre oficial: **Task Manager App** (se mantiene; no se busca otro).
- Tagline: *Tu tablero, sin ruido.*
- Logo: tres columnas + punto rojo (Bloqueos).
- Look: tinta + teal; Source Sans 3 (self-hosted).

### A2. Columna «Bloqueos» — ✅ (MVP)

- Renombrada desde «En revisión»; indicador rojo.
- En la provisión de usuarios nuevos hay una tarea de ejemplo en Bloqueos.
- Queda pendiente en A3 que sea una columna editable por tablero (no solo label global).

### A3. Columnas personalizables por tablero — ✅ (MVP)

- Tabla `board_columns` por tablero (`supabase/columns-schema.sql`).
- CRUD en UI: botón **Columnas** en el tablero (renombrar, color, añadir, eliminar con cascade de tareas).
- Reordenar columnas arrastrando la cabecera; scroll horizontal solo en el área del tablero si hay >4 columnas.
- Kanban, DnD, formularios y Telegram usan `column_id`; inbox (`is_inbox`) = Pendiente.
- SQL pendiente en Supabase si aún no se ejecutó: `supabase/columns-schema.sql`.

### A4. Imagen de fondo de tarjeta (URL) — ✅

- URL http(s) en `tasks.background`; preview en modal y tarjeta.
- Sin Unsplash ni hosting. SQL si falta la columna: `supabase/add-task-background.sql`.
- Ampliación prevista en **A6** (buscador integrado; sigue sin almacenar archivos propios).

### A5. Comentarios en tarea — ✅ (MVP)

- Añadir, editar y eliminar comentarios dentro de una tarea (hilo simple, no colaboración multi-usuario).
- Caso de uso: al pasar a Bloqueos, dejar contexto — p. ej. *«Pasado a bloqueo: llamar el martes a Julián a ver si me manda el listado»*.
- Tabla `task_comments` (`supabase/comments-schema.sql`): `task_id`, `body`, `created_at`, `updated_at`, `user_id`.
- UI en modal de edición de tarea (`TaskComments`).

### A6. Buscador de imágenes en la tarea

- Ampliación de **A4**: buscar imágenes **desde el modal de crear/editar tarea** (sin pegar URL a mano).
- Flujo orientativo:
  1. Campo de búsqueda (p. ej. por título de la tarea o texto libre).
  2. Resultados en **grid de thumbnails**; seleccionar una.
  3. **Vista previa en grande** (lightbox) antes de confirmar.
  4. Tras guardar: **quitar**, **cambiar** o volver a buscar otra.
- Sigue guardándose solo la **URL externa** en `tasks.background` (sin storage propio).
- API de imágenes vía **Edge Function** (Unsplash, Pexels u otro proveedor con API key en servidor).
- UI en `TaskForm` / `TaskImageUrl`: mantener también la opción de pegar URL manual.
- Prioridad media; tras **A5** o en paralelo si A5 se alarga.

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

## Fase C — Auth / datos (casi hecho)

### C1. Acceso restringido — ✅ en uso

- Google + perfiles + RLS + `user_id` + secuencias de ID + borrado de cuenta.
- Pendiente menor: mantener `docs/` al día con el estado real.

### C2. Etiquetas personalizadas — ✅

- Tabla `tags` por usuario (`supabase/tags-schema.sql`).
- Estándar al aprobar: **Urgente**, **Importante**, **Idea**.
- CRUD en UI («Etiquetas» en header + Gestionar en el modal de tarea).
- `tasks.tags` guarda UUIDs de etiquetas.

---

## Fase D — Agente Telegram + Gemini (móvil)

### Objetivo de producto

Estar fuera → hablar o escribir a un **bot de Telegram** → crear cards o
consultar pendientes/bloqueos **sin abrir la web**.

La UI web **no** incluye captura con IA (redundante con el formulario normal).

### Estado MVP — ✅ en uso

- Edge Function `agent-create-task` + `_shared/agent.js`: Gemini → tarea en
  tablero default + Pendiente.
- Edge Functions `telegram-webhook` + `telegram-link`: bot, emparejamiento,
  crear / listar. Setup: [`supabase/TELEGRAM.md`](supabase/TELEGRAM.md).
- UI: botón «Telegram» en el header (código de vinculación).

### Infra MVP Telegram

| Pieza | Rol |
|-------|-----|
| BotFather / token | `TELEGRAM_BOT_TOKEN` en secrets |
| Edge Function `telegram-webhook` | Updates; chat↔user; create / list |
| Edge Function `telegram-link` | Códigos de emparejamiento (JWT) |
| Tablas `channel_links` + `channel_link_codes` | `telegram-schema.sql` |
| Emparejamiento | `/start` + código en la app (una vez) |
| `GEMINI_API_KEY` | NL (voz: siguiente) |

Comandos:

- Mensaje libre → crear en Pendiente del default
- `/pendientes` → lista de backlog
- `/bloqueos` → tareas en Bloqueos
- `/desvincular` · `/ayuda`

### Ampliación (media prioridad)

- Voz en Telegram (mensajes de audio → Gemini).
- WhatsApp / Alexa más adelante.
- Tras A3: mapear `/pendientes` y `/bloqueos` a columnas por tablero, no a
  status globales hardcodeados.

### D1. Criterios de aceptación (MVP) — ✅

1. Usuario empareja Telegram con su cuenta (una vez).
2. Texto en el bot → una tarea en `is_default` + `backlog`.
3. `/pendientes` responde con la lista del default.
4. Sin API keys en el cliente web.

---

## Fase E — Dominio corto (al final)

### E1. `juanmacano.eu/tablero` → URL final

- Hoy la app vive en Vercel; hay tunnel Cloudflare en juego.
- **No implementar ahora**: dejarlo para cuando la URL de producción y el
  branding estén estables.
- Enfoques posibles (elegir al final):
  1. **Cloudflare Redirect Rule / Bulk Redirect** — `juanmacano.eu/tablero` →
     `https://….vercel.app` (301/302). Lo más simple.
  2. **Cloudflare Worker** — rewrite/proxy si quieres misma origin o headers.
  3. **DNS CNAME** del subdominio (p. ej. `tablero.juanmacano.eu`) a Vercel +
     dominio custom en el proyecto.
- Preferencia inicial: Redirect Rule en Cloudflare hacia la URL Vercel
  definitiva (o dominio custom si ya está en Vercel). Documentar la regla
  cuando se haga.

---

## Fase F — Integraciones (exploración)

### F1. Google Calendar (bidireccional)

- Posible sincronización **bidireccional** con Google Calendar.
- Casos de uso orientativos:
  - Tarea con fecha límite o recordatorio → evento en el calendario.
  - Evento del calendario → tarea en Pendiente (o columna configurable).
- Requiere OAuth con Google Calendar API, mapeo tarea↔evento y reglas de
  resolución de conflictos (última modificación gana, o por origen).
- Prioridad baja; evaluar tras **A5** y cuando Telegram/voz estén estables.

---

## Fuera de alcance (por ahora)

- Internacionalización.
- Login por email + código (descartado; Google).
- Storage propio de imágenes (A6 usa URLs de terceros; no subimos archivos).
- Colaboración multi-usuario en el mismo tablero.
- Sync de tema multi-dispositivo.

---

## Prioridad recomendada

### Alta
1. **A6** Buscador de imágenes en la tarea (thumbnails + lightbox + quitar/cambiar)

### Media
2. **D** Voz en Telegram (luego WhatsApp / Alexa)
3. Docs: README + `docs/SETUP.md` al día

### Baja / exploración
4. **F1** Google Calendar bidireccional

### Al final
5. **E1** Redirect `juanmacano.eu/tablero` → URL de producción

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
tasks             — board_id, column_id, title, tags, background (URL), …
task_comments     — task_id, body, timestamps   ← A5 ✅
tags              — C2 ✅
channel_links     — user_id, provider, external_id    ← D Telegram ✅
```

---

## Entregables por iteración

### Hecho recientemente
- Tema (View Transitions) + toggle minimal
- Imagen por URL (sin Unsplash)
- Etiquetas, Telegram MVP, keep-alive, borrado de cuenta

### Siguiente — **A6 Buscador de imágenes**
- Edge Function + grid thumbnails en modal de tarea

### Después
- Voz / WhatsApp / Alexa
- **F1** Google Calendar bidireccional (exploración)
- **Al final:** redirect `juanmacano.eu/tablero`

---

## Notas

Pendiente = inbox de captura (humano, agente o canal externo). Bloqueos = rojo,
atención especial. El dominio corto es cosmética de acceso; se hace cuando la
URL final no vaya a cambiar.

**Mayor reto abierto: A3.** No es solo UI: hay que cambiar el modelo de datos,
migrar tareas, y que el Kanban + Telegram sigan entendiendo «inbox» y
«bloqueos» sin romper lo que ya funciona.
