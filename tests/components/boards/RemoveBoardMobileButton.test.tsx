import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeAll, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
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

describe('RemoveBoardMobileButton', () => {
  test('renders correctly when a board is selected', async () => {
    const mockRemoveBoard = vi.fn();

    const { useBoardStore } = await import('../../../src/stores/board.store');
    vi.mocked(useBoardStore).mockImplementation((selector) => {
      const state = {
        currentBoardId: 1,
        boards: [],
        error: null,
        fetchBoards: vi.fn(),
        fetchBoardDetails: vi.fn(),
        addNewBoard: vi.fn(),
        removeBoard: mockRemoveBoard,
        addNewTask: vi.fn(),
        updateTask: vi.fn(),
        removeTask: vi.fn(),
        moveTask: vi.fn(),
        updateTaskOrder: vi.fn(),
      };
      return selector(state);
    });

    const { RemoveBoardMobileButton } = await import(
      '../../../src/components/boards/RemoveBoardMobileButton'
    );
    render(<RemoveBoardMobileButton />);

    // Should render the button
    const button = screen.getByRole('button', { name: /remove current board/i });
    expect(button).toBeInTheDocument();

    // Should have correct classes
    expect(button).toHaveClass('btn-remove', 'w-full');
  });

  test('does not render when no board is selected', async () => {
    const { useBoardStore } = await import('../../../src/stores/board.store');
    vi.mocked(useBoardStore).mockImplementation((selector) => {
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
    });

    const { RemoveBoardMobileButton } = await import(
      '../../../src/components/boards/RemoveBoardMobileButton'
    );
    const { container } = render(<RemoveBoardMobileButton />);

    // Should not render anything
    expect(container.firstChild).toBeNull();
  });

  test('opens confirm dialog when button is clicked', async () => {
    const mockRemoveBoard = vi.fn();

    const { useBoardStore } = await import('../../../src/stores/board.store');
    vi.mocked(useBoardStore).mockImplementation((selector) => {
      const state = {
        currentBoardId: 1,
        boards: [],
        error: null,
        fetchBoards: vi.fn(),
        fetchBoardDetails: vi.fn(),
        addNewBoard: vi.fn(),
        removeBoard: mockRemoveBoard,
        addNewTask: vi.fn(),
        updateTask: vi.fn(),
        removeTask: vi.fn(),
        moveTask: vi.fn(),
        updateTaskOrder: vi.fn(),
      };
      return selector(state);
    });

    const { RemoveBoardMobileButton } = await import(
      '../../../src/components/boards/RemoveBoardMobileButton'
    );
    render(<RemoveBoardMobileButton />);

    // Click the button
    const button = screen.getByRole('button', { name: /remove current board/i });
    await act(async () => {
      fireEvent.click(button);
    });

    // Should show the confirm dialog
    expect(screen.getByText('Remove Board?')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This action cannot be undone. All tasks associated with this board will be deleted.'
      )
    ).toBeInTheDocument();

    // Should show confirm and cancel buttons - use more specific selectors
    const confirmButtons = screen.getAllByRole('button', { name: /remove/i });
    expect(confirmButtons).toHaveLength(2); // Main button + dialog button

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });

  test('calls removeBoard when confirmed', async () => {
    const mockRemoveBoard = vi.fn();

    const { useBoardStore } = await import('../../../src/stores/board.store');
    vi.mocked(useBoardStore).mockImplementation((selector) => {
      const state = {
        currentBoardId: 1,
        boards: [],
        error: null,
        fetchBoards: vi.fn(),
        fetchBoardDetails: vi.fn(),
        addNewBoard: vi.fn(),
        removeBoard: mockRemoveBoard,
        addNewTask: vi.fn(),
        updateTask: vi.fn(),
        removeTask: vi.fn(),
        moveTask: vi.fn(),
        updateTaskOrder: vi.fn(),
      };
      return selector(state);
    });

    const { RemoveBoardMobileButton } = await import(
      '../../../src/components/boards/RemoveBoardMobileButton'
    );
    render(<RemoveBoardMobileButton />);

    // Open the dialog
    const button = screen.getByRole('button', { name: /remove current board/i });
    await act(async () => {
      fireEvent.click(button);
    });

    // Get the dialog confirm button (the second one)
    const confirmButtons = screen.getAllByRole('button', { name: /remove/i });
    const dialogConfirmButton = confirmButtons[1]; // Second button is the dialog one

    // Confirm the action
    await act(async () => {
      fireEvent.click(dialogConfirmButton);
    });

    // Should call removeBoard
    expect(mockRemoveBoard).toHaveBeenCalledTimes(1);
  });

  test('closes dialog when cancelled', async () => {
    const mockRemoveBoard = vi.fn();

    const { useBoardStore } = await import('../../../src/stores/board.store');
    vi.mocked(useBoardStore).mockImplementation((selector) => {
      const state = {
        currentBoardId: 1,
        boards: [],
        error: null,
        fetchBoards: vi.fn(),
        fetchBoardDetails: vi.fn(),
        addNewBoard: vi.fn(),
        removeBoard: mockRemoveBoard,
        addNewTask: vi.fn(),
        updateTask: vi.fn(),
        removeTask: vi.fn(),
        moveTask: vi.fn(),
        updateTaskOrder: vi.fn(),
      };
      return selector(state);
    });

    const { RemoveBoardMobileButton } = await import(
      '../../../src/components/boards/RemoveBoardMobileButton'
    );
    render(<RemoveBoardMobileButton />);

    // Open the dialog
    const button = screen.getByRole('button', { name: /remove current board/i });
    await act(async () => {
      fireEvent.click(button);
    });

    // Cancel the action
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await act(async () => {
      fireEvent.click(cancelButton);
    });

    // Should not call removeBoard
    expect(mockRemoveBoard).not.toHaveBeenCalled();
  });

  test('has correct accessibility structure', async () => {
    const mockRemoveBoard = vi.fn();

    const { useBoardStore } = await import('../../../src/stores/board.store');
    vi.mocked(useBoardStore).mockImplementation((selector) => {
      const state = {
        currentBoardId: 1,
        boards: [],
        error: null,
        fetchBoards: vi.fn(),
        fetchBoardDetails: vi.fn(),
        addNewBoard: vi.fn(),
        removeBoard: mockRemoveBoard,
        addNewTask: vi.fn(),
        updateTask: vi.fn(),
        removeTask: vi.fn(),
        moveTask: vi.fn(),
        updateTaskOrder: vi.fn(),
      };
      return selector(state);
    });

    const { RemoveBoardMobileButton } = await import(
      '../../../src/components/boards/RemoveBoardMobileButton'
    );
    render(<RemoveBoardMobileButton />);

    // Should have proper button structure
    const button = screen.getByRole('button', { name: /remove current board/i });
    expect(button).toBeInTheDocument();

    // Should have proper accessibility attributes
    expect(button).toHaveAttribute('aria-label', 'Remove current board');
    expect(button).toHaveAttribute('tabindex', '0');

    // Should have proper heading structure
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Remove board');

    // Should have proper icon structure
    const icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  test('handles different board IDs correctly', async () => {
    const mockRemoveBoard = vi.fn();

    const { useBoardStore } = await import('../../../src/stores/board.store');
    vi.mocked(useBoardStore).mockImplementation((selector) => {
      const state = {
        currentBoardId: 999,
        boards: [],
        error: null,
        fetchBoards: vi.fn(),
        fetchBoardDetails: vi.fn(),
        addNewBoard: vi.fn(),
        removeBoard: mockRemoveBoard,
        addNewTask: vi.fn(),
        updateTask: vi.fn(),
        removeTask: vi.fn(),
        moveTask: vi.fn(),
        updateTaskOrder: vi.fn(),
      };
      return selector(state);
    });

    const { RemoveBoardMobileButton } = await import(
      '../../../src/components/boards/RemoveBoardMobileButton'
    );
    render(<RemoveBoardMobileButton />);

    // Should render regardless of board ID
    const button = screen.getByRole('button', { name: /remove current board/i });
    expect(button).toBeInTheDocument();
  });
});
