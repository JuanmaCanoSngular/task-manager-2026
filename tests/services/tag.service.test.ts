import { describe, test, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const orderMock = vi.fn();
  const eqMock = vi.fn();
  const singleMock = vi.fn();
  const selectMock = vi.fn();
  const insertMock = vi.fn();
  const updateMock = vi.fn();
  const deleteMock = vi.fn();
  const containsMock = vi.fn();
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
    containsMock,
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

import { tagService } from '../../src/services/tag.service';

const tagRow = { id: 'tag-1', name: 'Urgente', color: '#ef4444' };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSessionMock.mockResolvedValue({
    data: { session: { user: { id: 'user-1' } } },
  });
  mocks.orderMock.mockResolvedValue({ data: [tagRow], error: null });
  mocks.singleMock.mockResolvedValue({ data: tagRow, error: null });
  mocks.containsMock.mockResolvedValue({ data: [], error: null });
  mocks.eqMock.mockImplementation(() => ({
    order: mocks.orderMock,
    single: mocks.singleMock,
  }));
  mocks.selectMock.mockImplementation(() => ({
    eq: mocks.eqMock,
    single: mocks.singleMock,
    then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve({ data: [tagRow], error: null }).then(resolve, reject),
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

describe('tagService', () => {
  test('listTags filtra por board_id', async () => {
    const tags = await tagService.listTags(7);

    expect(mocks.fromMock).toHaveBeenCalledWith('tags');
    expect(mocks.eqMock).toHaveBeenCalledWith('board_id', 7);
    expect(tags).toEqual([{ id: 'tag-1', name: 'Urgente', color: '#ef4444' }]);
  });

  test('ensureDefaults no inserta si el tablero ya tiene etiquetas', async () => {
    const tags = await tagService.ensureDefaults(7);

    expect(mocks.insertMock).not.toHaveBeenCalled();
    expect(tags).toHaveLength(1);
  });

  test('ensureDefaults inserta semilla con board_id si el tablero está vacío', async () => {
    mocks.orderMock.mockResolvedValue({ data: [], error: null });
    mocks.selectMock.mockImplementation(() => ({
      eq: mocks.eqMock,
      single: mocks.singleMock,
      then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
        Promise.resolve({ data: [tagRow], error: null }).then(resolve, reject),
    }));

    await tagService.ensureDefaults(7);

    expect(mocks.insertMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          user_id: 'user-1',
          board_id: 7,
          name: 'Urgente',
        }),
      ])
    );
  });

  test('createTag inserta con board_id', async () => {
    const created = await tagService.createTag(7, '  Bloqueo  ', '#ef4444');

    expect(mocks.insertMock).toHaveBeenCalledWith({
      user_id: 'user-1',
      board_id: 7,
      name: 'Bloqueo',
      color: '#ef4444',
    });
    expect(created.name).toBe('Urgente');
  });

  test('createTag falla sin sesión', async () => {
    mocks.getSessionMock.mockResolvedValue({ data: { session: null } });
    await expect(tagService.createTag(7, 'X', '#000')).rejects.toThrow('No autenticado');
  });
});
