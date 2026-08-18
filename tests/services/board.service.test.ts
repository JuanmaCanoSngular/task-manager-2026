import { describe, test, expect, beforeEach, vi } from 'vitest';
import { MOCK_COLUMNS } from '../utils/mock-columns';

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
  const fetchColumnsForBoardsMock = vi.fn(() =>
    Promise.resolve(new Map([[1, MOCK_COLUMNS.map((c) => ({ ...c, boardId: 1 }))]]))
  );
  const seedDefaultColumnsMock = vi.fn(() =>
    Promise.resolve(MOCK_COLUMNS.map((c) => ({ ...c, boardId: 1 })))
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
    fetchColumnsForBoardsMock,
    seedDefaultColumnsMock,
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
  fetchColumnsForBoardsMock,
  seedDefaultColumnsMock,
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

vi.mock('../../src/services/column.service', () => ({
  columnService: {
    fetchColumnsForBoards: mocks.fetchColumnsForBoardsMock,
    seedDefaultColumns: mocks.seedDefaultColumnsMock,
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
              column_id: 1,
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
      expect(result[0].columns).toHaveLength(4);
      expect(result[0].tasks).toHaveLength(1);
      expect(result[0].tasks[0]).toMatchObject({
        id: 101,
        title: 'Tarea 1',
        columnId: 1,
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
      fetchColumnsForBoardsMock.mockResolvedValueOnce(new Map([[2, []]]));
      seedDefaultColumnsMock.mockResolvedValueOnce(
        MOCK_COLUMNS.map((c) => ({ ...c, boardId: 2 }))
      );

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
        kind: 'kanban',
        user_id: 'user-abc',
      });
      expect(selectAfterInsertMock).toHaveBeenCalled();
      expect(created.id).toBe(42);
      expect(created.columns).toHaveLength(4);
      expect(created.kind).toBe('kanban');
      expect(seedDefaultColumnsMock).toHaveBeenCalledWith(42, 'kanban');
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
          column_id: 1,
          status: 'backlog',
          tags: ['design'],
          position: 3,
        } as Record<string, unknown>,
        error: null,
      });
      const columns = MOCK_COLUMNS.map((c) => ({ ...c, boardId: 1 }));
      const created = await boardService.insertTask(
        1,
        { title: 'T', columnId: 1, tags: ['design'] },
        3,
        columns
      );
      expect(fromMock).toHaveBeenCalledWith('tasks');
      expect(insertMock).toHaveBeenCalledWith({
        board_id: 1,
        title: 'T',
        column_id: 1,
        status: 'backlog',
        tags: ['design'],
        position: 3,
      });
      expect(created.id).toBe(10);
      expect(created.columnId).toBe(1);
    });

    test('deleteTask borra por id', async () => {
      await boardService.deleteTask(10);
      expect(fromMock).toHaveBeenCalledWith('tasks');
      expect(deleteMock).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith('id', 10);
    });

    test('updateTask actualiza los campos de la tarea', async () => {
      const columns = MOCK_COLUMNS.map((c) => ({ ...c, boardId: 1 }));
      await boardService.updateTask(
        10,
        {
          title: 'Editada',
          columnId: 4,
          tags: [],
        },
        columns
      );
      expect(updateMock).toHaveBeenCalledWith({
        title: 'Editada',
        column_id: 4,
        status: 'completed',
        tags: [],
      });
      expect(eqMock).toHaveBeenCalledWith('id', 10);
    });

    test('setTaskPinned actualiza el flag pinned', async () => {
      await boardService.setTaskPinned(10, true);
      expect(fromMock).toHaveBeenCalledWith('tasks');
      expect(updateMock).toHaveBeenCalledWith({ pinned: true });
      expect(eqMock).toHaveBeenCalledWith('id', 10);
    });

    test('rowToTask incluye pinned solo si es true', async () => {
      const { rowToTask } = await import('../../src/services/board.service');
      expect(
        rowToTask({
          id: 1,
          board_id: 1,
          title: 'X',
          status: 'backlog',
          column_id: 1,
          pinned: true,
          tags: [],
          position: 0,
        }).pinned
      ).toBe(true);
      expect(
        rowToTask({
          id: 2,
          board_id: 1,
          title: 'Y',
          status: 'backlog',
          column_id: 1,
          pinned: false,
          tags: [],
          position: 1,
        }).pinned
      ).toBeUndefined();
    });

    test('saveTaskOrder actualiza columnId y posición de cada fila', async () => {
      await boardService.saveTaskOrder([
        { id: 1, columnId: 1, position: 0 },
        { id: 2, columnId: 2, position: 1 },
      ]);
      expect(updateMock).toHaveBeenCalledWith({ column_id: 1, position: 0 });
      expect(updateMock).toHaveBeenCalledWith({ column_id: 2, position: 1 });
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
      expect(result[0].kind).toBe('kanban');
    });

    test('insertBoard con kind shopping siembra columnas de compra', async () => {
      seedDefaultColumnsMock.mockResolvedValueOnce([
        { id: 11, boardId: 42, name: 'Por comprar', color: '#0d9488', slug: 'backlog', isInbox: true, position: 0 },
        { id: 12, boardId: 42, name: 'Comprado', color: '#22c55e', slug: 'completed', isInbox: false, position: 1 },
        { id: 13, boardId: 42, name: 'Descartado', color: '#94a3b8', slug: 'discarded', isInbox: false, position: 2 },
      ]);
      const created = await boardService.insertBoard({
        name: 'Compra',
        emoji: '',
        color: '#0d9488',
        isDefault: false,
        kind: 'shopping',
      });
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Compra', kind: 'shopping' })
      );
      expect(seedDefaultColumnsMock).toHaveBeenCalledWith(42, 'shopping');
      expect(created.kind).toBe('shopping');
      expect(created.columns).toHaveLength(3);
    });
  });
});
