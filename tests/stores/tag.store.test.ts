import { describe, test, expect, beforeEach, vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { tagService } from '../../src/services/tag.service';
import { useTagStore } from '../../src/stores/tag.store';
import { useBoardStore } from '../../src/stores/board.store';

vi.mock('../../src/services/board.service', () => ({
  boardService: {
    getBoards: vi.fn(),
    insertBoard: vi.fn(),
    deleteBoard: vi.fn(),
    updateBoard: vi.fn(),
    setDefaultBoard: vi.fn(),
    insertTask: vi.fn(),
    updateTask: vi.fn(),
    setTaskPinned: vi.fn(),
    deleteTask: vi.fn(),
    saveTaskOrder: vi.fn(),
  },
}));

vi.mock('../../src/services/tag.service', () => ({
  tagService: {
    ensureDefaults: vi.fn(),
    createTag: vi.fn(),
    updateTag: vi.fn(),
    deleteTag: vi.fn(),
  },
}));

const ensureDefaults = vi.mocked(tagService.ensureDefaults);
const createTag = vi.mocked(tagService.createTag);

describe('TagStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    act(() => {
      useTagStore.setState({ tags: [], boardId: null, loaded: false, error: null, filterTagIds: [] });
      useBoardStore.setState({ currentBoardId: 3, boards: [], error: null });
    });
  });

  test('fetchTags carga las etiquetas del tablero', async () => {
    ensureDefaults.mockResolvedValue([{ id: 'a', name: 'Idea', color: '#06b6d4' }]);

    await act(async () => {
      await useTagStore.getState().fetchTags(3);
    });

    expect(ensureDefaults).toHaveBeenCalledWith(3);
    expect(useTagStore.getState().tags).toEqual([{ id: 'a', name: 'Idea', color: '#06b6d4' }]);
    expect(useTagStore.getState().boardId).toBe(3);
    expect(useTagStore.getState().loaded).toBe(true);
  });

  test('fetchTags ignora una respuesta tardía de otro tablero', async () => {
    let resolveFirst: (tags: { id: string; name: string; color: string }[]) => void = () => undefined;
    ensureDefaults.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        })
    );
    ensureDefaults.mockResolvedValueOnce([{ id: 'b', name: 'Urgente', color: '#ef4444' }]);

    const first = useTagStore.getState().fetchTags(1);
    await act(async () => {
      await useTagStore.getState().fetchTags(2);
    });
    resolveFirst([{ id: 'stale', name: 'Vieja', color: '#000000' }]);
    await act(async () => {
      await first;
    });

    expect(useTagStore.getState().boardId).toBe(2);
    expect(useTagStore.getState().tags).toEqual([{ id: 'b', name: 'Urgente', color: '#ef4444' }]);
  });

  test('addTag usa el boardId del store', async () => {
    act(() => {
      useTagStore.setState({ boardId: 9 });
    });
    createTag.mockResolvedValue({ id: 'n', name: 'Nueva', color: '#22c55e' });

    await act(async () => {
      await useTagStore.getState().addTag('Nueva', '#22c55e');
    });

    expect(createTag).toHaveBeenCalledWith(9, 'Nueva', '#22c55e');
    expect(useTagStore.getState().tags).toEqual([{ id: 'n', name: 'Nueva', color: '#22c55e' }]);
  });

  test('toggleTagFilter activa, combina y desactiva', () => {
    act(() => {
      useTagStore.getState().toggleTagFilter('a');
      useTagStore.getState().toggleTagFilter('b');
    });
    expect(useTagStore.getState().filterTagIds).toEqual(['a', 'b']);
    act(() => {
      useTagStore.getState().toggleTagFilter('a');
    });
    expect(useTagStore.getState().filterTagIds).toEqual(['b']);
    act(() => {
      useTagStore.getState().clearTagFilter();
    });
    expect(useTagStore.getState().filterTagIds).toEqual([]);
  });
});
