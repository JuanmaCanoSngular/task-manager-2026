# Roadmap del proyecto

Documento vivo de evolución del gestor de tareas. Prioriza valor de uso real
sin sobrecargar el mantenimiento.

La app se mantiene únicamente en español (la internacionalización se descartó).

---

## Visión

Pasar de una demo Kanban a una herramienta personalizable, usable fuera del
escritorio (voz / mensajería) y con identidad de producto clara.

---

## Estado actual (agosto 2026)

### Completado

| Área | Detalle |
|------|---------|
| Persistencia | Boards y tasks en Supabase (Postgres), write-through desde Zustand |
| Auth (código) | Login Google + solicitud de acceso + aprobación/denegación + emails (Resend) + Edge Functions + CI de deploy |
| UI | Sistema de diseño minimalista indigo; color de tablero con paleta curada |
| Idioma | Solo español (i18n eliminado) |
| Calidad | 266 tests, deploy en Vercel |

### En pausa / pendiente de activar

- **Auth en producción**: el código existe, pero `VITE_AUTH_ENABLED="false"` y
  `auth-schema.sql` aún no está aplicado. Activarlo implica migrar IDs
  (hoy `max+1` en cliente → riesgo de colisión) y cerrar RLS abierta.
- **Etiquetas personalizadas**: siguen siendo 9 tags fijas en inglés
  (`TASK_TAGS`). Sin CRUD ni tabla `tags`.

### Limitaciones actuales relevantes

- Columnas de estado **fijas** a nivel global (`backlog`, `in-progress`,
  `in-review`, `completed`) — no por tablero.
- Fondos de tarjeta vía Unsplash / aleatorios; no hay elección explícita de URL.
- Nombre de producto genérico: «Gestión de tareas».
- Preferencia de tema ya persistida en `localStorage` (Zustand `persist`);
  no en Supabase.

---

## Fase A — Producto e identidad (prioridad alta)

### A1. Nombre y header

- Sustituir «Gestión de tareas» por un **nombre propio** identificable
  (marca corta, memorable, usable en dominio y emails).
- Aplicar el nombre en header, landing de auth, títulos de email y README.
- Criterio: si quitas la nav, el primer viewport sigue siendo reconocible.

> Candidatos a valorar (borrador): *Kanban OS*, *Tablero*, *Flowboard*,
> *Lista Viva*, *Pizarra*. Decidir en esta fase; no bloquear el resto.

### A2. Columna «Bloqueos» por defecto

- Todo tablero nuevo (y seed / provisión de ejemplo) incluye una columna
  **Bloqueos** con indicador visual rojo (icono o punto).
- Encaja con el modelo de columnas personalizables (A3): Bloqueos será una
  columna por defecto del tablero, no un status hardcodeado eterno.

### A3. Columnas personalizables por tablero

Por cada tablero el usuario podrá:

- **Crear** columnas nuevas (nombre + color).
- **Renombrar** columnas existentes.
- **Cambiar el color** asociado a la columna.
- **Eliminar** una columna completa **incluyendo sus tareas**, con
  **confirmación explícita** (modal: nombre de la columna + nº de tareas
  afectadas).

Implicaciones técnicas:

- Dejar de usar `TASK_STATUS` global fijo.
- Nuevo modelo: tabla `columns` (o JSON en `boards`) con
  `board_id`, `name`, `color`, `position`, `is_default` / slug opcional.
- `tasks.status` pasa a referenciar `column_id` (o slug estable por tablero).
- Migración de los 4 estados actuales → columnas por board + Bloqueos.
- Drag & drop entre columnas dinámicas; orden de columnas persistido.

### A4. Imagen de fondo de tarjeta (URL remota)

- Eliminar (o degradar) el flujo de fondos aleatorios / Unsplash automático.
- El usuario elige una imagen **remota**:
  - Pegar URL, y/o
  - Buscar vía API (Unsplash u otra) y guardar solo la URL resultante.
- **No almacenamos binarios** de imagen; solo la URL en la tarea.
- Validación básica de URL + preview; fallback si la imagen falla al cargar.

---

## Fase B — Preferencias y operación (prioridad media)

### B1. Tema claro / oscuro — animación y persistencia

Estado hoy:

- Toggle con `transition-colors duration-300` en layout.
- Persistencia en **`localStorage`** vía Zustand (`theme-storage`).
- Default actual: oscuro (`isDark: true`).

Decisiones propuestas:

| Pregunta | Respuesta recomendada |
|----------|------------------------|
| ¿Persistir en Supabase? | **No**, salvo sync multi-dispositivo. El tema es preferencia de dispositivo/UI; `localStorage` es suficiente y más rápido (sin flash de login). |
| ¿Cuándo sí en Supabase? | Si tras activar auth queremos la misma preferencia en móvil y desktop; entonces `profiles.theme` + hidratar tras sesión. |
| Animación | Revisar FOUC al cargar (aplicar tema antes del paint / script en `index.html`); suavizar transición de fondos y bordes, no solo `color`. |

Tareas:

- Auditar animación light ↔ dark (saltos, contraste intermedio).
- Evitar flash al recargar (script temprano que lea `theme-storage`).
- Documentar la decisión en DEVELOPERS.MD.

### B2. Keep-alive de Supabase (plan free)

- El plan free pausa proyectos inactivos.
- Crear un **cron** (GitHub Actions `schedule` o similar) que haga un ping
  ligero a Supabase cada X días (p. ej. 3–5): health check / `select 1` /
  edge function mínima.
