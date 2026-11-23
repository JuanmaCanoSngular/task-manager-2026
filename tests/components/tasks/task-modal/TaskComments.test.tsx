import '@testing-library/jest-dom';
import { createRef } from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  TaskComments,
  type TaskCommentsHandle,
} from '../../../../src/components/tasks/task-modal/TaskComments';

const listByTask = vi.fn();
const create = vi.fn();
const update = vi.fn();
const remove = vi.fn();
const archive = vi.fn();
const softDelete = vi.fn();
const restore = vi.fn();

vi.mock('../../../../src/services/comment.service', () => ({
  commentService: {
    listByTask: (...args: unknown[]) => listByTask(...args),
    create: (...args: unknown[]) => create(...args),
    update: (...args: unknown[]) => update(...args),
    delete: (...args: unknown[]) => remove(...args),
    archive: (...args: unknown[]) => archive(...args),
    softDelete: (...args: unknown[]) => softDelete(...args),
    restore: (...args: unknown[]) => restore(...args),
  },
}));

const sampleComment = {
  id: 'c1',
  taskId: 42,
  body: 'Pasado a bloqueo: falta el listado',
  createdAt: '2026-08-12T10:00:00.000Z',
  updatedAt: '2026-08-12T10:00:00.000Z',
  archivedAt: null,
  deletedAt: null,
};

beforeEach(() => {
  listByTask.mockReset();
  create.mockReset();
  update.mockReset();
  remove.mockReset();
  archive.mockReset();
  softDelete.mockReset();
  restore.mockReset();
  listByTask.mockResolvedValue([]);
});

describe('TaskComments', () => {
  test('muestra estado vacío y permite añadir comentario', async () => {
    create.mockResolvedValue({
      ...sampleComment,
      body: 'Nuevo comentario',
    });
    render(<TaskComments taskId={42} />);

    expect(await screen.findByText(/sin comentarios/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/escribe un comentario/i), {
      target: { value: 'Nuevo comentario' },
    });
    fireEvent.click(screen.getByRole('button', { name: /añadir comentario/i }));

    await waitFor(() => {
      expect(create).toHaveBeenCalledWith(42, 'Nuevo comentario');
    });
    expect(await screen.findByRole('listitem')).toHaveTextContent('Nuevo comentario');
  });

  test('lista comentarios existentes', async () => {
    listByTask.mockResolvedValue([sampleComment]);
    render(<TaskComments taskId={42} />);

    expect(await screen.findByText(sampleComment.body)).toBeInTheDocument();
    expect(screen.getByLabelText('Editar comentario')).toBeInTheDocument();
  });

  test('edita un comentario', async () => {
    listByTask.mockResolvedValue([sampleComment]);
    update.mockResolvedValue({
      ...sampleComment,
      body: 'Texto editado',
      updatedAt: '2026-08-12T11:00:00.000Z',
    });

    render(<TaskComments taskId={42} />);
    await screen.findByText(sampleComment.body);

    fireEvent.click(screen.getByLabelText('Editar comentario'));
    fireEvent.change(screen.getByLabelText('Editar comentario'), {
      target: { value: 'Texto editado' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith('c1', 'Texto editado');
    });
    expect(await screen.findByText('Texto editado')).toBeInTheDocument();
  });

  test('muestra papelera con comentarios eliminados o archivados', async () => {
    listByTask.mockResolvedValue([
      {
        ...sampleComment,
        deletedAt: '2026-08-12T12:00:00.000Z',
        archivedAt: null,
      },
    ]);

    render(<TaskComments taskId={42} />);
    expect(await screen.findByText(/papelera \(1\)/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/papelera \(1\)/i));
    expect(await screen.findByText(/eliminado/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Restaurar comentario')).toBeInTheDocument();
  });

  test('flushPendingDraft guarda el texto escrito sin pulsar Añadir', async () => {
    create.mockResolvedValue({
      ...sampleComment,
      body: 'Desde guardar cambios',
    });
    const ref = createRef<TaskCommentsHandle>();
    render(<TaskComments ref={ref} taskId={42} />);
    await screen.findByText(/sin comentarios/i);

    fireEvent.change(screen.getByPlaceholderText(/escribe un comentario/i), {
      target: { value: 'Desde guardar cambios' },
    });

    expect(ref.current?.hasPendingDraft()).toBe(true);
    await expect(ref.current?.flushPendingDraft()).resolves.toBe(true);
    await waitFor(() => {
      expect(create).toHaveBeenCalledWith(42, 'Desde guardar cambios');
    });
    expect(ref.current?.hasPendingDraft()).toBe(false);
  });
});
