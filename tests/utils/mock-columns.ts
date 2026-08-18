import { vi } from 'vitest';
import { BoardColumn } from '../../src/interfaces/column.interface';
import { Task } from '../../src/interfaces/task.interface';

export const MOCK_COLUMNS: BoardColumn[] = [
  {
    id: 1,
    boardId: 1,
    name: 'Pendiente',
    color: '#64748b',
    slug: 'backlog',
    isInbox: true,
    position: 0,
  },
  {
    id: 2,
    boardId: 1,
    name: 'En progreso',
    color: '#eab308',
    slug: 'in-progress',
    isInbox: false,
    position: 1,
  },
  {
    id: 3,
    boardId: 1,
    name: 'Bloqueos',
    color: '#ef4444',
    slug: 'in-review',
    isInbox: false,
    position: 2,
  },
  {
    id: 4,
    boardId: 1,
    name: 'Completada',
    color: '#4ade80',
    slug: 'completed',
    isInbox: false,
    position: 3,
  },
];

export const MOCK_SHOPPING_COLUMNS: BoardColumn[] = [
  {
    id: 11,
    boardId: 1,
    name: 'Por comprar',
    color: '#0d9488',
    slug: 'backlog',
    isInbox: true,
    position: 0,
  },
  {
    id: 12,
    boardId: 1,
    name: 'Comprado',
    color: '#22c55e',
    slug: 'completed',
    isInbox: false,
    position: 1,
  },
  {
    id: 13,
    boardId: 1,
    name: 'Descartado',
    color: '#94a3b8',
    slug: 'discarded',
    isInbox: false,
    position: 2,
  },
];

export const mockTask = (
  partial: Partial<Task> & Pick<Task, 'id' | 'title'>
): Task => ({
  columnId: 1,
  tags: [],
  ...partial,
});

export const mockBoardStoreExtras = {
  addColumn: vi.fn(),
  updateColumn: vi.fn(),
  removeColumn: vi.fn(),
  reorderColumns: vi.fn(),
  toggleTaskPinned: vi.fn(),
  setTaskCommentSummary: vi.fn(),
  setTaskChecklistSummary: vi.fn(),
};