- Secrets en el repo; fallos visibles en Actions.
- Documentar intervalo y qué endpoint se usa.

---

## Fase C — Auth en producción (prioridad media, bloqueante para agente)

### C1. Activar acceso restringido

1. Migrar IDs de boards/tasks a identity o UUID (evitar colisiones).
2. Ejecutar `auth-schema.sql` por secciones (profiles → asignar `user_id` → cerrar RLS).
3. Poner `VITE_AUTH_ENABLED=true` en Vercel.
4. Actualizar README / DEVELOPERS (hoy dicen “sin auth”).

### C2. Etiquetas personalizadas (Fase 1 original, aún pendiente)

- CRUD de etiquetas (nombre + color) por usuario o por tablero.
- Sustituir `TASK_TAGS` hardcodeadas; labels en español.
- Tabla `tags` + relación con tasks.

---

## Fase D — Agente por voz / mensajería (estudio + MVP)

### D0. Estudio de viabilidad (primero)

Objetivo: desde fuera (móvil / casa), enviar **audio o texto** y que se cree
o consulte una tarea en el tablero del usuario.

| Canal | Viabilidad | Infra mínima | Notas |
|-------|------------|--------------|-------|
| **Telegram** | Alta | Bot + webhook (Edge Function o worker) + auth link usuario↔chat_id | API simple, gratis, buena para MVP |
| **WhatsApp** | Media–alta | Meta Cloud API (Business) o Twilio; verificación de negocio | Más fricción legal/setup; coste |
| **Alexa** | Media | Skill Alexa + account linking OAuth con nuestra auth | Más infra y certificación; útil en casa |
| **Gemini / LLM** | Necesario en todos | Edge Function con function calling → crear/listar tasks | Clave solo en servidor |

Conclusión preliminar: **Telegram + LLM es el MVP más realista**. WhatsApp y
Alexa como iteraciones posteriores si el flujo Telegram funciona.

Requisitos previos (bloqueantes):

- Auth activa y usuario identificado (Fase C).
- Persistencia estable y columnas modeladas (idealmente tras A3).
- Vinculación cuenta app ↔ identidad del canal (deep link / código de emparejamiento).

### D1. MVP propuesto (Telegram)

1. Bot de Telegram; comando `/start` + código de enlace a la app.
2. Mensaje de texto → interpretar con Gemini → `create_task` / `list_pending`.
3. Mensaje de **voz** → transcripción (Whisper API u otra) → mismo pipeline.
4. Respuesta de confirmación en el chat (“Creada en *Productividad* → Pendiente”).

### D2. Extensiones (posterior)

- WhatsApp Business / Twilio.
- Skill Alexa con account linking.
- Consultas: “¿qué tengo bloqueado?”, “muestra pendientes de hoy”.

---

## Fuera de alcance (por ahora)

- Internacionalización.
- Login por email + código (descartado; se eligió Google).
- Almacenamiento de ficheros de imagen en nuestro storage.
- Colaboración en el mismo tablero entre varios usuarios (solo aislamiento por `user_id`).

---

## Prioridad recomendada

### Alta
1. **A1** Nombre / marca del producto
2. **A3 + A2** Columnas personalizables (con Bloqueos por defecto)
3. **A4** Imagen de tarjeta por URL

### Media
4. **B1** Revisar animación y política de tema
5. **B2** Cron keep-alive Supabase
6. **C1** Activar auth en producción (+ migración de IDs)
7. **C2** Etiquetas personalizadas

### Baja / estudio
8. **D0 → D1** Viabilidad y MVP Telegram + voz
9. WhatsApp / Alexa

---

## Arquitectura (sin cambios de fondo)

- React + TypeScript + Vite + Tailwind + Zustand.
- Supabase: Postgres, Auth, Edge Functions.
- Servicios en `src/services`; mutaciones write-through desde el store.
- Agentes / webhooks **solo en servidor** (nunca API keys de LLM o Meta en el cliente).

### Modelo de datos orientativo (evolución)

```
profiles          — auth + status de acceso (+ theme opcional)
boards            — user_id, name, color, …
columns           — board_id, name, color, position  ← nuevo
tasks             — board_id, column_id, title, tags, background_url, …
tags              — user_id o board_id, name, color   ← pendiente C2
channel_links     — user_id, provider (telegram|…), external_id  ← Fase D
```

---

## Entregables por iteración

### Iteración 1 — Identidad y tablero flexible
- Nombre propio en header / landing / emails
- Columnas CRUD por tablero + Bloqueos por defecto
- Eliminar columna con confirmación (cascade de tasks)
- Fondo de card por URL (sin storage propio)

### Iteración 2 — Operación y auth real
- Keep-alive cron Supabase
- Pulido tema (anti-FOUC + animación)
- Activar auth + RLS + migración de IDs
- Etiquetas personalizadas

### Iteración 3 — Agente
- Estudio formal Telegram vs WhatsApp vs Alexa
- MVP Telegram (texto → tarea)
- Voz (transcripción → misma pipeline)
- Documentar límites y costes

---

## Notas

Este roadmap sustituye la versión anterior (Fases 1–4 con prioridades
desactualizadas: email+código, OAuth “futuro”, etc.). Lo ya construido
(persistencia, auth en código, UI) queda marcado como completado; lo nuevo
(columnas, marca, imagen URL, keep-alive, agente por canal) marca el foco.
