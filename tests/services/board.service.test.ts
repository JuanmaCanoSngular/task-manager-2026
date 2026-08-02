import { describe, test, expect, beforeEach, vi } from 'vitest';

// Mock encadenable del cliente Supabase. Definido con vi.hoisted porque la
// factory de vi.mock se eleva por encima de las declaraciones del módulo.
const mocks = vi.hoisted(() => {
  const orderMock = vi.fn();
  const eqMock = vi.fn(() => Promise.resolve({ error: null as Error | null }));
  const insertMock = vi.fn(() => Promise.resolve({ error: null as Error | null }));
  const selectMock = vi.fn(() => ({ order: orderMock }));
  const updateMock = vi.fn(() => ({ eq: eqMock }));
  const deleteMock = vi.fn(() => ({ eq: eqMock }));
  const fromMock = vi.fn(() => ({
    select: selectMock,
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
  }));
  return { orderMock, eqMock, insertMock, selectMock, updateMock, deleteMock, fromMock };
});

const { orderMock, eqMock, insertMock, updateMock, deleteMock, fromMock } = mocks;

vi.mock('../../src/services/supabase', () => ({
  supabase: { from: mocks.fromMock },
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
              background: null,
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
      expect(result[0].tasks[0].background).toBeUndefined();
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
    test('insertBoard inserta en la tabla boards', async () => {
      await boardService.insertBoard({ id: 5, name: 'Nuevo', emoji: '🎯', color: '#000' });
      expect(fromMock).toHaveBeenCalledWith('boards');
      expect(insertMock).toHaveBeenCalledWith({
        id: 5,
        name: 'Nuevo',
        emoji: '🎯',
        color: '#000',
      });
    });

    test('insertTask inserta la tarea con board_id y posición', async () => {
      await boardService.insertTask(
        1,
        { id: 10, title: 'T', status: 'backlog', tags: ['design'], background: undefined },
        3
      );
      expect(fromMock).toHaveBeenCalledWith('tasks');
      expect(insertMock).toHaveBeenCalledWith({
        id: 10,
        board_id: 1,
        title: 'T',
        status: 'backlog',
        background: null,
        tags: ['design'],
        position: 3,
      });
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
        background: undefined,
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
      insertMock.mockResolvedValueOnce({ error: new Error('insert fail') });
      await expect(
        boardService.insertBoard({ id: 9, name: 'x', emoji: '', color: '' })
      ).rejects.toThrow('insert fail');
    });
  });
});
