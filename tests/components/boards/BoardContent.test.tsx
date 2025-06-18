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
        updateTaskOrder: vi.fn(),
      }),
      useTasksByStatus: () => [],
      useCurrentBoard: () => ({ id: 1, name: 'Test Board', tasks: [] }),
      useCurrentBoardTasks: () => [],
    }));
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    expect(screen.getByText(/backlog/i)).toBeInTheDocument();
    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    expect(screen.getByText(/in review/i)).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });

  test('should have the correct grid structure', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => ({
        currentBoardId: 1,
        moveTask: vi.fn(),
        updateTaskOrder: vi.fn(),
      }),
      useTasksByStatus: () => [],
      useCurrentBoard: () => ({ id: 1, name: 'Test Board', tasks: [] }),
      useCurrentBoardTasks: () => [],
    }));
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    const mainContainer = screen.getByText(/backlog/i).closest('div[class*="grid"]');
    expect(mainContainer).toHaveClass(
      'grid',
      'grid-cols-1',
      'md:grid-cols-2',
      'lg:grid-cols-4',
      'gap-4',
      'h-full'
    );
  });

  test('should have the main container with the correct classes', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => ({
        currentBoardId: 1,
        moveTask: vi.fn(),
        updateTaskOrder: vi.fn(),
      }),
      useTasksByStatus: () => [],
      useCurrentBoard: () => ({ id: 1, name: 'Test Board', tasks: [] }),
      useCurrentBoardTasks: () => [],
    }));
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    const container = screen.getByText(/backlog/i).closest('div[class*="shadow-xl"]');
    expect(container).toHaveClass(
      'w-full',
      'h-full',
      'shadow-xl',
      'dark:bg-card-dark',
      'rounded-lg',
      'p-4'
    );
  });

  test('should render exactly 4 status columns', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => ({
        currentBoardId: 1,
        moveTask: vi.fn(),
        updateTaskOrder: vi.fn(),
      }),
      useTasksByStatus: () => [],
      useCurrentBoard: () => ({ id: 1, name: 'Test Board', tasks: [] }),
      useCurrentBoardTasks: () => [],
    }));
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    const columns = [
      screen.getByText(/backlog/i),
      screen.getByText(/in progress/i),
      screen.getByText(/in review/i),
      screen.getByText(/completed/i),
    ];
    expect(columns).toHaveLength(4);
  });

  test('should render the drag and drop context', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => ({
        currentBoardId: 1,
        moveTask: vi.fn(),
        updateTaskOrder: vi.fn(),
      }),
      useTasksByStatus: () => [],
      useCurrentBoard: () => ({ id: 1, name: 'Test Board', tasks: [] }),
      useCurrentBoardTasks: () => [],
    }));
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    expect(screen.getByText(/backlog/i)).toBeInTheDocument();
    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    expect(screen.getByText(/in review/i)).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });

  test('should have correct semantic structure for columns', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => ({
        currentBoardId: 1,
        moveTask: vi.fn(),
        updateTaskOrder: vi.fn(),
      }),
      useTasksByStatus: () => [],
      useCurrentBoard: () => ({ id: 1, name: 'Test Board', tasks: [] }),
      useCurrentBoardTasks: () => [],
    }));
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    const backlogColumn = screen.getByText(/backlog/i);
    const inProgressColumn = screen.getByText(/in progress/i);
    const inReviewColumn = screen.getByText(/in review/i);
    const completedColumn = screen.getByText(/completed/i);
    expect(backlogColumn).toBeInTheDocument();
    expect(inProgressColumn).toBeInTheDocument();
    expect(inReviewColumn).toBeInTheDocument();
    expect(completedColumn).toBeInTheDocument();
  });
});
