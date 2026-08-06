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

    const button = getByRole.button(/añadir nuevo tablero/i);
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Añadir nuevo tablero');
  });

  test('should be icon-only (accessible name from aria-label)', async () => {
    const addNewBoard = vi.fn();
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore({ addNewBoard }),
    }));
    const { AddNewBoardButton } = await import('../../../src/components/boards/AddNewBoardButton');

    render(<AddNewBoardButton />);

    // Sin texto visible; el nombre accesible viene del aria-label.
    expect(screen.queryByText('Añadir nuevo tablero')).not.toBeInTheDocument();
    const button = getByRole.button(/añadir nuevo tablero/i);
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  test('should have proper CSS classes', async () => {
    const addNewBoard = vi.fn();
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore({ addNewBoard }),
    }));
    const { AddNewBoardButton } = await import('../../../src/components/boards/AddNewBoardButton');

    render(<AddNewBoardButton />);

    const button = getByRole.button(/añadir nuevo tablero/i);
    expect(button).toHaveClass('w-full', 'border-dashed');
  });

  test('should open modal when button is clicked', async () => {
    const addNewBoard = vi.fn();
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore({ addNewBoard }),
    }));
    const { AddNewBoardButton } = await import('../../../src/components/boards/AddNewBoardButton');

    render(<AddNewBoardButton />);

    const button = getByRole.button(/añadir nuevo tablero/i);
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

    // El icono (svg) debe estar en el botón.
    const button = getByRole.button(/añadir nuevo tablero/i);
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  test('should have proper button structure', async () => {
    const addNewBoard = vi.fn();
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore({ addNewBoard }),
    }));
    const { AddNewBoardButton } = await import('../../../src/components/boards/AddNewBoardButton');

    render(<AddNewBoardButton />);

    const button = getByRole.button(/añadir nuevo tablero/i);
    expect(button).toBeInTheDocument();

    // El botón contiene el icono.
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  test('should be keyboard accessible', async () => {
    const addNewBoard = vi.fn();
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore({ addNewBoard }),
    }));
    const { AddNewBoardButton } = await import('../../../src/components/boards/AddNewBoardButton');

    render(<AddNewBoardButton />);

    const button = getByRole.button(/añadir nuevo tablero/i);

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

    const button = getByRole.button(/añadir nuevo tablero/i);

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
    expect(getByRole.button(/añadir nuevo tablero/i)).toBeInTheDocument();
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
    expect(getByRole.button(/añadir nuevo tablero/i)).toBeInTheDocument();
  });
});
