import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

vi.mock('../../../src/stores/board.store', () => ({
  useTasksByColumn: () => [
    { id: 1, title: 'A', columnId: 10, tags: [] },
    { id: 2, title: 'B', columnId: 10, tags: [] },
  ],
  useBoardStore: (sel: (s: Record<string, unknown>) => unknown) =>
    sel({
      updateTask: vi.fn(),
      toggleTaskPinned: vi.fn(),
      removeTask: vi.fn(),
      currentBoardId: 1,
      boards: [],
    }),
}));

vi.mock('../../../src/stores/tag.store', () => ({
  useTagStore: (sel: (s: { filterTagIds: string[]; tags: unknown[] }) => unknown) =>
    sel({ filterTagIds: [], tags: [] }),
}));

vi.mock('../../../src/components/tasks/TaskCard', () => ({
  TaskCard: ({ task }: { task: { title: string } }) => <div>{task.title}</div>,
}));

vi.mock('@hello-pangea/dnd', () => ({
  Droppable: ({ children }: { children: (p: object, s: object) => unknown }) =>
    children(
      { innerRef: vi.fn(), droppableProps: {}, placeholder: null },
      { isDraggingOver: false }
    ),
}));

import { StatusColumn } from '../../../src/components/boards/StatusColumn';

afterEach(() => cleanup());

describe('StatusColumn collapse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('colapsada muestra nombre vertical y permite expandir', () => {
    const onToggle = vi.fn();
    render(
      <StatusColumn
        column={{
          id: 10,
          boardId: 1,
          name: 'Bloqueos',
          color: '#ef4444',
          position: 2,
          slug: 'in-review',
          isInbox: false,
        }}
        collapsed
        onToggleCollapse={onToggle}
      />
    );

    expect(screen.getByRole('button', { name: /expandir columna bloqueos/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /bloqueos, 2 tareas/i }));
    expect(onToggle).toHaveBeenCalled();
  });

  test('expandida ofrece colapsar', () => {
    const onToggle = vi.fn();
    render(
      <StatusColumn
        column={{
          id: 10,
          boardId: 1,
          name: 'Bloqueos',
          color: '#ef4444',
          position: 2,
          slug: 'in-review',
          isInbox: false,
        }}
        onToggleCollapse={onToggle}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /colapsar columna bloqueos/i }));
    expect(onToggle).toHaveBeenCalled();
  });
});
