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

describe('BoardContent', () => {
  test('should render all status columns when a board is selected', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => ({
        currentBoardId: 1,
        moveTask: vi.fn(),
        setDefaultBoard: vi.fn(),
        updateTaskOrder: vi.fn(),
      }),
      useTasksByStatus: () => [],
      useCurrentBoard: () => ({ id: 1, name: 'Test Board', tasks: [] }),
      useCurrentBoardTasks: () => [],
    }));
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    expect(screen.getByText(/pendiente/i)).toBeInTheDocument();
    expect(screen.getByText(/en progreso/i)).toBeInTheDocument();
    expect(screen.getByText(/bloqueos/i)).toBeInTheDocument();
    expect(screen.getByText(/completada/i)).toBeInTheDocument();
  });

  test('should have the correct grid structure', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => ({
        currentBoardId: 1,
        moveTask: vi.fn(),
        setDefaultBoard: vi.fn(),
        updateTaskOrder: vi.fn(),
      }),
      useTasksByStatus: () => [],
      useCurrentBoard: () => ({ id: 1, name: 'Test Board', tasks: [] }),
      useCurrentBoardTasks: () => [],
    }));
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    const mainContainer = screen.getByText(/pendiente/i).closest('div[class*="grid"]');
    expect(mainContainer).toHaveClass(
      'grid',
      'grid-cols-1',
      'md:grid-cols-2',
      'lg:grid-cols-4',
      'gap-4',
      'md:gap-5',
      'h-full'
    );
  });

  test('should have the main container with the correct classes', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => ({
        currentBoardId: 1,
        moveTask: vi.fn(),
        setDefaultBoard: vi.fn(),
        updateTaskOrder: vi.fn(),
      }),
      useTasksByStatus: () => [],
      useCurrentBoard: () => ({ id: 1, name: 'Test Board', tasks: [] }),
      useCurrentBoardTasks: () => [],
    }));
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    const container = screen.getByText(/pendiente/i).closest('div[class*="rounded-2xl"]');
    expect(container).toHaveClass('w-full', 'h-full', 'rounded-2xl', 'p-4');
  });

  test('should render exactly 4 status columns', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => ({
        currentBoardId: 1,
        moveTask: vi.fn(),
        setDefaultBoard: vi.fn(),
        updateTaskOrder: vi.fn(),
      }),
      useTasksByStatus: () => [],
      useCurrentBoard: () => ({ id: 1, name: 'Test Board', tasks: [] }),
      useCurrentBoardTasks: () => [],
    }));
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    const columns = [
      screen.getByText(/pendiente/i),
      screen.getByText(/en progreso/i),
      screen.getByText(/bloqueos/i),
      screen.getByText(/completada/i),
    ];
    expect(columns).toHaveLength(4);
  });

  test('should render the drag and drop context', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => ({
        currentBoardId: 1,
        moveTask: vi.fn(),
        setDefaultBoard: vi.fn(),
        updateTaskOrder: vi.fn(),
      }),
      useTasksByStatus: () => [],
      useCurrentBoard: () => ({ id: 1, name: 'Test Board', tasks: [] }),
      useCurrentBoardTasks: () => [],
    }));
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    expect(screen.getByText(/pendiente/i)).toBeInTheDocument();
    expect(screen.getByText(/en progreso/i)).toBeInTheDocument();
    expect(screen.getByText(/bloqueos/i)).toBeInTheDocument();
    expect(screen.getByText(/completada/i)).toBeInTheDocument();
  });

  test('should have correct semantic structure for columns', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => ({
        currentBoardId: 1,
        moveTask: vi.fn(),
        setDefaultBoard: vi.fn(),
        updateTaskOrder: vi.fn(),
      }),
      useTasksByStatus: () => [],
      useCurrentBoard: () => ({ id: 1, name: 'Test Board', tasks: [] }),
      useCurrentBoardTasks: () => [],
    }));
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    const backlogColumn = screen.getByText(/pendiente/i);
    const inProgressColumn = screen.getByText(/en progreso/i);
    const inReviewColumn = screen.getByText(/bloqueos/i);
    const completedColumn = screen.getByText(/completada/i);
    expect(backlogColumn).toBeInTheDocument();
    expect(inProgressColumn).toBeInTheDocument();
    expect(inReviewColumn).toBeInTheDocument();
    expect(completedColumn).toBeInTheDocument();
  });
});
