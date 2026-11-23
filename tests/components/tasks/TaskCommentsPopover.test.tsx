import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskCommentsPopover } from '../../../src/components/tasks/TaskCommentsPopover';

const listByTask = vi.fn();
const create = vi.fn();
const archive = vi.fn();
const remove = vi.fn();
const unarchive = vi.fn();

vi.mock('../../../src/services/comment.service', () => ({
  commentService: {
    listByTask: (...args: unknown[]) => listByTask(...args),
    create: (...args: unknown[]) => create(...args),
    archive: (...args: unknown[]) => archive(...args),
    delete: (...args: unknown[]) => remove(...args),
    unarchive: (...args: unknown[]) => unarchive(...args),
  },
}));

const moveTask = vi.fn();

vi.mock('../../../src/stores/board.store', () => ({
  useBoardStore: Object.assign(
    (sel: (s: { moveTask: typeof moveTask }) => unknown) => sel({ moveTask }),
    {
      getState: () => ({
        setTaskCommentSummary: vi.fn(),
        moveTask,
      }),
    }
  ),
  useCurrentBoardColumns: () => [
    {
      id: 11,
      boardId: 1,
      name: 'Pendiente',
      color: '#64748b',
      position: 0,
      slug: 'backlog',
      isInbox: true,
    },
    {
      id: 13,
      boardId: 1,
      name: 'Bloqueos',
      color: '#ef4444',
      position: 2,
      slug: 'in-review',
      isInbox: false,
    },
  ],
}));

beforeEach(() => {
  listByTask.mockReset();
  create.mockReset();
  archive.mockReset();
  remove.mockReset();
  unarchive.mockReset();
  moveTask.mockReset();
  listByTask.mockResolvedValue([
    {
      id: 'c1',
      taskId: 7,
      body: 'Llamar el martes',
      createdAt: '2026-08-12T10:00:00.000Z',
      updatedAt: '2026-08-12T10:00:00.000Z',
      archivedAt: null,
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

  test('A Bloqueos comenta y mueve la tarea', async () => {
    create.mockResolvedValue({
      id: 'c3',
      taskId: 7,
      body: 'Bloqueado por proveedor',
      createdAt: '2026-08-12T12:00:00.000Z',
      updatedAt: '2026-08-12T12:00:00.000Z',
    });
    const onClose = vi.fn();
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
        taskTitle="Presupuesto"
        columnId={11}
        anchorEl={anchor}
        open
        onClose={onClose}
      />
    );

    await screen.findByText('Llamar el martes');
    fireEvent.change(screen.getByLabelText(/nuevo comentario/i), {
      target: { value: 'Bloqueado por proveedor' },
    });
    fireEvent.click(screen.getByRole('button', { name: /a bloqueos/i }));

    await waitFor(() => {
      expect(create).toHaveBeenCalledWith(7, 'Bloqueado por proveedor');
      expect(moveTask).toHaveBeenCalledWith(7, 13, 0);
      expect(onClose).toHaveBeenCalled();
    });
  });

  test('el espacio en el textarea no se propaga al padre', async () => {
    const parentKeyDown = vi.fn();
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
      <div onKeyDown={parentKeyDown}>
        <TaskCommentsPopover
          taskId={7}
          taskTitle="Tarea"
          anchorEl={anchor}
          open
          onClose={vi.fn()}
        />
      </div>
    );

    const input = await screen.findByLabelText(/nuevo comentario/i);
    fireEvent.keyDown(input, { key: ' ', code: 'Space' });
    expect(parentKeyDown).not.toHaveBeenCalled();
  });
});
