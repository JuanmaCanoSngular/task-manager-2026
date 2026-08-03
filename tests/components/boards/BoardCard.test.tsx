import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeAll, afterEach, beforeEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import { setupWindowMocks, cleanupTest, getByRole } from '../../utils/component-test-utils';
import { Board } from '../../../src/interfaces/board.interface';

const board: Board = {
  id: 1,
  name: 'Test Board',
  emoji: '📝',
  color: '#ffcc00',
  link: 'test-board',
  tasks: [],
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
      useBoardStore: () => ({
        currentBoardId: null,
        fetchBoardDetails: vi.fn(),
        removeBoard: vi.fn(),
      }),
    }));
    const { BoardCard } = await import('../../../src/components/boards/BoardCard');
    render(<BoardCard board={board} />);
    expect(getByRole.heading(2)).toHaveTextContent('Test Board');
  });

  test('debe tener role listitem y atributos aria correctos', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => ({
        currentBoardId: null,
        fetchBoardDetails: vi.fn(),
        removeBoard: vi.fn(),
      }),
    }));
    const { BoardCard } = await import('../../../src/components/boards/BoardCard');
    render(<BoardCard board={board} />);
    const cardItem = screen.getByRole('listitem', { name: 'Seleccionar tablero Test Board' });
    expect(cardItem).toBeInTheDocument();
    expect(cardItem).toHaveAttribute('aria-label', 'Seleccionar tablero Test Board');
    expect(cardItem).toHaveAttribute('aria-pressed', 'false');
    expect(cardItem).toHaveAttribute('tabindex', '0');
  });

  test('debe tener estructura semántica correcta', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => ({
        currentBoardId: null,
        fetchBoardDetails: vi.fn(),
        removeBoard: vi.fn(),
      }),
    }));
    const { BoardCard } = await import('../../../src/components/boards/BoardCard');
    render(<BoardCard board={board} />);
    const cardItem = screen.getByRole('listitem', { name: 'Seleccionar tablero Test Board' });
    expect(cardItem).toHaveClass('card-base');
    expect(cardItem).toHaveClass('relative', 'group', 'cursor-pointer');
    expect(getByRole.heading(2)).toBeInTheDocument();
  });

  test('debe renderizar el punto con el color del board', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => ({
        currentBoardId: null,
        fetchBoardDetails: vi.fn(),
        removeBoard: vi.fn(),
      }),
    }));
    const { BoardCard } = await import('../../../src/components/boards/BoardCard');
    render(<BoardCard board={board} />);
    const cardItem = screen.getByRole('listitem');
    const dot = cardItem.querySelector('span[aria-hidden="true"]');
    expect(dot).toHaveClass('rounded-full');
    expect(dot).toHaveStyle({ backgroundColor: '#ffcc00' });
  });

  test('debe ser focusable', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => ({
        currentBoardId: null,
        fetchBoardDetails: vi.fn(),
        removeBoard: vi.fn(),
      }),
    }));
    const { BoardCard } = await import('../../../src/components/boards/BoardCard');
    render(<BoardCard board={board} />);
    const cardItem = screen.getByRole('listitem', { name: 'Seleccionar tablero Test Board' });
    cardItem.focus();
    expect(cardItem).toHaveFocus();
  });
});
