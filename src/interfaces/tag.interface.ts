import type { CSSProperties } from 'react';
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

/** Estilos de chip seleccionado a partir del hex. */
export const tagChipStyle = (color: string, selected: boolean): CSSProperties => {
  if (!selected) return {};
  return {
    backgroundColor: `${color}22`,
    color,
    boxShadow: `inset 0 0 0 1px ${color}66`,
  };
};
