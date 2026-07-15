# Task Manager App — Desafío DevChallenges

![Deploy](https://img.shields.io/badge/deploy-vercel-000000?style=for-the-badge&logo=vercel)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Tests](https://img.shields.io/badge/tests-vitest-yellow?style=for-the-badge)

Demo en vivo: https://task-manager-mu-sandy.vercel.app/

Descripción breve
-----------------
Aplicación de gestión de tareas con interfaz tipo Kanban, creada para el reto "Task Manager App" de DevChallenges. Permite crear, editar, mover y filtrar tareas, con soporte para temas (claro/oscuro), accesibilidad y persistencia en el navegador.

Características principales
-------------------------
- ✅ Crear, editar y eliminar tareas con título, descripción, etiquetas y fondo opcional
- 🔁 Arrastrar y soltar (drag & drop) tareas entre columnas de estado
- 🏷 Etiquetas por tarea (hasta 4)
- 🌗 Tema claro/oscuro con persistencia
- ♿ Navegación por teclado y soporte ARIA para accesibilidad
- 💾 Persistencia local usando `localStorage`
- 📱 Diseño responsivo (móvil, tablet, escritorio)

Capturas y visuales
-------------------
Incluye capturas de pantalla en la carpeta `public/screenshots/` (no incluidas por defecto). Para añadir imágenes al README, sube las imágenes al repo y enlázalas así:

```markdown
![Tablero principal](public/screenshots/board.png)
```

Stack tecnológico
-----------------
- Frontend: React + TypeScript
- Bundler: Vite
- Estilos: Tailwind CSS
- State: Zustand (+ immer)
- Drag & Drop: @hello-pangea/dnd
- Componentes accesibles: Headless UI
- Tests: Vitest + React Testing Library
- Formato y calidad: Prettier, ESLint

Instalación y uso (rápido)
-------------------------
Requisitos: Node.js 18+ y npm o yarn.

```bash
# clona el repositorio
git clone https://github.com/yourusername/task-manager.git
cd task-manager

# instala dependencias
npm install

# servidor de desarrollo (abre http://localhost:5173)
npm run dev

# pruebas en modo watch
npm test

# build de producción
npm run build
```

Scripts útiles
--------------
- `npm run dev` — servidor de desarrollo
- `npm run build` — build para producción
- `npm run preview` — previsualizar build de producción
- `npm test` — ejecutar tests
- `npm run lint` — linting del código
- `npm run format` — formatear con Prettier

Estructura del proyecto
-----------------------
Las partes relevantes del repo:

```
src/
├─ components/        # Componentes React (boards, tasks, layout, etc.)
├─ services/          # Lógica de persistencia / servicios auxiliares
├─ stores/            # Stores de Zustand
├─ interfaces/        # Tipos TypeScript
├─ styles/            # CSS y utilidades Tailwind
└─ main.tsx           # Entrada de la aplicación
```

Testing
-------
El proyecto incluye tests unitarios y de componentes con `vitest` y `@testing-library/react`.

```bash
# ejecutar tests
npm test

# ejecutar coverage
npm run test:coverage
```

Despliegue
---------
Es una SPA estática: se puede desplegar en Vercel, Netlify, GitHub Pages o cualquier hosting estático. Con Vercel la integración es inmediata si conectas el repositorio.

Buenas prácticas y accesibilidad
--------------------------------
- Sigue buenas prácticas de accesibilidad (ARIA, focus management)
- Evita cargas de imágenes innecesarias para mejorar rendimiento
- Añade tests al crear nueva funcionalidad

Contribuir
---------
1. Haz fork
2. Crea una rama: `git checkout -b feature/mi-cambio`
3. Haz commits claros y atómicos
4. Abre un Pull Request

Próximos pasos
--------------
- Revisar y actualizar dependencias (lo haremos a continuación)
- Añadir capturas de pantalla y gif de interacción

Licencia
--------
Proyecto con licencia MIT — ver archivo `LICENSE`.

Créditos
-------
- Reto: DevChallenges — https://devchallenges.io/

Creado con ❤️ para la comunidad DevChallenges
