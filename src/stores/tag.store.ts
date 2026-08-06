import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Tag } from '../interfaces/tag.interface';
import { tagService } from '../services/tag.service';
import { useBoardStore } from './board.store';

interface TagStore {
  tags: Tag[];
  loaded: boolean;
  error: string | null;
  fetchTags: () => Promise<void>;
  addTag: (name: string, color: string) => Promise<Tag | null>;
  updateTag: (id: string, patch: { name?: string; color?: string }) => Promise<void>;
  removeTag: (id: string) => Promise<void>;
}

export const useTagStore = create<TagStore>()(
  immer((set, get) => ({
    tags: [],
    loaded: false,
    error: null,

    fetchTags: async () => {
      try {
        const tags = await tagService.ensureDefaults();
        set((s) => {
          s.tags = tags;
          s.loaded = true;
          s.error = null;
        });
      } catch (error) {
        set((s) => {
          s.error = error instanceof Error ? error.message : 'Error al cargar etiquetas';
          s.loaded = true;
        });
      }
    },

    addTag: async (name, color) => {
      try {
        const tag = await tagService.createTag(name, color);
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
      set((s) => {
        s.tags = s.tags.filter((t) => t.id !== id);
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
          s.error = error instanceof Error ? error.message : 'No se pudo eliminar';
        });
      }
    },
  }))
);
