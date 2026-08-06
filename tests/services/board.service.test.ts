import { describe, test, expect, beforeEach, vi } from 'vitest';

// Mock encadenable del cliente Supabase. Definido con vi.hoisted porque la
// factory de vi.mock se eleva por encima de las declaraciones del módulo.
const mocks = vi.hoisted(() => {
  const orderMock = vi.fn();
  const eqMock = vi.fn(() => Promise.resolve({ error: null as Error | null }));
  const singleMock = vi.fn(() =>
    Promise.resolve({
      data: {
        id: 42,
        name: 'Nuevo',
        emoji: '🎯',
        color: '#000',
        is_default: false,
      } as Record<string, unknown>,
      error: null as Error | null,
    })
  );
  const selectAfterInsertMock = vi.fn(() => ({ single: singleMock }));
  const insertMock = vi.fn(() => ({ select: selectAfterInsertMock }));
  const selectMock = vi.fn(() => ({ order: orderMock }));
  const updateMock = vi.fn(() => ({ eq: eqMock }));
  const deleteMock = vi.fn(() => ({ eq: eqMock }));
  const fromMock = vi.fn(() => ({
    select: selectMock,
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
  }));
  const getSessionMock = vi.fn(() =>
    Promise.resolve({ data: { session: null as { user: { id: string } } | null } })
  );
  return {
    orderMock,
    eqMock,
    insertMock,
    selectMock,
    updateMock,
    deleteMock,
    fromMock,
    getSessionMock,
    singleMock,
    selectAfterInsertMock,
  };
});

const {
  orderMock,
  eqMock,
  insertMock,
  updateMock,
  deleteMock,
  fromMock,
  getSessionMock,
  singleMock,
  selectAfterInsertMock,
} = mocks;

vi.mock('../../src/services/supabase', () => ({
  supabase: {
    from: mocks.fromMock,
    auth: { getSession: mocks.getSessionMock },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
}));

import { boardService } from '../../src/services/board.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Board Service (Supabase)', () => {
  describe('getBoards', () => {
    test('mapea filas de boards y tasks en tableros con tareas anidadas', async () => {
      orderMock
        .mockResolvedValueOnce({
          data: [{ id: 1, name: 'Productividad', emoji: '🚀', color: '#fff' }],
          error: null,
        })
        .mockResolvedValueOnce({
          data: [
            {
              id: 101,
              board_id: 1,
              title: 'Tarea 1',
              status: 'backlog',
              tags: ['technical'],
              position: 0,
            },
          ],
          error: null,
        });

      const result = await boardService.getBoards();

      expect(fromMock).toHaveBeenCalledWith('boards');
      expect(fromMock).toHaveBeenCalledWith('tasks');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: 1, name: 'Productividad' });
      expect(result[0].tasks).toHaveLength(1);
      expect(result[0].tasks[0]).toMatchObject({
        id: 101,
        title: 'Tarea 1',
        status: 'backlog',
        tags: ['technical'],
      });
    });

    test('tablero sin tareas devuelve lista vacía', async () => {
      orderMock
        .mockResolvedValueOnce({
          data: [{ id: 2, name: 'Vacío', emoji: '', color: '' }],
          error: null,
        })
        .mockResolvedValueOnce({ data: [], error: null });

      const result = await boardService.getBoards();
      expect(result[0].tasks).toEqual([]);
    });

    test('propaga el error si falla la consulta de boards', async () => {
      orderMock
        .mockResolvedValueOnce({ data: null, error: new Error('boom') })
        .mockResolvedValueOnce({ data: [], error: null });

      await expect(boardService.getBoards()).rejects.toThrow('boom');
    });
  });

  describe('mutaciones', () => {
    test('insertBoard incluye user_id cuando hay sesión y devuelve el id de la DB', async () => {
      getSessionMock.mockResolvedValueOnce({
        data: { session: { user: { id: 'user-abc' } } },
      });
      const created = await boardService.insertBoard({
        name: 'Nuevo',
        emoji: '🎯',
        color: '#000',
        isDefault: false,
      });
      expect(insertMock).toHaveBeenCalledWith({
        name: 'Nuevo',
        emoji: '🎯',
        color: '#000',
        is_default: false,
        user_id: 'user-abc',
      });
      expect(selectAfterInsertMock).toHaveBeenCalled();
      expect(created.id).toBe(42);
    });

    test('setDefaultBoard limpia el resto y marca el elegido', async () => {
      const neqMock = vi.fn(() => Promise.resolve({ error: null }));
      updateMock
        .mockReturnValueOnce({ neq: neqMock } as unknown as ReturnType<typeof updateMock>)
        .mockReturnValueOnce({ eq: eqMock });

      await boardService.setDefaultBoard(3);

      expect(updateMock).toHaveBeenCalledWith({ is_default: false });
      expect(neqMock).toHaveBeenCalledWith('id', 3);
      expect(updateMock).toHaveBeenCalledWith({ is_default: true });
      expect(eqMock).toHaveBeenCalledWith('id', 3);
    });

    test('insertTask inserta la tarea sin id de cliente y la devuelve', async () => {
      singleMock.mockResolvedValueOnce({
        data: {
          id: 10,
          board_id: 1,
          title: 'T',
          status: 'backlog',
          tags: ['design'],
          position: 3,
        } as Record<string, unknown>,
        error: null,
      });
      const created = await boardService.insertTask(
        1,
        { title: 'T', status: 'backlog', tags: ['design'] },
        3
      );
      expect(fromMock).toHaveBeenCalledWith('tasks');
      expect(insertMock).toHaveBeenCalledWith({
        board_id: 1,
        title: 'T',
        status: 'backlog',
        background: null,
        tags: ['design'],
        position: 3,
      });
      expect(created.id).toBe(10);
    });

    test('deleteTask borra por id', async () => {
      await boardService.deleteTask(10);
      expect(fromMock).toHaveBeenCalledWith('tasks');
      expect(deleteMock).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith('id', 10);
    });

    test('updateTask actualiza los campos de la tarea', async () => {
      await boardService.updateTask(10, {
        title: 'Editada',
        status: 'completed',
        tags: [],
      });
      expect(updateMock).toHaveBeenCalledWith({
        title: 'Editada',
        status: 'completed',
        background: null,
        tags: [],
      });
      expect(eqMock).toHaveBeenCalledWith('id', 10);
    });

    test('saveTaskOrder actualiza estado y posición de cada fila', async () => {
      await boardService.saveTaskOrder([
        { id: 1, status: 'backlog', position: 0 },
        { id: 2, status: 'in-progress', position: 1 },
      ]);
      expect(updateMock).toHaveBeenCalledWith({ status: 'backlog', position: 0 });
      expect(updateMock).toHaveBeenCalledWith({ status: 'in-progress', position: 1 });
      expect(eqMock).toHaveBeenCalledWith('id', 1);
      expect(eqMock).toHaveBeenCalledWith('id', 2);
    });

    test('propaga el error si una escritura falla', async () => {
      singleMock.mockResolvedValueOnce({ data: null as unknown as Record<string, unknown>, error: new Error('insert fail') });
      await expect(
        boardService.insertBoard({ name: 'x', emoji: '', color: '', isDefault: true })
      ).rejects.toThrow('insert fail');
    });

    test('getBoards mapea is_default a isDefault', async () => {
      orderMock
        .mockResolvedValueOnce({
          data: [{ id: 1, name: 'A', emoji: '', color: '#fff', is_default: true }],
          error: null,
        })
        .mockResolvedValueOnce({ data: [], error: null });

      const result = await boardService.getBoards();
      expect(result[0].isDefault).toBe(true);
    });
  });
});
