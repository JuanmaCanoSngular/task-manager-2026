# Roadmap del proyecto

Este documento recoge la propuesta de evolución del proyecto para convertir la app en una herramienta más completa, personalizable y preparada para uso real.

## Visión general

La idea es avanzar por fases, priorizando mejoras que aporten valor de negocio y experiencia de usuario sin hacer el proyecto demasiado complejo de mantener.

La app se mantiene únicamente en español (la internacionalización se descartó de forma explícita).

## Fase 1 — Personalización

### 1. Etiquetas personalizadas
- Permitir crear nuevas etiquetas desde la interfaz.
- Cada etiqueta podrá tener nombre y color.
- Eliminar la idea de depender de etiquetas predefinidas.
- Guardar estas etiquetas junto con el contenido del board.

## Fase 2 — Persistencia real y colaboración

### 2. Persistir datos en Supabase
- Mover la persistencia de datos del navegador a una base de datos remota.
- Permitir que boards, tareas y etiquetas se guarden de forma persistente.
- Evitar depender únicamente de `localStorage`.

### 3. Soporte para múltiples usuarios
- Cada usuario verá únicamente sus propios boards y tareas.
- Esto permitirá una experiencia más realista y escalable.

## Fase 3 — Autenticación

Enfoque elegido: acceso por invitación con login de Google (Supabase Auth) y
aprobación manual del owner. Se descartó el login por email + código.

### 4. Login federado con Google
- Login con Google vía Supabase Auth.
- El email verificado por Google identifica al usuario.

### 5. Acceso restringido con aprobación manual
- Al entrar por primera vez se crea una solicitud (perfil `pending`).
- El owner recibe un email (Resend) con un enlace de aprobación de un solo uso.
- Al aprobar, se marca `approved` y se provisiona un tablero de ejemplo.

### 6. Multiusuario con RLS
- `user_id` en boards/tasks y políticas RLS `auth.uid() = user_id`.
- Cada usuario solo ve y edita sus propios datos.

## Fase 4 — Agente IA (Gemini)

### 7. Añadir tareas por lenguaje natural desde el móvil
- Integrar un agente basado en Google Gemini que interprete instrucciones en lenguaje natural (ej.: "añade una tarea para llamar al cliente mañana").
- El agente traduce la instrucción a una llamada estructurada (function calling) que crea la tarea en el gestor.
- Acceso desde el móvil (PWA o endpoint ligero) para capturar tareas sobre la marcha.
- Requiere que la persistencia (Fase 2) y la autenticación (Fase 3) estén resueltas: el agente necesita saber en qué cuenta/board escribir.

## Propuesta de prioridad

### Prioridad alta
1. Etiquetas personalizadas
2. Persistencia en Supabase

### Prioridad media
3. Autenticación por email + código de verificación
4. Soporte multiusuario

### Prioridad baja
5. OAuth con proveedor externo
6. Agente IA con Gemini

## Diseño recomendado para la implementación

### Arquitectura propuesta
- React + TypeScript seguirá siendo la base.
- Zustand se mantendrá para estado local y UI.
- Supabase se añadirá como capa de persistencia y autenticación.
- Los servicios de acceso a datos se encapsularán en `src/services` para mantener el código limpio.
- El agente IA se expondrá mediante una función de servidor (Edge Function de Supabase o similar) que valide el usuario y llame a Gemini; nunca desde el cliente con la clave expuesta.

### Modelo de datos sugerido
- `users` o `profiles`
- `boards`
- `tasks`
- `tags`

### Recomendación de enfoque
- Empezar por el MVP más útil: etiquetas personalizadas.
- Después pasar a persistencia en Supabase y autenticación.
- Dejar el agente IA para el final, cuando exista cuenta de usuario y datos persistentes donde escribir.
- No intentar implementar todo a la vez, porque aumentaría mucho el riesgo de errores.

## Entregables por iteración

### Iteración 1
- Crear y editar etiquetas personalizadas
- Persistencia de boards, tareas y etiquetas en Supabase

### Iteración 2
- Autenticación por email y código de verificación
- Soporte multiusuario (aislamiento de datos por usuario)

### Iteración 3
- OAuth opcional
- Agente IA con Gemini para crear tareas por lenguaje natural
- Refinamiento de UX y mejoras de rendimiento

## Notas finales

Este roadmap busca que el proyecto evolucione de una demo técnica a una app más seria, usable y preparada para crecer. La prioridad está en mejorar la experiencia del usuario y la estabilidad de la arquitectura antes de añadir funcionalidad compleja.
