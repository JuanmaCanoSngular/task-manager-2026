import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeAll, afterEach, beforeEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import { setupWindowMocks, cleanupTest } from '../../utils/component-test-utils';
import { MOCK_COLUMNS } from '../../utils/mock-columns';

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

const mockBoardStore = () => ({
  useBoardStore: () => ({
    currentBoardId: 1,
    moveTask: vi.fn(),
    setDefaultBoard: vi.fn(),
    applyRemoteTaskInsert: vi.fn(),
    applyRemoteTaskUpdate: vi.fn(),
    applyRemoteTaskDelete: vi.fn(),
    updateTaskOrder: vi.fn(),
    reorderColumns: vi.fn(),
  }),
  useTasksByColumn: () => [],
  useCurrentBoard: () => ({ id: 1, name: 'Test Board', columns: MOCK_COLUMNS, tasks: [] }),
  useCurrentBoardColumns: () => MOCK_COLUMNS,
  useCurrentBoardTasks: () => [],
});

describe('BoardContent', () => {
  test('should render all status columns when a board is selected', async () => {
    vi.doMock('../../../src/stores/board.store', mockBoardStore);
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    expect(screen.getByText(/pendiente/i)).toBeInTheDocument();
    expect(screen.getByText(/en progreso/i)).toBeInTheDocument();
    expect(screen.getByText(/bloqueos/i)).toBeInTheDocument();
    expect(screen.getByText(/completada/i)).toBeInTheDocument();
  });

  test('should have the correct flex structure', async () => {
    vi.doMock('../../../src/stores/board.store', mockBoardStore);
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    const columnsContainer = screen.getByTestId('board-columns-scroll');
    expect(columnsContainer).toHaveClass('flex', 'gap-3', 'overflow-x-auto', 'min-w-0');
  });

  test('should have the main container with the correct classes', async () => {
    vi.doMock('../../../src/stores/board.store', mockBoardStore);
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    const container = screen.getByText(/pendiente/i).closest('div[class*="rounded-2xl"]');
    expect(container).toHaveClass('w-full', 'h-full', 'rounded-2xl', 'p-4');
  });

  test('should render exactly 4 status columns', async () => {
    vi.doMock('../../../src/stores/board.store', mockBoardStore);
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
    vi.doMock('../../../src/stores/board.store', mockBoardStore);
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    expect(screen.getByText(/pendiente/i)).toBeInTheDocument();
    expect(screen.getByText(/en progreso/i)).toBeInTheDocument();
    expect(screen.getByText(/bloqueos/i)).toBeInTheDocument();
    expect(screen.getByText(/completada/i)).toBeInTheDocument();
  });

  test('should have correct semantic structure for columns', async () => {
    vi.doMock('../../../src/stores/board.store', mockBoardStore);
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
