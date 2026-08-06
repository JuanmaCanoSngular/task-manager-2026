# Guía para desarrolladores — Onboarding

Bienvenido al proyecto Task Manager. Este documento está pensado para orientar a un desarrollador (especialmente junior) sobre el stack, la arquitectura, las decisiones claves, y las tareas habituales para desarrollar, testear y desplegar la aplicación.

Resumen rápido
--------------
- Repositorio: app React + TypeScript con Vite
- Estilo: Tailwind CSS
- Estado global: Zustand (stores en `src/stores`)
- Persistencia: Supabase (Postgres) — antes era `localStorage`
- Drag & drop: `@hello-pangea/dnd`
- Testing: Vitest + React Testing Library

Estructura principal
--------------------
- `src/` — código fuente
  - `components/` — componentes organizados por dominio (`boards`, `tasks`, `layout`, `common`)
  - `stores/` — stores de Zustand (estado global persistente)
  - `services/` — persistencia / llamadas externas (`supabase.ts` = cliente; `board.service.ts` = CRUD de boards y tasks)
  - `interfaces/` — tipos TypeScript para entidades (Board, Task)
  - `styles/` — CSS, utilidades y configuraciones Tailwind
  - `main.tsx` — punto de entrada

- `tests/` — tests unitarios e integración con la misma estructura que `src`
- `package.json` — scripts y dependencias
- `README.md` — documentación pública

Stack y por qué
----------------
- React + TypeScript: tipado estático para reducir errores y mejorar DX.
- Vite: bundler rápido durante desarrollo, recarga instantánea y build optimizado.
- Tailwind CSS: utilidades para diseño rápido y coherente.
- Zustand: store simple, sin boilerplate (ideal para este proyecto pequeño/mediano).
- Supabase: Postgres gestionado + API REST automática; capa de persistencia remota de boards y tasks.
- @hello-pangea/dnd: fork/alternativa de react-beautiful-dnd, ofrece una API estable para DnD.
- Vitest: tests rápidos, buena integración con Vite.

Principales conceptos y dónde buscarlos
--------------------------------------
- Componentes por dominio: busca en `src/components/boards` y `src/components/tasks` para ver cómo está organizado el UI.
- Stores (Zustand): `src/stores/board.store.ts` y `src/stores/theme.store.ts` contienen la lógica de estado; lee cómo se exponen hooks tipo `useBoardStore` o `useThemeStore`.
- Servicios: `src/services/supabase.ts` crea el cliente; `src/services/board.service.ts` encapsula el CRUD contra Supabase (getBoards, insertBoard, deleteBoard, insertTask, updateTask, deleteTask, saveTaskOrder). Modifica aquí si cambias cómo se guardan o cargan los datos.
- Interfaces: `src/interfaces/board.interface.ts` y `task.interface.ts` definen los contratos de datos — muy importante mantenerlos actualizados.

Ejemplo rápido: flujo para añadir una tarea
-----------------------------------------
1. Interacción: el usuario abre el modal de creación (`TaskModal` en `src/components/tasks/task-modal`).
2. Formulario: `TaskForm` valida los campos (título, descripción, etiquetas, fondo).
3. Guardado: el componente llama al store (`useBoardStore().addNewTask(...)`).
4. Actualización UI: Zustand actualiza el estado local de forma optimista; React re-renderiza las columnas pertinentes.
5. Persistencia: el store hace *write-through* asíncrono a Supabase vía `board.service`; si la escritura falla se refleja en `state.error`.

Hooks y patrones React usados
----------------------------
En este proyecto usarás tanto hooks de React como patrones comunes:

- Hooks nativos:
  - `useState` — estado local en componentes (formularios, controles temporales).
  - `useEffect` — efectos secundarios: cargar datos iniciales, suscribir eventos, sincronizar `localStorage`.
  - `useRef` — referenciar elementos DOM (focus management en modales o inputs).
  - `useMemo` / `useCallback` — memoización para evitar re-renders innecesarios en listas y handlers.

