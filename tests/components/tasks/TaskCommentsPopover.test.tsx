import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskCommentsPopover } from '../../../src/components/tasks/TaskCommentsPopover';

const listByTask = vi.fn();
const create = vi.fn();

vi.mock('../../../src/services/comment.service', () => ({
  commentService: {
    listByTask: (...args: unknown[]) => listByTask(...args),
    create: (...args: unknown[]) => create(...args),
  },
}));

vi.mock('../../../src/stores/board.store', () => ({
  useBoardStore: {
    getState: () => ({
      setTaskCommentSummary: vi.fn(),
    }),
  },
}));

beforeEach(() => {
  listByTask.mockReset();
  create.mockReset();
  listByTask.mockResolvedValue([
    {
      id: 'c1',
      taskId: 7,
      body: 'Llamar el martes',
      createdAt: '2026-08-12T10:00:00.000Z',
      updatedAt: '2026-08-12T10:00:00.000Z',
    },
  ]);
});

describe('TaskCommentsPopover', () => {
  test('carga y muestra comentarios tipo chat', async () => {
    const anchor = document.createElement('button');
    document.body.appendChild(anchor);
    vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({
      x: 40,
      y: 80,
      top: 80,
      bottom: 100,
      left: 40,
      right: 70,
      width: 30,
      height: 20,
      toJSON: () => ({}),
    });

    render(
      <TaskCommentsPopover
        taskId={7}
        taskTitle="Revisar presupuesto"
        anchorEl={anchor}
        open
        onClose={vi.fn()}
      />
    );

    expect(await screen.findByRole('dialog', { name: /comentarios de revisar/i })).toBeInTheDocument();
    expect(await screen.findByText('Llamar el martes')).toBeInTheDocument();
  });

  test('permite enviar un comentario nuevo', async () => {
    create.mockResolvedValue({
      id: 'c2',
      taskId: 7,
      body: 'Hecho',
      createdAt: '2026-08-12T11:00:00.000Z',
      updatedAt: '2026-08-12T11:00:00.000Z',
    });
    const anchor = document.createElement('button');
    document.body.appendChild(anchor);
    vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({
      x: 40,
      y: 80,
      top: 80,
      bottom: 100,
      left: 40,
      right: 70,
      width: 30,
      height: 20,
      toJSON: () => ({}),
    });

    render(
      <TaskCommentsPopover
        taskId={7}
        taskTitle="Tarea"
        anchorEl={anchor}
        open
        onClose={vi.fn()}
      />
    );

    await screen.findByText('Llamar el martes');
    fireEvent.change(screen.getByLabelText(/nuevo comentario/i), {
      target: { value: 'Hecho' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^enviar$/i }));

    await waitFor(() => {
      expect(create).toHaveBeenCalledWith(7, 'Hecho');
    });
    expect(await screen.findByText('Hecho')).toBeInTheDocument();
  });
});
