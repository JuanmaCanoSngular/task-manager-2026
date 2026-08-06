import { Task } from './task.interface';

export interface Board {
  id: number;
  name: string;
  emoji: string;
  color: string;
  link: string;
  tasks: Task[];
  /** Tablero que se abre al cargar la app. Solo uno a la vez. */
  isDefault: boolean;
  isLocal?: boolean;
}

// Paleta curada para el color principal del tablero.
export const BOARD_COLORS = [
  '#0d9488', // teal (marca)
  '#8b5cf6', // violeta
  '#ec4899', // rosa
  '#f43f5e', // rojo
  '#f59e0b', // ámbar
  '#10b981', // esmeralda
  '#14b8a6', // teal claro
  '#0ea5e9', // azul cielo
  '#64748b', // pizarra
  '#0f172a', // tinta
] as const;

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
