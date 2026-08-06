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
| Auth | Login Google + aprobación/denegación + emails + Edge Functions + CI; `VITE_AUTH_ENABLED` activo; inserts con `user_id` (RLS) |
| Tablero por defecto | `is_default`; estrella a la derecha; carga al entrar; un solo default |
| Columna Bloqueos | Label **Bloqueos** + color rojo (status interno `in-review`) |
| Marca / UI | Look tinta + teal; logo de columnas; botón Google moderno; cerrar sesión |
| Idioma | Solo español |
| Calidad | ~272 tests, deploy en Vercel |

### Pendiente relevante

- Columnas 100 % personalizables por tablero (CRUD + borrar con confirmación).
- Fondo de tarjeta por URL (sin storage).
- Etiquetas personalizadas (hoy tags fijas en inglés).
- Dominio corto `juanmacano.eu/tablero` → URL de producción (al final).

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

### A3. Columnas personalizables por tablero

- Crear / renombrar / color / eliminar (con confirmación y cascade de tasks).
- Modelo `columns` por `board_id`; dejar de hardcodear `TASK_STATUS`.
- **Pendiente** sigue siendo el inbox por defecto de tareas nuevas.

### A4. Imagen de fondo de tarjeta (URL remota)

- Pegar URL y/o buscar (Unsplash); guardar solo la URL, sin binarios.

---

## Fase B — Preferencias y operación

### B1. Tema claro / oscuro

- Hoy: `localStorage` (`theme-storage`); default oscuro.
- Revisar animación y anti-FOUC.
- Supabase solo si queremos sync multi-dispositivo.

### B2. Keep-alive Supabase (plan free) — ✅

- Workflow `.github/workflows/keepalive-supabase.yml`
- Cron cada 3 días + `workflow_dispatch`
- Secrets del repo: `SUPABASE_URL`, `SUPABASE_ANON_KEY`

---

## Fase C — Auth / datos (casi hecho)

### C1. Acceso restringido — ✅ en uso

- Google + perfiles + RLS + `user_id` + secuencias de ID.
- Pendiente menor: alinear README / DEVELOPERS con el estado real.

### C2. Etiquetas personalizadas

- CRUD nombre + color; sustituir `TASK_TAGS` en inglés.

---

## Fase D — Agente Telegram + Gemini (móvil)

### Objetivo de producto

Estar fuera → hablar o escribir a un **bot de Telegram** → crear cards o
consultar pendientes/bloqueos **sin abrir la web**.

La UI web **no** incluye captura con IA (redundante con el formulario normal).

### Cerebro (parcialmente en código)

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

### D1. Criterios de aceptación

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

## Fuera de alcance (por ahora)

- Internacionalización.
- Login por email + código (descartado; Google).
- Storage propio de imágenes.
- Colaboración multi-usuario en el mismo tablero.

---

## Prioridad recomendada

### Alta
1. **A3** Columnas personalizables (Pendiente = inbox; Bloqueos editable)

### Media
2. **A4** Imagen de tarjeta por URL
3. **B1** Tema (animación / FOUC)
4. **C2** Etiquetas personalizadas
5. **D** Voz en Telegram / WhatsApp / Alexa

### Al final
6. **E1** Redirect `juanmacano.eu/tablero` → URL de producción

---

## Arquitectura

- React + TypeScript + Vite + Tailwind + Zustand.
- Supabase: Postgres, Auth, Edge Functions, RLS.
- Agentes / LLM **solo en servidor**.

### Modelo de datos orientativo

```
profiles          — auth + status de acceso
boards            — user_id, name, color, is_default, …
columns           — board_id, name, color, position   ← A3
tasks             — board_id, status|column_id, title, tags, background_url, …
tags              — C2
channel_links     — user_id, provider, external_id    ← D Telegram+
```

---

## Entregables por iteración

### Iteración actual — Telegram + Gemini
- Bot + webhook + emparejar cuenta (código en UI)
- Crear tarea + `/pendientes` + `/bloqueos`
- Secrets: `GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`,
  `TELEGRAM_BOT_USERNAME` — ver `supabase/TELEGRAM.md`

### Siguiente — Tablero flexible + marca
- Nombre propio
- Columnas CRUD + Bloqueos/Pendiente como defaults de tablero
- Imagen por URL

### Operación
- Keep-alive, tema, etiquetas
- Voz / WhatsApp / Alexa
- **Al final:** redirect `juanmacano.eu/tablero`

---

## Notas

Pendiente = inbox de captura (humano, agente o canal externo). Bloqueos = rojo,
atención especial. El dominio corto es cosmética de acceso; se hace cuando la
URL final no vaya a cambiar.
