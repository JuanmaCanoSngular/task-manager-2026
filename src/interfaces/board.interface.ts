import { Task } from './task.interface';
import { BoardColumn } from './column.interface';

export interface Board {
  id: number;
  name: string;
  emoji: string;
  color: string;
  link: string;
  columns: BoardColumn[];
  tasks: Task[];
  /** Tablero que se abre al cargar la app. Solo uno a la vez. */
  isDefault: boolean;
  isLocal?: boolean;
}

import { APP_COLOR_PRESETS } from '../constants/color-presets';

// Paleta curada para el color principal del tablero.
export const BOARD_COLORS = APP_COLOR_PRESETS;

/**
 * Garantiza exactamente un tablero por defecto cuando hay tableros:
 * - 1 tablero → ese es el default
 * - varios sin default → el primero
 * - varios con más de uno → se queda el primero marcado
 */
export const ensureSingleDefault = (boards: Board[]): Board[] => {
  if (boards.length === 0) return boards;
  if (boards.length === 1) {
    return boards[0].isDefault ? boards : [{ ...boards[0], isDefault: true }];
  }

  const firstDefaultIndex = boards.findIndex((b) => b.isDefault);
  if (firstDefaultIndex === -1) {
    return boards.map((b, i) => ({ ...b, isDefault: i === 0 }));
  }

  return boards.map((b, i) => ({
    ...b,
    isDefault: i === firstDefaultIndex,
  }));
};

export const getDefaultBoardId = (boards: Board[]): number | null => {
  const normalized = ensureSingleDefault(boards);
  return normalized.find((b) => b.isDefault)?.id ?? null;
};
