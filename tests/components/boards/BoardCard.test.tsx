import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeAll, afterEach, beforeEach } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/react';
import { setupWindowMocks, cleanupTest, getByRole } from '../../utils/component-test-utils';
import { Board } from '../../../src/interfaces/board.interface';

const board: Board = {
  id: 1,
  name: 'Test Board',
  emoji: '📝',
  color: '#ffcc00',
  link: 'test-board',
  tasks: [],
  isDefault: false,
};

const otherBoard: Board = {
  id: 2,
  name: 'Other',
  emoji: '',
  color: '#000',
  link: '',
  tasks: [],
  isDefault: true,
};

const mockUseBoardStore = (overrides: Record<string, unknown> = {}) => {
  const state = {
    currentBoardId: null as number | null,
    boards: [board, otherBoard],
    fetchBoardDetails: vi.fn(),
    removeBoard: vi.fn(),
    updateBoard: vi.fn(),
    setDefaultBoard: vi.fn(),
    ...overrides,
  };
  return (selector?: (s: typeof state) => unknown) =>
    typeof selector === 'function' ? selector(state) : state;
};

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

describe('BoardCard', () => {
  test('debe renderizar el nombre del board', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: mockUseBoardStore(),
    }));
    const { BoardCard } = await import('../../../src/components/boards/BoardCard');
    render(<BoardCard board={board} />);
    expect(getByRole.heading(2)).toHaveTextContent('Test Board');
  });

  test('debe tener role listitem y atributos aria correctos', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: mockUseBoardStore(),
    }));
    const { BoardCard } = await import('../../../src/components/boards/BoardCard');
    render(<BoardCard board={board} />);
    const cardItem = screen.getByRole('listitem', { name: 'Seleccionar tablero Test Board' });
    expect(cardItem).toBeInTheDocument();
    expect(cardItem).toHaveAttribute('aria-pressed', 'false');
  });

  test('debe renderizar el punto con el color del board', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: mockUseBoardStore(),
    }));
    const { BoardCard } = await import('../../../src/components/boards/BoardCard');
    render(<BoardCard board={board} />);
    const cardItem = screen.getByRole('listitem');
    const dot = cardItem.querySelector('span.rounded-full');
    expect(dot).toHaveStyle({ backgroundColor: '#ffcc00' });
  });

  test('estrella vacía marca el tablero como default al pulsar', async () => {
    const setDefaultBoard = vi.fn();
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: mockUseBoardStore({ setDefaultBoard }),
    }));
    const { BoardCard } = await import('../../../src/components/boards/BoardCard');
    render(<BoardCard board={board} />);
    fireEvent.click(screen.getByRole('button', { name: /marcar.*por defecto/i }));
    expect(setDefaultBoard).toHaveBeenCalledWith(1);
  });

  test('tablero por defecto muestra estrella rellena no accionable', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: mockUseBoardStore(),
    }));
    const { BoardCard } = await import('../../../src/components/boards/BoardCard');
    render(<BoardCard board={otherBoard} />);
    expect(screen.getByLabelText('Tablero por defecto')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /marcar.*por defecto/i })).not.toBeInTheDocument();
  });
});