- Hooks de terceros / custom:
  - Zustand stores — se consumen como hooks (ej: `const { boards, addBoard } = useBoardStore()`).
  - Puedes crear custom hooks para lógica reutilizable (cache, formulários, validaciones). Ejemplo: `useBoards()` podría encapsular selección + filtros.

Buenas prácticas de desarrollo
----------------------------
- Mantén componentes pequeños y con una sola responsabilidad.
- Prefiere props explícitas sobre dependencias implícitas en stores cuando la unidad de prueba lo requiera.
- Types: tipa todo lo que puedas — parámetros de funciones, retornos, props.
- Accesibilidad: usa roles ARIA y testea con queries accesibles (`getByRole`, `getByLabelText`).

Testing
-------
- Herramientas: `vitest` + `@testing-library/react`.
- Ubicación: `tests/` mantiene la misma estructura que `src`.
- Mocks: los tests de servicio/store mockean el cliente Supabase (`vi.mock('../../src/services/supabase')`, con `vi.hoisted` por el hoisting de la factory). Utilidades comunes en `tests/utils/`.
- Mocks del DOM: `ResizeObserver` y `matchMedia` se simulan en utilidades de test.
- Ejecutar tests:

```bash
npm test
```

Estrategia para añadir una nueva feature
---------------------------------------
1. Diseña la API de datos y types en `src/interfaces`.
2. Implementa cambios en `stores/` si afectan al estado global.
3. Añade componentes en `components/` siguiendo la organización por dominio.
4. Agrega servicios en `services/` si necesitas persistencia o integración externa.
5. Escribe tests primeros (unit / component) o al menos tests que cubran el flujo crítico.
6. Ejecuta `npm test` y corrige problemas.

Debugging rápido
----------------
- Logs: usa `console.log` en stores o servicios; recuerda eliminarlos o convertirlos en `debug` antes de merge.
- Herramienta: `pnpm`/`npm` scripts — `npm run dev` arranca Vite con HMR.
- Reproducir tests: `npm test -- -t 'nombre test'` para correr tests específicos.

