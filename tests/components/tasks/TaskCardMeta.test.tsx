import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCardMeta, TaskCommentBadge, TaskChecklistBadge } from '../../../src/components/tasks/TaskCardMeta';

vi.mock('../../../src/components/tasks/TaskCommentsPopover', () => ({
  TaskCommentsPopover: ({ open }: { open: boolean }) =>
    open ? <div role="dialog" aria-label="Comentarios mock">chat</div> : null,
}));

describe('TaskCommentBadge', () => {
  test('abre el popup de comentarios al hacer clic', () => {
    render(
      <TaskCommentBadge
        task={{
          id: 1,
          title: 'Tarea',
          columnId: 1,
          tags: [],
          commentCount: 2,
          latestCommentPreview: 'Falta el listado de Julián',
        }}
      />
    );

    const badge = screen.getByRole('button', { name: /2 comentarios/i });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(badge);
    expect(screen.getByRole('dialog', { name: /comentarios mock/i })).toBeInTheDocument();
  });

  test('no renderiza si no hay comentarios', () => {
    const { container } = render(
      <TaskCommentBadge task={{ id: 1, title: 'Tarea', columnId: 1, tags: [] }} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe('TaskChecklistBadge', () => {
  test('muestra el progreso del checklist', () => {
    render(
      <TaskChecklistBadge
        task={{
          id: 1,
          title: 'Compra',
          columnId: 1,
          tags: [],
          checklistTotal: 3,
          checklistDone: 1,
        }}
      />
    );
    expect(screen.getByLabelText('1 de 3 en el checklist')).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  test('no renderiza si no hay ítems', () => {
    const { container } = render(
      <TaskChecklistBadge task={{ id: 1, title: 'Tarea', columnId: 1, tags: [] }} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe('TaskCardMeta', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-12T12:00:00.000Z'));
  });

  test('muestra la fecha relativa', () => {
    render(
      <TaskCardMeta
        recent={false}
        task={{
          id: 1,
          title: 'Tarea',
          columnId: 1,
          tags: [],
          createdAt: '2026-08-12T11:00:00.000Z',
        }}
      />
    );

    expect(screen.getByText(/hace 1 hora/i)).toBeInTheDocument();
  });

  test('no muestra nada si no hay fecha', () => {
    const { container } = render(
      <TaskCardMeta
        recent={false}
        task={{ id: 1, title: 'Tarea', columnId: 1, tags: [], commentCount: 2 }}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
