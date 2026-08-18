import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeAll, afterEach, beforeEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import { setupWindowMocks, cleanupTest } from '../../utils/component-test-utils';

beforeAll(() => {
  setupWindowMocks();
});

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  cleanup();
  cleanupTest();
});

describe('BoardsList', () => {
  test('should render with boards', async () => {
    const mockUseBoardStore = vi.fn((selector) => {
      const mockState = {
        boards: [
          { id: 1, name: 'Board 1', emoji: '📋', color: 'blue', tasks: [] },
          { id: 2, name: 'Board 2', emoji: '🎯', color: 'green', tasks: [] },
        ],
        currentBoardId: 1,
      };
      return selector(mockState);
    });

    const mockUseCurrentBoard = vi.fn(() => ({
      id: 1,
      name: 'Board 1',
      emoji: '📋',
      color: 'blue',
      tasks: [],
    }));

    const mockUseCurrentBoardTasks = vi.fn(() => []);
    const mockUseTasksByStatus = vi.fn(() => []);

    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: mockUseBoardStore,
      useCurrentBoard: mockUseCurrentBoard,
      useCurrentBoardTasks: mockUseCurrentBoardTasks,
      useTasksByStatus: mockUseTasksByStatus,
    }));

    const { BoardsList } = await import('../../../src/components/boards/BoardsList');
    render(<BoardsList />);

    // Verify that the component renders without errors
    const board1Texts = screen.getAllByText('Board 1');
    const board2Texts = screen.getAllByText('Board 2');
    expect(board1Texts.length).toBeGreaterThan(0);
    expect(board2Texts.length).toBeGreaterThan(0);
  });

  test('should render without boards', async () => {
    const mockUseBoardStore = vi.fn((selector) => {
      const mockState = {
        boards: [],
        currentBoardId: null,
      };
      return selector(mockState);
    });

    const mockUseCurrentBoard = vi.fn(() => null);
    const mockUseCurrentBoardTasks = vi.fn(() => []);
    const mockUseTasksByStatus = vi.fn(() => []);

    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: mockUseBoardStore,
      useCurrentBoard: mockUseCurrentBoard,
      useCurrentBoardTasks: mockUseCurrentBoardTasks,
      useTasksByStatus: mockUseTasksByStatus,
    }));

    const { BoardsList } = await import('../../../src/components/boards/BoardsList');
    render(<BoardsList />);

    // Verify add new board button is present
    const addButton = screen.getByRole('button', { name: /añadir nuevo tablero/i });
    expect(addButton).toBeInTheDocument();
  });

  test('should have correct responsive structure', async () => {
    const mockUseBoardStore = vi.fn((selector) => {
      const mockState = {
        boards: [{ id: 1, name: 'Test Board', emoji: '📋', color: 'blue', tasks: [] }],
        currentBoardId: 1,
      };
      return selector(mockState);
    });

    const mockUseCurrentBoard = vi.fn(() => ({
      id: 1,
      name: 'Test Board',
      emoji: '📋',
      color: 'blue',
      tasks: [],
    }));

    const mockUseCurrentBoardTasks = vi.fn(() => []);
    const mockUseTasksByStatus = vi.fn(() => []);

    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: mockUseBoardStore,
      useCurrentBoard: mockUseCurrentBoard,
      useCurrentBoardTasks: mockUseCurrentBoardTasks,
      useTasksByStatus: mockUseTasksByStatus,
    }));

    const { BoardsList } = await import('../../../src/components/boards/BoardsList');
    render(<BoardsList />);

    // Verify the main container has correct classes
    const boardTexts = screen.getAllByText('Test Board');
    const container = boardTexts[0].closest('div[class*="w-full"]');
    expect(container).toHaveClass('flex', 'flex-col', 'w-full', 'h-full');
  });

  test('should render board cards on all screen sizes', async () => {
    const mockUseBoardStore = vi.fn((selector) => {
      const mockState = {
        boards: [
          { id: 1, name: 'Board 1', emoji: '📋', color: 'blue', tasks: [] },
          { id: 2, name: 'Board 2', emoji: '🎯', color: 'green', tasks: [] },
        ],
        currentBoardId: 1,
      };
      return selector(mockState);
    });

    const mockUseCurrentBoard = vi.fn(() => ({
      id: 1,
      name: 'Board 1',
      emoji: '📋',
      color: 'blue',
      tasks: [],
    }));

    const mockUseCurrentBoardTasks = vi.fn(() => []);
    const mockUseTasksByStatus = vi.fn(() => []);

    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: mockUseBoardStore,
      useCurrentBoard: mockUseCurrentBoard,
      useCurrentBoardTasks: mockUseCurrentBoardTasks,
      useTasksByStatus: mockUseTasksByStatus,
    }));

    const { BoardsList } = await import('../../../src/components/boards/BoardsList');
    render(<BoardsList />);

    // Verify board cards are rendered
    const board1Texts = screen.getAllByText('Board 1');
    const board2Texts = screen.getAllByText('Board 2');
    expect(board1Texts.length).toBeGreaterThan(0);
    expect(board2Texts.length).toBeGreaterThan(0);
  });

  test('should render add new board button', async () => {
    const mockUseBoardStore = vi.fn((selector) => {
      const mockState = {
        boards: [{ id: 1, name: 'Test Board', emoji: '📋', color: 'blue', tasks: [] }],
        currentBoardId: 1,
      };
      return selector(mockState);
    });

    const mockUseCurrentBoard = vi.fn(() => ({
      id: 1,
      name: 'Test Board',
      emoji: '📋',
      color: 'blue',
      tasks: [],
    }));

    const mockUseCurrentBoardTasks = vi.fn(() => []);
    const mockUseTasksByStatus = vi.fn(() => []);

    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: mockUseBoardStore,
      useCurrentBoard: mockUseCurrentBoard,
      useCurrentBoardTasks: mockUseCurrentBoardTasks,
      useTasksByStatus: mockUseTasksByStatus,
    }));

    const { BoardsList } = await import('../../../src/components/boards/BoardsList');
    render(<BoardsList />);

    // Verify add new board button is present
    const addButton = screen.getByRole('button', { name: /añadir nuevo tablero/i });
    expect(addButton).toBeInTheDocument();
  });

  test('should render create task button', async () => {
    const mockUseBoardStore = vi.fn((selector) => {
      const mockState = {
        boards: [{ id: 1, name: 'Test Board', emoji: '📋', color: 'blue', tasks: [] }],
        currentBoardId: 1,
      };
      return selector(mockState);
    });

    const mockUseCurrentBoard = vi.fn(() => ({
      id: 1,
      name: 'Test Board',
      emoji: '📋',
      color: 'blue',
      tasks: [],
    }));

    const mockUseCurrentBoardTasks = vi.fn(() => []);
    const mockUseTasksByStatus = vi.fn(() => []);

    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: mockUseBoardStore,
      useCurrentBoard: mockUseCurrentBoard,
      useCurrentBoardTasks: mockUseCurrentBoardTasks,
      useTasksByStatus: mockUseTasksByStatus,
    }));

    const { BoardsList } = await import('../../../src/components/boards/BoardsList');
    render(<BoardsList />);

    expect(screen.getByRole('button', { name: /añadir nueva tarea/i })).toBeInTheDocument();
  });

  test('should have correct semantic structure', async () => {
    const mockUseBoardStore = vi.fn((selector) => {
      const mockState = {
        boards: [{ id: 1, name: 'Test Board', emoji: '📋', color: 'blue', tasks: [] }],
        currentBoardId: 1,
      };
      return selector(mockState);
    });

    const mockUseCurrentBoard = vi.fn(() => ({
      id: 1,
      name: 'Test Board',
      emoji: '📋',
      color: 'blue',
      tasks: [],
    }));

    const mockUseCurrentBoardTasks = vi.fn(() => []);
    const mockUseTasksByStatus = vi.fn(() => []);

    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: mockUseBoardStore,
      useCurrentBoard: mockUseCurrentBoard,
      useCurrentBoardTasks: mockUseCurrentBoardTasks,
      useTasksByStatus: mockUseTasksByStatus,
    }));

    const { BoardsList } = await import('../../../src/components/boards/BoardsList');
    render(<BoardsList />);

    // Verify the component has proper structure
    expect(screen.getAllByText('Test Board').length).toBeGreaterThan(0);
    expect(screen.getByRole('navigation', { name: /navegación de tableros/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /añadir nuevo tablero/i })).toBeInTheDocument();
  });
});
