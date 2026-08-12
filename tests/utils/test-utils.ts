import { vi } from 'vitest';
import { Board } from '../../src/interfaces/board.interface';
import { MOCK_COLUMNS } from './mock-columns';

export const setupMatchMediaMock = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
};

export const exampleBoards: Board[] = [
  {
    id: 1,
    name: 'Productivity Board',
    emoji: '🚀',
    color: '#3B82F6',
    link: 'https://example.com/board1.json',
    columns: MOCK_COLUMNS,
    tasks: [],
    isDefault: true,
    isLocal: false,
  },
  {
    id: 2,
    name: 'Personal Board',
    emoji: '🏠',
    color: '#10B981',
    link: 'https://example.com/board2.json',
    columns: MOCK_COLUMNS.map((c) => ({ ...c, boardId: 2 })),
    tasks: [],
    isDefault: false,
    isLocal: false,
  },
];

export const exampleBoard: Board = {
  id: 1,
  name: 'Productivity Board',
  emoji: '🚀',
  color: '#3B82F6',
  link: 'https://example.com/board1.json',
  columns: MOCK_COLUMNS,
  tasks: [
    {
      id: 1,
      title: 'Sample Task',
      columnId: 1,
      tags: ['technical'],
    },
  ],
  isDefault: true,
  isLocal: false,
};

export const exampleResponses = {
  boardList: {
    data: exampleBoards,
  },
  boardDetails: {
    data: exampleBoard,
  },
};
