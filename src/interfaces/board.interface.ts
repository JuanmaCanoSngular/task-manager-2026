import { Task } from './task.interface';

export interface Board {
  id: number;
  name: string;
  emoji: string;
  color: string;
  link: string;
  tasks: Task[];
  isLocal?: boolean;
}

// Paleta curada para el color principal del tablero.
export const BOARD_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violeta
  '#ec4899', // rosa
  '#f43f5e', // rojo
  '#f59e0b', // ámbar
  '#10b981', // esmeralda
  '#14b8a6', // teal
  '#0ea5e9', // azul cielo
  '#64748b', // pizarra
  '#0f172a', // tinta
] as const;
