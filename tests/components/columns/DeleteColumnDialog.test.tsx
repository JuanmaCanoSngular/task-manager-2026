import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { setupWindowMocks, cleanupTest } from '../../utils/component-test-utils';
import { MOCK_COLUMNS } from '../../utils/mock-columns';

beforeAll(() => {
  setupWindowMocks();
});

afterEach(() => {
  cleanup();
  cleanupTest();
});

describe('DeleteColumnDialog', () => {
  test('shows move and delete options when column has tasks', async () => {
    const { DeleteColumnDialog } = await import(
      '../../../src/components/columns/DeleteColumnDialog'
    );

    render(
      <DeleteColumnDialog
        isOpen
        onClose={vi.fn()}
        column={MOCK_COLUMNS[1]}
        columns={MOCK_COLUMNS}
        taskCount={3}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText(/esta columna tiene 3 tareas/i)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /mover tareas a otra columna/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /eliminar tareas definitivamente/i })).toBeInTheDocument();
  });

  test('confirms move with selected target column', async () => {
    const onConfirm = vi.fn();
    const { DeleteColumnDialog } = await import(
      '../../../src/components/columns/DeleteColumnDialog'
    );

    render(
      <DeleteColumnDialog
        isOpen
        onClose={vi.fn()}
        column={MOCK_COLUMNS[1]}
        columns={MOCK_COLUMNS}
        taskCount={2}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /eliminar columna/i }));

    expect(onConfirm).toHaveBeenCalledWith({ moveTasksToColumnId: MOCK_COLUMNS[0].id });
  });

  test('confirms delete tasks when that option is selected', async () => {
    const onConfirm = vi.fn();
    const { DeleteColumnDialog } = await import(
      '../../../src/components/columns/DeleteColumnDialog'
    );

    render(
      <DeleteColumnDialog
        isOpen
        onClose={vi.fn()}
        column={MOCK_COLUMNS[1]}
        columns={MOCK_COLUMNS}
        taskCount={1}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByRole('radio', { name: /eliminar tareas definitivamente/i }));
    fireEvent.click(screen.getByRole('button', { name: /eliminar columna/i }));

    expect(onConfirm).toHaveBeenCalledWith({});
  });

  test('shows simple message for empty column', async () => {
    const { DeleteColumnDialog } = await import(
      '../../../src/components/columns/DeleteColumnDialog'
    );

    render(
      <DeleteColumnDialog
        isOpen
        onClose={vi.fn()}
        column={MOCK_COLUMNS[1]}
        columns={MOCK_COLUMNS}
        taskCount={0}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText(/la columna está vacía/i)).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /mover tareas a otra columna/i })).not.toBeInTheDocument();
  });
});
