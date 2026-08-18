import { describe, test, expect } from 'vitest';
import {
  columnDefsForKind,
  DEFAULT_COLUMN_DEFS,
  SHOPPING_COLUMN_DEFS,
  getShoppingBoughtColumn,
  getShoppingDiscardedColumn,
} from '../../src/interfaces/column.interface';
import { parseBoardKind, isShoppingBoard } from '../../src/interfaces/board.interface';

describe('columnDefsForKind', () => {
  test('kanban usa las columnas de estado', () => {
    expect(columnDefsForKind('kanban')).toBe(DEFAULT_COLUMN_DEFS);
    expect(columnDefsForKind()).toHaveLength(4);
  });

  test('shopping usa por comprar / comprado / descartado', () => {
    const defs = columnDefsForKind('shopping');
    expect(defs).toBe(SHOPPING_COLUMN_DEFS);
    expect(defs.map((d) => d.slug)).toEqual(['backlog', 'completed', 'discarded']);
    expect(defs.filter((d) => d.isInbox)).toHaveLength(1);
  });
});

describe('columnas shopping por nombre', () => {
  test('encuentra comprado y descartado aunque el slug falle', () => {
    const columns = [
      {
        id: 1,
        boardId: 1,
        name: 'Por comprar',
        color: '#0d9488',
        slug: 'backlog',
        isInbox: true,
        position: 0,
      },
      {
        id: 2,
        boardId: 1,
        name: 'Comprado',
        color: '#22c55e',
        slug: null,
        isInbox: false,
        position: 1,
      },
      {
        id: 3,
        boardId: 1,
        name: 'Descartado',
        color: '#94a3b8',
        slug: null,
        isInbox: false,
        position: 2,
      },
    ];
    expect(getShoppingBoughtColumn(columns)?.id).toBe(2);
    expect(getShoppingDiscardedColumn(columns)?.id).toBe(3);
  });
});

describe('parseBoardKind', () => {
  test('solo shopping es shopping; el resto es kanban', () => {
    expect(parseBoardKind('shopping')).toBe('shopping');
    expect(parseBoardKind('kanban')).toBe('kanban');
    expect(parseBoardKind(null)).toBe('kanban');
    expect(parseBoardKind('otro')).toBe('kanban');
  });
});

describe('isShoppingBoard', () => {
  test('detecta tableros de compra', () => {
    expect(isShoppingBoard({ kind: 'shopping' } as never)).toBe(true);
    expect(isShoppingBoard({ kind: 'kanban' } as never)).toBe(false);
    expect(isShoppingBoard(null)).toBe(false);
  });
});
