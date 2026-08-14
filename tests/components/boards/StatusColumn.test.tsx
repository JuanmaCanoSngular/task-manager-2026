import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeAll, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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

// Mock react-beautiful-dnd
vi.mock('@hello-pangea/dnd', () => ({
  Droppable: ({
    children,
  }: {
    children: (provided: unknown, snapshot: unknown) => React.ReactNode;
  }) => {
    const provided = {
      innerRef: vi.fn(),
      droppableProps: {
        'data-testid': 'droppable',
      },
      placeholder: <div data-testid="placeholder" />,
    };
    const snapshot = {
      isDraggingOver: false,
    };
    return children(provided, snapshot);
  },
  Draggable: ({
    children,
  }: {
    children: (provided: unknown, snapshot: unknown) => React.ReactNode;
  }) => {
    const provided = {
      innerRef: vi.fn(),
      draggableProps: {},
      dragHandleProps: {},
    };
    const snapshot = {
      isDragging: false,
    };
    return children(provided, snapshot);
  },
}));

// Mock board store
vi.mock('../../../src/stores/board.store', () => ({
  useTasksByColumn: vi.fn(),
  useBoardStore: vi.fn((selector) => {
    const state = {
      updateTask: vi.fn(),
      toggleTaskPinned: vi.fn(),
      removeTask: vi.fn(),
      selectedBoard: { id: 1, name: 'Test Board' },
    };
    return selector(state);
  }),
}));

vi.mock('../../../src/stores/tag.store', () => ({
  useTagStore: (
    selector: (s: { tags: unknown[]; filterTagIds: string[]; toggleTagFilter: () => void }) => unknown
  ) => selector({ tags: [], filterTagIds: [], toggleTagFilter: vi.fn() }),
}));

const backlogColumn = MOCK_COLUMNS[0];
const inProgressColumn = MOCK_COLUMNS[1];
const inReviewColumn = MOCK_COLUMNS[2];
const completedColumn = MOCK_COLUMNS[3];

describe('StatusColumn', () => {
  test('renders correctly with tasks', async () => {
    const mockTasks = [
      mockTask({ id: 1, title: 'Task 1', columnId: 1, tags: ['tag-1'] }),
      mockTask({ id: 2, title: 'Task 2', columnId: 1, tags: ['tag-fe'] }),
    ];

    const { useTasksByColumn } = await import('../../../src/stores/board.store');
    vi.mocked(useTasksByColumn).mockReturnValue(mockTasks);

    const { StatusColumn } = await import('../../../src/components/boards/StatusColumn');
    render(<StatusColumn column={backlogColumn} />);

    const heading = screen.getByRole('heading', { name: /pendiente \(2\)/i });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();

    const colorIndicator = heading.querySelector('span.rounded-full');
    expect(colorIndicator).toHaveStyle({ backgroundColor: backlogColumn.color });
  });

  test('renders correctly without tasks', async () => {
    const { useTasksByColumn } = await import('../../../src/stores/board.store');
    vi.mocked(useTasksByColumn).mockReturnValue([]);

    const { StatusColumn } = await import('../../../src/components/boards/StatusColumn');
    render(<StatusColumn column={inProgressColumn} />);

    const heading = screen.getByRole('heading', { name: /en progreso \(0\)/i });
    expect(heading).toBeInTheDocument();
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();

    const colorIndicator = heading.querySelector('span.rounded-full');
    expect(colorIndicator).toHaveStyle({ backgroundColor: inProgressColumn.color });
  });

  test('does not render add task button inside the column', async () => {
    const mockTasks = [mockTask({ id: 1, title: 'Task 1', columnId: 1, tags: ['tag-1'] })];

    const { useTasksByColumn } = await import('../../../src/stores/board.store');
    vi.mocked(useTasksByColumn).mockReturnValue(mockTasks);

    const { StatusColumn } = await import('../../../src/components/boards/StatusColumn');

    render(<StatusColumn column={backlogColumn} />);
    expect(screen.queryByRole('button', { name: /añadir nueva tarea/i })).not.toBeInTheDocument();
  });

  test('renders with different column types', async () => {
    const mockTasks = [mockTask({ id: 1, title: 'Task 1', columnId: 3, tags: ['tag-design'] })];

    const { useTasksByColumn } = await import('../../../src/stores/board.store');
    vi.mocked(useTasksByColumn).mockReturnValue(mockTasks);

    const { StatusColumn } = await import('../../../src/components/boards/StatusColumn');
    render(<StatusColumn column={inReviewColumn} />);

    const heading = screen.getByRole('heading', { name: /bloqueos \(1\)/i });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();

    const colorIndicator = heading.querySelector('span.rounded-full');
    expect(colorIndicator).toHaveStyle({ backgroundColor: inReviewColumn.color });
  });

  test('has correct accessibility structure', async () => {
    const mockTasks = [mockTask({ id: 1, title: 'Task 1', columnId: 4, tags: ['tag-1'] })];

    const { useTasksByColumn } = await import('../../../src/stores/board.store');
    vi.mocked(useTasksByColumn).mockReturnValue(mockTasks);

    const { StatusColumn } = await import('../../../src/components/boards/StatusColumn');
    render(<StatusColumn column={completedColumn} />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Completada (1)');
    expect(screen.getAllByRole('list')).toHaveLength(2);
  });

  test('filtra las tareas por etiqueta', async () => {
    const mockTasks = [
      mockTask({ id: 1, title: 'Con urgente', columnId: 1, tags: ['tag-urgente'] }),
      mockTask({ id: 2, title: 'Sin etiqueta', columnId: 1, tags: [] }),
    ];

    vi.doMock('../../../src/stores/tag.store', () => ({
      useTagStore: (
        selector: (s: {
          tags: unknown[];
          filterTagIds: string[];
          toggleTagFilter: () => void;
        }) => unknown
      ) => selector({ tags: [], filterTagIds: ['tag-urgente'], toggleTagFilter: vi.fn() }),
    }));

    const { useTasksByColumn } = await import('../../../src/stores/board.store');
    vi.mocked(useTasksByColumn).mockReturnValue(mockTasks);

    const { StatusColumn } = await import('../../../src/components/boards/StatusColumn');
    render(<StatusColumn column={backlogColumn} />);

    expect(screen.getByRole('heading', { name: /pendiente \(1\)/i })).toBeInTheDocument();
    expect(screen.getByText('Con urgente')).toBeInTheDocument();
    expect(screen.queryByText('Sin etiqueta')).not.toBeInTheDocument();
  });
});
