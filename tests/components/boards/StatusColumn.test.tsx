import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeAll, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { setupWindowMocks, cleanupTest } from '../../utils/component-test-utils';
import type { TaskTag } from '../../../src/interfaces/task.interface';

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
  useTasksByStatus: vi.fn(),
  useBoardStore: vi.fn((selector) => {
    const state = {
      updateTask: vi.fn(),
      removeTask: vi.fn(),
      selectedBoard: { id: 1, name: 'Test Board' },
    };
    return selector(state);
  }),
}));

describe('StatusColumn', () => {
  test('renders correctly with tasks', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', status: 'backlog' as const, tags: ['technical' as TaskTag] },
      { id: 2, title: 'Task 2', status: 'backlog' as const, tags: ['front-end' as TaskTag] },
    ];

    const { useTasksByStatus } = await import('../../../src/stores/board.store');
    vi.mocked(useTasksByStatus).mockReturnValue(mockTasks);

    const { StatusColumn } = await import('../../../src/components/boards/StatusColumn');
    render(<StatusColumn status="backlog" label="Backlog" color="bg-gray-500" />);

    // Should render the column header with task count
    expect(screen.getByText('Backlog (2)')).toBeInTheDocument();

    // Should render task cards
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();

    // Should render the color indicator using a more specific selector
    const colorIndicator = screen
      .getByText('Backlog (2)')
      .querySelector('span[aria-hidden="true"]');
    expect(colorIndicator).toHaveClass('bg-gray-500');
  });

  test('renders correctly without tasks', async () => {
    const { useTasksByStatus } = await import('../../../src/stores/board.store');
    vi.mocked(useTasksByStatus).mockReturnValue([]);

    const { StatusColumn } = await import('../../../src/components/boards/StatusColumn');
    render(<StatusColumn status="in-progress" label="In Progress" color="bg-yellow-300" />);

    // Should render the column header with zero count
    expect(screen.getByText('In Progress (0)')).toBeInTheDocument();

    // Should not render any task cards
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();

    // Should render the color indicator using a more specific selector
    const colorIndicator = screen
      .getByText('In Progress (0)')
      .querySelector('span[aria-hidden="true"]');
    expect(colorIndicator).toHaveClass('bg-yellow-300');
  });

  test('renders CreateTaskButton only for backlog status', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', status: 'backlog' as const, tags: ['technical' as TaskTag] },
    ];

    const { useTasksByStatus } = await import('../../../src/stores/board.store');
    vi.mocked(useTasksByStatus).mockReturnValue(mockTasks);

    const { StatusColumn } = await import('../../../src/components/boards/StatusColumn');

    // Render with backlog status (should show CreateTaskButton)
    const { rerender } = render(
      <StatusColumn status="backlog" label="Backlog" color="bg-gray-500" />
    );

    // Should render CreateTaskButton for backlog
    expect(screen.getByRole('button', { name: /add new task/i })).toBeInTheDocument();

    // Render with in-progress status (should not show CreateTaskButton)
    rerender(<StatusColumn status="in-progress" label="In Progress" color="bg-yellow-300" />);

    // Should not render CreateTaskButton for non-backlog status
    expect(screen.queryByRole('button', { name: /add new task/i })).not.toBeInTheDocument();
  });

  test('renders with different status types', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', status: 'in-review' as const, tags: ['design' as TaskTag] },
    ];

    const { useTasksByStatus } = await import('../../../src/stores/board.store');
    vi.mocked(useTasksByStatus).mockReturnValue(mockTasks);

    const { StatusColumn } = await import('../../../src/components/boards/StatusColumn');
    render(<StatusColumn status="in-review" label="In Review" color="bg-purple-500" />);

    // Should render the correct label and count
    expect(screen.getByText('In Review (1)')).toBeInTheDocument();

    // Should render the task
    expect(screen.getByText('Task 1')).toBeInTheDocument();

    // Should render the correct color indicator
    const colorIndicator = screen
      .getByText('In Review (1)')
      .querySelector('span[aria-hidden="true"]');
    expect(colorIndicator).toHaveClass('bg-purple-500');
  });

  test('has correct accessibility structure', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', status: 'completed' as const, tags: ['technical' as TaskTag] },
    ];

    const { useTasksByStatus } = await import('../../../src/stores/board.store');
    vi.mocked(useTasksByStatus).mockReturnValue(mockTasks);

    const { StatusColumn } = await import('../../../src/components/boards/StatusColumn');
    render(<StatusColumn status="completed" label="Completed" color="bg-green-400" />);

    // Should have proper heading structure
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Completed (1)');

    // Should have droppable area with role list
    expect(screen.getByRole('list')).toBeInTheDocument();

    // Should have placeholder for drag and drop
    expect(screen.getByTestId('placeholder')).toBeInTheDocument();
  });
});
