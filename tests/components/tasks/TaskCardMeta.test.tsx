import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskCardMeta } from '../../../src/components/tasks/TaskCardMeta';

describe('TaskCardMeta', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-12T12:00:00.000Z'));
  });

  test('muestra icono, conteo y preview cuando hay comentarios', () => {
    render(
      <TaskCardMeta
        recent={false}
        task={{
          id: 1,
          title: 'Tarea',
          columnId: 1,
          tags: [],
          commentCount: 2,
          latestCommentPreview: 'Falta el listado de Julián',
          createdAt: '2026-08-12T11:00:00.000Z',
        }}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent(
      'Falta el listado de Julián'
    );
    expect(screen.getByText(/hace 1 hora/i)).toBeInTheDocument();
  });

  test('no muestra nada si no hay comentarios ni fecha', () => {
    const { container } = render(
      <TaskCardMeta
        recent={false}
        task={{ id: 1, title: 'Tarea', columnId: 1, tags: [] }}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
