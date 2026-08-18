import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MOCK_SHOPPING_COLUMNS, mockTask } from '../../../utils/mock-columns';

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  cleanup();
});

describe('ShoppingBoard', () => {
  test('añade artículos y los reparte por coma', async () => {
    const addNewTask = vi.fn(() => Promise.resolve());
    const tasks = [mockTask({ id: 1, title: 'Leche', columnId: 11 })];
    vi.doMock('../../../../src/stores/board.store', () => ({
      useBoardStore: (
        selector: (s: { addNewTask: typeof addNewTask; moveTask: () => void }) => unknown
      ) => selector({ addNewTask, moveTask: vi.fn() }),
      useCurrentBoardTasks: () => tasks,
      useCurrentBoardColumns: () => MOCK_SHOPPING_COLUMNS,
    }));

    const { ShoppingBoard } =
      await import('../../../../src/components/boards/shopping/ShoppingBoard');
    render(
      <ShoppingBoard
        board={{
          id: 1,
          name: 'Compra',
          emoji: '',
          color: '#0d9488',
          link: '',
          isDefault: true,
          kind: 'shopping',
          columns: MOCK_SHOPPING_COLUMNS,
          tasks,
        }}
      />
    );

    expect(screen.getByText('Leche')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/nombre del artículo/i), {
      target: { value: 'Pan, Tomate' },
    });
    fireEvent.submit(screen.getByRole('form', { name: /añadir artículo/i }));

    await vi.waitFor(() => {
      expect(addNewTask).toHaveBeenCalledTimes(2);
    });
    expect(addNewTask).toHaveBeenNthCalledWith(1, { title: 'Tomate', columnId: 11, tags: [] });
    expect(addNewTask).toHaveBeenNthCalledWith(2, { title: 'Pan', columnId: 11, tags: [] });
  });

  test('el check mueve el artículo a comprado', async () => {
    const moveTask = vi.fn();
    const tasks = [mockTask({ id: 7, title: 'Leche', columnId: 11 })];
    vi.doMock('../../../../src/stores/board.store', () => ({
      useBoardStore: (
        selector: (s: { addNewTask: () => void; moveTask: typeof moveTask }) => unknown
      ) => selector({ addNewTask: vi.fn(), moveTask }),
      useCurrentBoardTasks: () => tasks,
      useCurrentBoardColumns: () => MOCK_SHOPPING_COLUMNS,
    }));

    const { ShoppingBoard } =
      await import('../../../../src/components/boards/shopping/ShoppingBoard');
    render(
      <ShoppingBoard
        board={{
          id: 1,
          name: 'Compra',
          emoji: '',
          color: '#0d9488',
          link: '',
          isDefault: true,
          kind: 'shopping',
          columns: MOCK_SHOPPING_COLUMNS,
          tasks,
        }}
      />
    );

    fireEvent.click(screen.getByRole('checkbox', { name: /marcar leche como comprado/i }));
    expect(moveTask).toHaveBeenCalledWith(7, 12, 0);
  });
});
