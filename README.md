# Taskblero — Kanban personal

![Deploy](https://img.shields.io/badge/deploy-vercel-000000?style=for-the-badge&logo=vercel)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Tests](https://img.shields.io/badge/tests-vitest-yellow?style=for-the-badge)

**Producción:** [https://taskblero.vercel.app/](https://taskblero.vercel.app/)

**Taskblero** es un gestor de tareas con tablero Kanban: columnas personalizables, etiquetas, tema claro/oscuro, persistencia en Supabase y —opcionalmente— acceso restringido con Google, bot de **Telegram** y agente **Gemini** para crear tareas por mensaje.

---

## Características

- Tableros Kanban con **columnas personalizables** (crear, renombrar, colores, reordenar)
- Tareas con título, etiquetas (hasta 4), anclar arriba de la columna y drag & drop
- Tema claro/oscuro con transición animada
- Persistencia en **Supabase** (Postgres) con sincronización en tiempo real
- **Auth opcional** (`VITE_AUTH_ENABLED`): login Google + aprobación manual del owner
- **Telegram + Gemini** (opcional): vincular el chat y crear tareas en lenguaje natural
- Diseño responsive y accesible (ARIA, teclado)
- Tests con Vitest + React Testing Library

---

## Arranque rápido

**Requisitos:** Node.js 18+, cuenta en [Supabase](https://supabase.com).

```bash
git clone https://github.com/JuanmaCanoSngular/task-manager-2026.git
cd task-manager-2026
npm install
cp .env.example .env   # rellena VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev            # http://localhost:5173
```

1. Crea un proyecto en Supabase.
2. Ejecuta los scripts SQL en el orden de **[docs/SETUP.md](docs/SETUP.md)** (sección *Base de datos*).
3. Pon las credenciales del proyecto en `.env`.

> **Modo demo:** deja `VITE_AUTH_ENABLED="false"` — la app funciona sin login (datos compartidos).
>
> **Modo producción:** auth, OAuth, Edge Functions y secrets — ver **[docs/SETUP.md](docs/SETUP.md)**.

---

## Documentación

Toda la documentación técnica está en **[docs/](docs/README.md)**:

| Documento | Contenido |
|-----------|-----------|
| **[docs/SETUP.md](docs/SETUP.md)** | Variables, SQL, auth, Telegram, Gemini, arquitectura, despliegue |
| **[supabase/TELEGRAM.md](supabase/TELEGRAM.md)** | Setup del bot (BotFather, webhook) |
| **[ROADMAP.md](ROADMAP.md)** | Evolución del producto |

---

## Stack

React · TypeScript · Vite · Tailwind CSS · Zustand · Supabase · @hello-pangea/dnd · Headless UI · Vitest

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Previsualizar build |
| `npm test` | Tests |
| `npm run lint` | ESLint |
| `npm run typecheck` | Comprobación de tipos |

---

## Despliegue

SPA estática en [Vercel](https://taskblero.vercel.app/). Configura las mismas variables `VITE_*` en el panel del hosting. Checklist completo en [docs/SETUP.md](docs/SETUP.md).

---

## Licencia

MIT — ver [LICENSE](LICENSE).
