import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeAll, afterEach, beforeEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import { setupWindowMocks, cleanupTest } from '../../utils/component-test-utils';
import { MOCK_COLUMNS, mockTask } from '../../utils/mock-columns';

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
  useCurrentBoard: () => ({
    id: 1,
    name: 'Test Board',
    color: '#0d9488',
    columns: MOCK_COLUMNS,
    tasks: [],
  }),
  useCurrentBoardColumns: () => MOCK_COLUMNS,
  useCurrentBoardTasks: () => [],
});

describe('BoardContent', () => {
  test('should render all status columns when a board is selected', async () => {
    vi.doMock('../../../src/stores/board.store', mockBoardStore);
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    expect(screen.getByRole('heading', { name: 'Test Board' })).toBeInTheDocument();
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

  test('muestra el recuento al filtrar por etiqueta', async () => {
    const hogar = 'tag-hogar';
    vi.doMock('../../../src/stores/board.store', () => ({
      ...mockBoardStore(),
      useCurrentBoardTasks: () => [
        mockTask({ id: 1, title: 'Tarea hogar', tags: [hogar] }),
        mockTask({ id: 2, title: 'Otra', tags: [] }),
      ],
    }));
    vi.doMock('../../../src/stores/tag.store', () => ({
      useTagStore: (
        selector: (s: {
          tags: { id: string; name: string; color: string }[];
          filterTagIds: string[];
          toggleTagFilter: () => void;
          clearTagFilter: () => void;
        }) => unknown
      ) =>
        selector({
          tags: [{ id: hogar, name: 'Hogar', color: '#3b82f6' }],
          filterTagIds: [hogar],
          toggleTagFilter: vi.fn(),
          clearTagFilter: vi.fn(),
        }),
    }));
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    expect(screen.getByText(/Filtrando 1 tarea de un total de 2/)).toBeInTheDocument();
  });

  test('un tablero shopping muestra la lista de la compra, no columnas kanban', async () => {
    const { MOCK_SHOPPING_COLUMNS } = await import('../../utils/mock-columns');
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: (selector?: (s: { currentBoardId: number; addNewTask: () => void; moveTask: () => void }) => unknown) => {
        const state = {
          currentBoardId: 1,
          addNewTask: vi.fn(),
          moveTask: vi.fn(),
          updateTaskOrder: vi.fn(),
          reorderColumns: vi.fn(),
        };
        return typeof selector === 'function' ? selector(state) : state;
      },
      useCurrentBoard: () => ({
        id: 1,
        name: 'Compra semanal',
        color: '#0d9488',
        kind: 'shopping',
        columns: MOCK_SHOPPING_COLUMNS,
        tasks: [],
      }),
      useCurrentBoardColumns: () => MOCK_SHOPPING_COLUMNS,
      useCurrentBoardTasks: () => [],
    }));
    const { BoardContent } = await import('../../../src/components/boards/BoardContent');
    render(<BoardContent />);
    expect(screen.getByTestId('shopping-board')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Compra semanal' })).toBeInTheDocument();
    expect(screen.queryByText(/pendiente/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('board-columns-scroll')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /por comprar/i })).toBeInTheDocument();
  });
});
