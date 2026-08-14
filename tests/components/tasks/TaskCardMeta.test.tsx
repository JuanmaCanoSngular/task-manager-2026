import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCardMeta, TaskCommentBadge } from '../../../src/components/tasks/TaskCardMeta';

describe('TaskCommentBadge', () => {
  test('muestra icono, conteo y preview al hover', () => {
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

    const badge = screen.getByLabelText(/2 comentarios/);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    vi.spyOn(badge, 'getBoundingClientRect').mockReturnValue({
      x: 40,
      y: 200,
      top: 200,
      bottom: 220,
      left: 40,
      right: 70,
      width: 30,
      height: 20,
      toJSON: () => ({}),
    });
    fireEvent.mouseEnter(badge);

    expect(screen.getByRole('tooltip')).toHaveTextContent('Falta el listado de Julián');
  });

  test('no renderiza si no hay comentarios', () => {
    const { container } = render(
      <TaskCommentBadge task={{ id: 1, title: 'Tarea', columnId: 1, tags: [] }} />
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
