import { APP_COLOR_PRESETS } from '../constants/color-presets';

/** Etiqueta de un tablero (tabla `tags`). */
export interface Tag {
  id: string;
  name: string;
  /** Color hex (#rrggbb) */
  color: string;
}

/** Semilla al aprobar acceso / primer uso. */
export const DEFAULT_TAGS: ReadonlyArray<Pick<Tag, 'name' | 'color'>> = [
  { name: 'Urgente', color: '#ef4444' },
  { name: 'Importante', color: '#f59e0b' },
  { name: 'Idea', color: '#06b6d4' },
] as const;

export const TAG_COLOR_PRESETS = APP_COLOR_PRESETS;

export const MAX_TAGS_PER_TASK = 4;

/** Sin filtro → todas. Con ids → la tarea tiene al menos una de esas etiquetas. */
export const taskMatchesTagFilter = (taskTagIds: string[], filterIds: string[]) =>
  filterIds.length === 0 || filterIds.some((id) => taskTagIds.includes(id));