Scripts importantes (ver también `package.json`)
------------------------------------------------
- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run preview` — preview del build
- `npm test` — ejecutar tests
- `npm run lint` — ejecutar ESLint
- `npm run format` — Prettier

Supabase (persistencia)
-----------------------
La app persiste boards y tasks en Supabase (Postgres).

- Cliente: `src/services/supabase.ts`, configurado con variables de entorno.
- Variables (en `.env`, ver `.env.example`):

```bash
VITE_SUPABASE_URL="https://TU-PROYECTO.supabase.co"
VITE_SUPABASE_ANON_KEY="tu-anon-key"
```

- Esquema: `supabase/schema.sql` crea las tablas `boards` y `tasks` y carga
  datos iniciales. Ejecútalo en el SQL Editor del proyecto Supabase.
- Carga: `fetchBoards()` trae todos los boards con sus tasks de una vez.
- Escritura: cada mutación del store sincroniza con la DB de forma asíncrona.
- Orden del drag & drop: se persiste con `saveTaskOrder`.

Seguridad (importante): hoy NO hay autenticación. Las políticas de RLS están
abiertas al rol `anon`, así que cualquiera con la anon key lee y escribe los
mismos datos (compartidos, sin `user_id`). Es aceptable para demo. El
aislamiento por usuario (login + `user_id` + RLS `auth.uid() = user_id`) se
abordará en la fase de autenticación. La `anon key` es pública por diseño; la
`service_role` key NUNCA debe ir al cliente ni al repo. `.env` está en
`.gitignore`.

Autenticación y acceso restringido (Fase 3, en curso)
-----------------------------------------------------
El acceso es por invitación: login con Google (Supabase Auth) + aprobación
manual del owner. Detrás del flag `VITE_AUTH_ENABLED` (en `false` la app
funciona sin auth, como antes).

Frontend:
- `src/services/auth.service.ts` — login Google, sesión, estado de acceso, solicitud.
- `src/hooks/useAuth.ts` — estados `loading` / `signed-out` / `pending` / `approved`.
- `src/components/auth/` — `Landing`, `PendingAccess`, `AuthGate` (envuelve la app).

Backend (Supabase Edge Functions, en `supabase/functions/`):
- `request-access` — la invoca el cliente tras el login; crea el perfil
  `pending` con un token y envía email al owner (Resend) con el enlace de aprobación.
- `approve-access` — la abre el owner desde el email; valida el token (un solo
  uso), marca `approved` y provisiona un tablero de ejemplo para el usuario.
- `agent-create-task` — cerebro del agente (Gemini): texto → tarea en el
  tablero `is_default`, columna Pendiente. Secret: `GEMINI_API_KEY`.
- `telegram-link` — genera/consulta/elimina vínculo Telegram (JWT).
- `telegram-webhook` — updates del bot (sin JWT; `TELEGRAM_WEBHOOK_SECRET`).
  Guía: [`supabase/TELEGRAM.md`](supabase/TELEGRAM.md).
  Schema: [`supabase/telegram-schema.sql`](supabase/telegram-schema.sql).
- `delete-account` — borra Auth + datos del usuario autenticado (JWT).

Frontend (Telegram):
- `src/services/telegram.service.ts`
- `src/components/auth/TelegramLinkButton.tsx` — en el header con auth.
- `src/components/auth/UserMenu.tsx` — avatar: cerrar sesión / eliminar cuenta.

Datos: `supabase/auth-schema.sql` (tabla `profiles`, `user_id` en boards/tasks,
RLS por usuario); `supabase/telegram-schema.sql` (vínculos Telegram);
`supabase/realtime-tasks.sql` (Realtime en `tasks` para refresco en vivo);
`supabase/tags-schema.sql` (etiquetas por usuario: Urgente / Importante / Idea).

Despliegue
----------
- La app es una SPA estática. En el repo se ha configurado para desplegar en Vercel (ver `README.md`). Para deploy manual, crear build y subir `dist/`.
- Keep-alive Supabase (plan free): `.github/workflows/keepalive-supabase.yml`
  (cron cada 3 días). Secrets del repo GitHub: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
  (mismos valores que `VITE_SUPABASE_*` del cliente).

Consejos para PRs y revisión de código
-------------------------------------
- Haz PRs pequeños y con foco (una feature / bugfix por PR).
- Incluye capturas o GIFs si la PR cambia UI/UX.
- Agrega tests para nuevos comportamientos.
- Añade una breve descripción técnica en el PR sobre la decisión de diseño.

Archivos clave (ubicaciones)
---------------------------
- Documento con instrucciones: [README.md](README.md)
- Entrada app: [src/main.tsx](src/main.tsx)
- Stores: [src/stores](src/stores)
- Componentes principales: [src/components](src/components)
- Servicios: [src/services](src/services)
- Tests: [tests](tests)

Preguntas frecuentes (FAQ)
--------------------------
- ¿Dónde agregar un nuevo hook? → `src/hooks/` si la lógica puede reutilizarse en muchos componentes; si es local, dentro del componente.
- ¿Cuándo usar el store frente a props? → usa store para estado global/compartido; props para datos locales y composición.
- ¿Cómo persistir datos? → mediante Supabase. El store actualiza el estado local y hace *write-through* a la base de datos a través de `board.service.ts`. Encapsula cualquier llamada nueva en `services/`.

Recursos y lectura recomendada
-----------------------------
- React docs: https://react.dev/
- Vite: https://vitejs.dev/
- Zustand: https://github.com/pmndrs/zustand
- Testing Library: https://testing-library.com/docs/react-testing-library/intro

¿Qué hago si necesito más ayuda?
--------------------------------
Abre una issue o comenta en el canal de Slack/Teams con: descripción breve, pasos para reproducir, resultados esperados y reales, y archivos/PRs relacionados.

---
Documento creado para onboarding — si quieres, puedo generar una versión más larga con ejemplos de código paso a paso y pequeñas tareas de práctica para un junior.
