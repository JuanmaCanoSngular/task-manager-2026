import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Tag } from '../interfaces/tag.interface';
import { tagService } from '../services/tag.service';
import { useBoardStore } from './board.store';

interface TagStore {
  tags: Tag[];
  boardId: number | null;
  loaded: boolean;
  error: string | null;
  filterTagIds: string[];
  fetchTags: (boardId: number) => Promise<void>;
  addTag: (name: string, color: string) => Promise<Tag | null>;
  updateTag: (id: string, patch: { name?: string; color?: string }) => Promise<void>;
  removeTag: (id: string) => Promise<void>;
  toggleTagFilter: (id: string) => void;
  clearTagFilter: () => void;
}

export const useTagStore = create<TagStore>()(
  immer((set, get) => ({
    tags: [],
    boardId: null,
    loaded: false,
    error: null,
    filterTagIds: [],

    fetchTags: async (boardId) => {
      if (get().boardId === boardId && get().loaded && !get().error) return;
      set((s) => {
        if (s.boardId !== boardId) {
          s.tags = [];
          s.filterTagIds = [];
        }
        s.boardId = boardId;
        s.loaded = false;
        s.error = null;
      });
      try {
        const tags = await tagService.ensureDefaults(boardId);
        if (get().boardId !== boardId) return;
        set((s) => {
          s.tags = tags;
          s.loaded = true;
          s.error = null;
        });
      } catch (error) {
        if (get().boardId !== boardId) return;
        set((s) => {
          s.error = error instanceof Error ? error.message : 'Error al cargar etiquetas';
          s.loaded = true;
        });
      }
    },

    addTag: async (name, color) => {
      const boardId = get().boardId ?? useBoardStore.getState().currentBoardId;
      if (boardId == null) return null;
      try {
        const tag = await tagService.createTag(boardId, name, color);
        set((s) => {
          s.tags.push(tag);
          s.error = null;
        });
        return tag;
      } catch (error) {
        set((s) => {
          s.error = error instanceof Error ? error.message : 'No se pudo crear la etiqueta';
        });
        return null;
      }
    },

    updateTag: async (id, patch) => {
      const prev = get().tags;
      set((s) => {
        const t = s.tags.find((x) => x.id === id);
        if (!t) return;
        if (patch.name !== undefined) t.name = patch.name;
        if (patch.color !== undefined) t.color = patch.color;
      });
      try {
        await tagService.updateTag(id, patch);
      } catch (error) {
        set((s) => {
          s.tags = prev;
          s.error = error instanceof Error ? error.message : 'No se pudo actualizar';
        });
      }
    },

    removeTag: async (id) => {
      const prev = get().tags;
      const prevFilter = get().filterTagIds;
      set((s) => {
        s.tags = s.tags.filter((t) => t.id !== id);
        s.filterTagIds = s.filterTagIds.filter((fid) => fid !== id);
      });
      try {
        await tagService.deleteTag(id);
        useBoardStore.setState((state) => {
          for (const board of state.boards) {
            for (const task of board.tasks) {
              task.tags = task.tags.filter((t) => t !== id);
            }
          }
        });
      } catch (error) {
        set((s) => {
          s.tags = prev;
          s.filterTagIds = prevFilter;
          s.error = error instanceof Error ? error.message : 'No se pudo eliminar';
        });
      }
    },

    toggleTagFilter: (id) => {
      set((s) => {
        if (s.filterTagIds.includes(id)) {
          s.filterTagIds = s.filterTagIds.filter((fid) => fid !== id);
        } else {
          s.filterTagIds.push(id);
        }
      });
    },

    clearTagFilter: () => {
      set((s) => {
        s.filterTagIds = [];
      });
    },
  }))
);
