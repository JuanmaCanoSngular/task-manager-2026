import { describe, test, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const orderMock = vi.fn();
  const eqMock = vi.fn();
  const singleMock = vi.fn();
  const selectMock = vi.fn();
  const insertMock = vi.fn();
  const updateMock = vi.fn();
  const deleteMock = vi.fn();
  const fromMock = vi.fn();
  const getSessionMock = vi.fn();

  return {
    orderMock,
    eqMock,
    singleMock,
    selectMock,
    insertMock,
    updateMock,
    deleteMock,
    fromMock,
    getSessionMock,
  };
});

vi.mock('../../src/services/supabase', () => ({
  supabase: {
    from: mocks.fromMock,
    auth: { getSession: mocks.getSessionMock },
  },
}));

import { commentService } from '../../src/services/comment.service';

const commentRow = {
  id: 'c1',
  task_id: 10,
  body: 'Llamar el martes',
  created_at: '2026-08-12T10:00:00.000Z',
  updated_at: '2026-08-12T10:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSessionMock.mockResolvedValue({
    data: { session: { user: { id: 'user-1' } } },
  });
  mocks.orderMock.mockResolvedValue({ data: [], error: null });
  mocks.singleMock.mockResolvedValue({ data: commentRow, error: null });
  mocks.eqMock.mockImplementation(() => ({
    order: mocks.orderMock,
    single: mocks.singleMock,
    select: mocks.selectMock,
  }));
  mocks.selectMock.mockImplementation(() => ({
    eq: mocks.eqMock,
    single: mocks.singleMock,
  }));
  mocks.insertMock.mockReturnValue({ select: mocks.selectMock });
  mocks.updateMock.mockReturnValue({ eq: mocks.eqMock });
  mocks.deleteMock.mockReturnValue({ eq: mocks.eqMock });
  mocks.fromMock.mockReturnValue({
    select: mocks.selectMock,
    insert: mocks.insertMock,
    update: mocks.updateMock,
    delete: mocks.deleteMock,
  });
});

describe('commentService', () => {
  test('listByTask devuelve comentarios ordenados', async () => {
    mocks.orderMock.mockResolvedValue({ data: [commentRow], error: null });

    const comments = await commentService.listByTask(10);

    expect(mocks.fromMock).toHaveBeenCalledWith('task_comments');
    expect(mocks.eqMock).toHaveBeenCalledWith('task_id', 10);
    expect(comments).toEqual([
      {
        id: 'c1',
        taskId: 10,
        body: 'Llamar el martes',
        createdAt: '2026-08-12T10:00:00.000Z',
        updatedAt: '2026-08-12T10:00:00.000Z',
      },
    ]);
  });

  test('create inserta comentario con user_id', async () => {
    mocks.singleMock.mockResolvedValue({ data: commentRow, error: null });

    const created = await commentService.create(10, '  Llamar el martes  ');

    expect(mocks.insertMock).toHaveBeenCalledWith({
      task_id: 10,
      user_id: 'user-1',
      body: 'Llamar el martes',
    });
    expect(created.body).toBe('Llamar el martes');
  });

  test('create falla sin sesión', async () => {
    mocks.getSessionMock.mockResolvedValue({ data: { session: null } });
    await expect(commentService.create(10, 'Hola')).rejects.toThrow('Inicia sesión');
  });

  test('update modifica el cuerpo', async () => {
    mocks.singleMock.mockResolvedValue({
      data: { ...commentRow, body: 'Actualizado', updated_at: '2026-08-12T11:00:00.000Z' },
      error: null,
    });

    const updated = await commentService.update('c1', 'Actualizado');

    expect(mocks.updateMock).toHaveBeenCalled();
    expect(updated.body).toBe('Actualizado');
  });

  test('delete elimina por id', async () => {
    mocks.eqMock.mockResolvedValue({ error: null });

    await commentService.delete('c1');

    expect(mocks.deleteMock).toHaveBeenCalled();
    expect(mocks.eqMock).toHaveBeenCalledWith('id', 'c1');
  });

  test('summariesByTaskIds agrupa conteos y último comentario', async () => {
    mocks.fromMock.mockReturnValue({
      select: vi.fn(() => ({
        in: vi.fn().mockResolvedValue({
          data: [
            { task_id: 10, body: 'Primero', created_at: '2026-08-12T10:00:00.000Z' },
            { task_id: 10, body: 'Último comentario largo', created_at: '2026-08-12T11:00:00.000Z' },
            { task_id: 20, body: 'Otro', created_at: '2026-08-12T09:00:00.000Z' },
          ],
          error: null,
        }),
      })),
    });

    const summaries = await commentService.summariesByTaskIds([10, 20]);

    expect(summaries[10]).toEqual({
      count: 2,
      latestPreview: 'Último comentario largo',
    });
    expect(summaries[20]).toEqual({ count: 1, latestPreview: 'Otro' });
  });
});
