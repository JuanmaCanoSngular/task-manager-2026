import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeAll, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
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

// Mock board store
vi.mock('../../../src/stores/board.store', () => ({
  useBoardStore: vi.fn((selector) => {
    const state = {
      currentBoardId: null,
      boards: [],
      error: null,
      fetchBoards: vi.fn(),
      fetchBoardDetails: vi.fn(),
      addNewBoard: vi.fn(),
      removeBoard: vi.fn(),
      addNewTask: vi.fn(),
      updateTask: vi.fn(),
      removeTask: vi.fn(),
      moveTask: vi.fn(),
      updateTaskOrder: vi.fn(),
    };
    return selector(state);
  }),
}));

describe('NoBoardSelected', () => {
  test('renders correctly when boards are available', async () => {
    const mockBoards = [
      {
        id: 1,
        name: 'Board 1',
        emoji: '📋',
        color: 'bg-blue-500',
        link: '',
        tasks: [],
        isLocal: false,
      },
      {
        id: 2,
        name: 'Board 2',
        emoji: '📝',
        color: 'bg-green-500',
        link: '',
        tasks: [],
        isLocal: false,
      },
    ];
    const mockFetchBoards = vi.fn();

    const { useBoardStore } = await import('../../../src/stores/board.store');
    vi.mocked(useBoardStore).mockImplementation((selector) => {
      const state = {
        currentBoardId: null,
        boards: mockBoards,
        error: null,
        fetchBoards: mockFetchBoards,
        fetchBoardDetails: vi.fn(),
        addNewBoard: vi.fn(),
        removeBoard: vi.fn(),
        addNewTask: vi.fn(),
        updateTask: vi.fn(),
        removeTask: vi.fn(),
        moveTask: vi.fn(),
        updateTaskOrder: vi.fn(),
      };
      return selector(state);
    });

    const { NoBoardSelected } = await import('../../../src/components/boards/NoBoardSelected');
    render(<NoBoardSelected />);

    // Should render the main heading
    expect(screen.getByText('Please, select a board')).toBeInTheDocument();

    // Should render the desktop message
    expect(
      screen.getByText('Choose a board from the sidebar to view its tasks')
    ).toBeInTheDocument();

    // Should render the mobile message
    expect(
      screen.getByText('Choose a board from the select menu to view its tasks')
    ).toBeInTheDocument();

    // Should not render the reset button
    expect(
      screen.queryByRole('button', { name: /restore initial boards/i })
    ).not.toBeInTheDocument();
  });

  test('renders correctly when no boards are available', async () => {
    const mockFetchBoards = vi.fn();

    const { useBoardStore } = await import('../../../src/stores/board.store');
    vi.mocked(useBoardStore).mockImplementation((selector) => {
      const state = {
        currentBoardId: null,
        boards: [],
        error: null,
        fetchBoards: mockFetchBoards,
        fetchBoardDetails: vi.fn(),
        addNewBoard: vi.fn(),
        removeBoard: vi.fn(),
        addNewTask: vi.fn(),
        updateTask: vi.fn(),
        removeTask: vi.fn(),
        moveTask: vi.fn(),
        updateTaskOrder: vi.fn(),
      };
      return selector(state);
    });

    const { NoBoardSelected } = await import('../../../src/components/boards/NoBoardSelected');
    render(<NoBoardSelected />);

    // Should render the no boards heading
    expect(screen.getByText('No boards available')).toBeInTheDocument();

    // Should render the description
    expect(
      screen.getByText(
        'There are no boards to display. Add a new board or restore the initial boards.'
      )
    ).toBeInTheDocument();

    // Should render the reset button
    const resetButton = screen.getByRole('button', { name: /restore initial boards/i });
    expect(resetButton).toBeInTheDocument();
  });

  test('calls fetchBoards when reset button is clicked', async () => {
    const mockFetchBoards = vi.fn();

    const { useBoardStore } = await import('../../../src/stores/board.store');
    vi.mocked(useBoardStore).mockImplementation((selector) => {
      const state = {
        currentBoardId: null,
        boards: [],
        error: null,
        fetchBoards: mockFetchBoards,
        fetchBoardDetails: vi.fn(),
        addNewBoard: vi.fn(),
        removeBoard: vi.fn(),
        addNewTask: vi.fn(),
        updateTask: vi.fn(),
        removeTask: vi.fn(),
        moveTask: vi.fn(),
        updateTaskOrder: vi.fn(),
      };
      return selector(state);
    });

    const { NoBoardSelected } = await import('../../../src/components/boards/NoBoardSelected');
    render(<NoBoardSelected />);

    // Click the reset button
    const resetButton = screen.getByRole('button', { name: /restore initial boards/i });
    fireEvent.click(resetButton);

    // Should call fetchBoards
    expect(mockFetchBoards).toHaveBeenCalledTimes(1);
  });

  test('has correct accessibility structure', async () => {
    const mockBoards = [
      {
        id: 1,
        name: 'Board 1',
        emoji: '📋',
        color: 'bg-blue-500',
        link: '',
        tasks: [],
        isLocal: false,
      },
    ];
    const mockFetchBoards = vi.fn();

    const { useBoardStore } = await import('../../../src/stores/board.store');
    vi.mocked(useBoardStore).mockImplementation((selector) => {
      const state = {
        currentBoardId: null,
        boards: mockBoards,
        error: null,
        fetchBoards: mockFetchBoards,
        fetchBoardDetails: vi.fn(),
        addNewBoard: vi.fn(),
        removeBoard: vi.fn(),
        addNewTask: vi.fn(),
        updateTask: vi.fn(),
        removeTask: vi.fn(),
        moveTask: vi.fn(),
        updateTaskOrder: vi.fn(),
      };
      return selector(state);
    });

    const { NoBoardSelected } = await import('../../../src/components/boards/NoBoardSelected');
    render(<NoBoardSelected />);

    // Should have proper heading structure
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Please, select a board');

    // Should have proper button structure when no boards
    const { rerender } = render(<NoBoardSelected />);

    // Mock empty boards for button test
    vi.mocked(useBoardStore).mockImplementation((selector) => {
      const state = {
        currentBoardId: null,
        boards: [],
        error: null,
        fetchBoards: mockFetchBoards,
        fetchBoardDetails: vi.fn(),
        addNewBoard: vi.fn(),
        removeBoard: vi.fn(),
        addNewTask: vi.fn(),
        updateTask: vi.fn(),
        removeTask: vi.fn(),
        moveTask: vi.fn(),
        updateTaskOrder: vi.fn(),
      };
      return selector(state);
    });

    rerender(<NoBoardSelected />);

    const resetButton = screen.getByRole('button', { name: /restore initial boards/i });
    expect(resetButton).toBeInTheDocument();
  });

  test('shows responsive text correctly', async () => {
    const mockBoards = [
      {
        id: 1,
        name: 'Board 1',
        emoji: '📋',
        color: 'bg-blue-500',
        link: '',
        tasks: [],
        isLocal: false,
      },
    ];
    const mockFetchBoards = vi.fn();

    const { useBoardStore } = await import('../../../src/stores/board.store');
    vi.mocked(useBoardStore).mockImplementation((selector) => {
      const state = {
        currentBoardId: null,
        boards: mockBoards,
        error: null,
        fetchBoards: mockFetchBoards,
        fetchBoardDetails: vi.fn(),
        addNewBoard: vi.fn(),
        removeBoard: vi.fn(),
        addNewTask: vi.fn(),
        updateTask: vi.fn(),
        removeTask: vi.fn(),
        moveTask: vi.fn(),
        updateTaskOrder: vi.fn(),
      };
      return selector(state);
    });

    const { NoBoardSelected } = await import('../../../src/components/boards/NoBoardSelected');
    render(<NoBoardSelected />);

    // Should show both desktop and mobile messages
    const desktopMessage = screen.getByText('Choose a board from the sidebar to view its tasks');
    const mobileMessage = screen.getByText('Choose a board from the select menu to view its tasks');

    expect(desktopMessage).toHaveClass('hidden', 'md:inline');
    expect(mobileMessage).toHaveClass('md:hidden');
  });

  test('handles empty state correctly', async () => {
    const mockFetchBoards = vi.fn();

    const { useBoardStore } = await import('../../../src/stores/board.store');
    vi.mocked(useBoardStore).mockImplementation((selector) => {
      const state = {
        currentBoardId: null,
        boards: [],
        error: null,
        fetchBoards: mockFetchBoards,
        fetchBoardDetails: vi.fn(),
        addNewBoard: vi.fn(),
        removeBoard: vi.fn(),
        addNewTask: vi.fn(),
        updateTask: vi.fn(),
        removeTask: vi.fn(),
        moveTask: vi.fn(),
        updateTaskOrder: vi.fn(),
      };
      return selector(state);
    });

    const { NoBoardSelected } = await import('../../../src/components/boards/NoBoardSelected');
    render(<NoBoardSelected />);

    // Should not show the "select a board" message
    expect(screen.queryByText('Please, select a board')).not.toBeInTheDocument();

    // Should show the "no boards" message
    expect(screen.getByText('No boards available')).toBeInTheDocument();

    // Should show the reset button
    expect(screen.getByRole('button', { name: /restore initial boards/i })).toBeInTheDocument();
  });
});
