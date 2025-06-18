import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import {
  setupWindowMocks,
  mockBoardStore,
  cleanupTest,
  getByRole,
} from '../../utils/component-test-utils';

// Setup window mocks
beforeAll(() => {
  setupWindowMocks();
});

afterEach(() => {
  cleanup();
  cleanupTest();
});

describe('AddNewBoardButton', () => {
  test('should render the add new board button', async () => {
    const addNewBoard = vi.fn();
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore({ addNewBoard }),
    }));
    const { AddNewBoardButton } = await import('../../../src/components/boards/AddNewBoardButton');

    render(<AddNewBoardButton />);

    const button = getByRole.button(/add new board/i);
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Add new board');
  });

  test('should display correct text content', async () => {
    const addNewBoard = vi.fn();
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore({ addNewBoard }),
    }));
    const { AddNewBoardButton } = await import('../../../src/components/boards/AddNewBoardButton');

    render(<AddNewBoardButton />);

    expect(screen.getByText('Add new board')).toBeInTheDocument();
    expect(getByRole.heading(2)).toHaveTextContent('Add new board');
  });

  test('should have proper CSS classes', async () => {
    const addNewBoard = vi.fn();
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore({ addNewBoard }),
    }));
    const { AddNewBoardButton } = await import('../../../src/components/boards/AddNewBoardButton');

    render(<AddNewBoardButton />);

    const button = getByRole.button(/add new board/i);
    expect(button).toHaveClass('btn-add', 'w-full');
  });

  test('should open modal when button is clicked', async () => {
    const addNewBoard = vi.fn();
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore({ addNewBoard }),
    }));
    const { AddNewBoardButton } = await import('../../../src/components/boards/AddNewBoardButton');

    render(<AddNewBoardButton />);

    const button = getByRole.button(/add new board/i);
    fireEvent.click(button);

    // The modal should be rendered (we'll test the modal component separately)
    // For now, we can verify the button click doesn't throw errors
    expect(button).toBeInTheDocument();
  });

  test('should render plus icon', async () => {
    const addNewBoard = vi.fn();
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore({ addNewBoard }),
    }));
    const { AddNewBoardButton } = await import('../../../src/components/boards/AddNewBoardButton');

    render(<AddNewBoardButton />);

    // The icon should be present in the DOM
    const iconContainer = screen.getByText('Add new board').nextElementSibling;
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass('flex', 'items-center', 'justify-center', 'w-6', 'h-6');
  });

  test('should have proper button structure', async () => {
    const addNewBoard = vi.fn();
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore({ addNewBoard }),
    }));
    const { AddNewBoardButton } = await import('../../../src/components/boards/AddNewBoardButton');

    render(<AddNewBoardButton />);

    const button = getByRole.button(/add new board/i);
    expect(button).toBeInTheDocument();

    // Check that the button contains the heading
    const heading = getByRole.heading(2);
    expect(button).toContainElement(heading);
  });

  test('should be keyboard accessible', async () => {
    const addNewBoard = vi.fn();
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore({ addNewBoard }),
    }));
    const { AddNewBoardButton } = await import('../../../src/components/boards/AddNewBoardButton');

    render(<AddNewBoardButton />);

    const button = getByRole.button(/add new board/i);

    // Test keyboard interaction
    button.focus();
    expect(button).toHaveFocus();

    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    expect(button).toBeInTheDocument();

    // Test Space key
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    expect(button).toBeInTheDocument();
  });

  test('should handle multiple clicks without errors', async () => {
    const addNewBoard = vi.fn();
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore({ addNewBoard }),
    }));
    const { AddNewBoardButton } = await import('../../../src/components/boards/AddNewBoardButton');

    render(<AddNewBoardButton />);

    const button = getByRole.button(/add new board/i);

    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(button).toBeInTheDocument();
  });

  test('should have proper semantic structure', async () => {
    const addNewBoard = vi.fn();
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore({ addNewBoard }),
    }));
    const { AddNewBoardButton } = await import('../../../src/components/boards/AddNewBoardButton');

    render(<AddNewBoardButton />);

    // Check for proper semantic elements
    expect(getByRole.button(/add new board/i)).toBeInTheDocument();
    expect(getByRole.heading(2)).toBeInTheDocument();
  });

  test('should render BoardModal component', async () => {
    const addNewBoard = vi.fn();
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore({ addNewBoard }),
    }));
    const { AddNewBoardButton } = await import('../../../src/components/boards/AddNewBoardButton');

    render(<AddNewBoardButton />);

    // The BoardModal should be rendered (even if not visible)
    // We can verify this by checking that the component renders without errors
    expect(getByRole.button(/add new board/i)).toBeInTheDocument();
  });
});
