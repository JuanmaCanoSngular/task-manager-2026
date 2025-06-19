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
  test('debe renderizar el nombre y emoji del board', async () => {
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
    expect(screen.getByText('📝')).toBeInTheDocument();
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
    const cardItem = screen.getByRole('listitem', { name: 'Select board Test Board' });
    expect(cardItem).toBeInTheDocument();
    expect(cardItem).toHaveAttribute('aria-label', 'Select board Test Board');
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
    const cardItem = screen.getByRole('listitem', { name: 'Select board Test Board' });
    expect(cardItem).toHaveClass('card-base');
    expect(cardItem).toHaveClass('relative', 'group', 'cursor-pointer');
    expect(getByRole.heading(2)).toBeInTheDocument();
  });

  test('debe renderizar el emoji con las clases correctas', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => ({
        currentBoardId: null,
        fetchBoardDetails: vi.fn(),
        removeBoard: vi.fn(),
      }),
    }));
    const { BoardCard } = await import('../../../src/components/boards/BoardCard');
    render(<BoardCard board={board} />);
    const emoji = screen.getByText('📝');
    // El span que contiene el emoji debe tener las clases correctas
    const emojiSpan = emoji.closest('span');
    expect(emojiSpan).toHaveClass(
      'flex',
      'items-center',
      'justify-center',
      'w-10',
      'h-10',
      'rounded-full',
      'text-xl'
    );
    expect(emojiSpan).toHaveAttribute('aria-hidden', 'true');
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
    const cardItem = screen.getByRole('listitem', { name: 'Select board Test Board' });
    cardItem.focus();
    expect(cardItem).toHaveFocus();
  });
});
