import { vi } from 'vitest';
import axios from 'axios';
// Hoist axios mock to top-level to match Vitest's hoisting behavior
vi.mock('axios');
import { Board } from '../../src/interfaces/board.interface';

// Global axios mock for all tests
export const setupAxiosMock = () => {
  const mockedAxios = vi.mocked(axios);
  // Ensure get always returns a Promise
  (mockedAxios.get as unknown as ReturnType<typeof vi.fn>).mockImplementation(() =>
    Promise.resolve({ data: {} })
  );
  return {
    mockedAxios,
    mockedGet: mockedAxios.get as unknown as ReturnType<typeof vi.fn>,
  };
};

// Global window.matchMedia mock
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

// Example board data for tests
export const exampleBoards: Board[] = [
  {
    id: 1,
    name: 'Productivity Board',
    emoji: '🚀',
    color: '#3B82F6',
    link: 'https://example.com/board1.json',
    tasks: [],
    isLocal: false,
  },
  {
    id: 2,
    name: 'Personal Board',
    emoji: '🏠',
    color: '#10B981',
    link: 'https://example.com/board2.json',
    tasks: [],
    isLocal: false,
  },
];

// Example single board for tests
export const exampleBoard: Board = {
  id: 1,
  name: 'Productivity Board',
  emoji: '🚀',
  color: '#3B82F6',
  link: 'https://example.com/board1.json',
  tasks: [
    {
      id: 1,
      title: 'Sample Task',
      status: 'backlog',
      tags: ['technical'],
      background: 'https://example.com/image.jpg',
    },
  ],
  isLocal: false,
};

// Example axios responses for tests
export const exampleResponses = {
  boardList: {
    data: exampleBoards,
  },
  boardDetails: {
    data: exampleBoard,
  },
};
