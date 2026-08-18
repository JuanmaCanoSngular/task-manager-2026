/** Definición de columna por defecto al crear tablero (sin id). */
export const DEFAULT_COLUMN_DEFS = [
  { name: 'Pendiente', color: '#64748b', slug: 'backlog', isInbox: true, position: 0 },
  { name: 'En progreso', color: '#eab308', slug: 'in-progress', isInbox: false, position: 1 },
  { name: 'Bloqueos', color: '#ef4444', slug: 'in-review', isInbox: false, position: 2 },
  { name: 'Completada', color: '#4ade80', slug: 'completed', isInbox: false, position: 3 },
] as const;

/** Columnas internas de una lista de la compra (la UI no las muestra como Kanban). */
export const SHOPPING_COLUMN_DEFS = [
  { name: 'Por comprar', color: '#0d9488', slug: 'backlog', isInbox: true, position: 0 },
  { name: 'Comprado', color: '#22c55e', slug: 'completed', isInbox: false, position: 1 },
  { name: 'Descartado', color: '#94a3b8', slug: 'discarded', isInbox: false, position: 2 },
] as const;

export const columnDefsForKind = (kind: 'kanban' | 'shopping' = 'kanban') =>
  kind === 'shopping' ? SHOPPING_COLUMN_DEFS : DEFAULT_COLUMN_DEFS;

export interface BoardColumn {
  id: number;
  boardId: number;
  name: string;
  color: string;
  position: number;
  slug: string | null;
  isInbox: boolean;
}

import { APP_COLOR_PRESETS } from '../constants/color-presets';

export type BoardColumnDraft = Pick<BoardColumn, 'name' | 'color'>;

export const COLUMN_COLOR_PRESETS = APP_COLOR_PRESETS;

interface ColumnRow {
  id: number;
  board_id: number;
  name: string;
  color: string;
  position: number;
  slug: string | null;
  is_inbox: boolean;
}

export const rowToColumn = (row: ColumnRow): BoardColumn => ({
  id: row.id,
  boardId: row.board_id,
  name: row.name,
  color: row.color,
  position: row.position,
  slug: row.slug,
  isInbox: row.is_inbox,
});

export const sortColumns = (columns: BoardColumn[]): BoardColumn[] =>
  [...columns].sort((a, b) => a.position - b.position);

export const getInboxColumn = (columns: BoardColumn[]): BoardColumn | undefined =>
  columns.find((c) => c.isInbox);

export const getBlockersColumn = (columns: BoardColumn[]): BoardColumn | undefined =>
  columns.find((c) => c.slug === 'in-review');

export const getShoppingBoughtColumn = (columns: BoardColumn[]): BoardColumn | undefined =>
  columns.find((c) => c.slug === 'completed') ?? columns.find((c) => /comprado/i.test(c.name));

export const getShoppingDiscardedColumn = (columns: BoardColumn[]): BoardColumn | undefined =>
  columns.find((c) => c.slug === 'discarded') ?? columns.find((c) => /descartad/i.test(c.name));
