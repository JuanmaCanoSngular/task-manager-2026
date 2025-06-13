import { create, StateCreator } from 'zustand';
import { Board } from '../interfaces/board.interface';
import { boardService } from '../services/board.service';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface BoardStore {
  boards: Board[];
  isLoading: boolean;
  error: string | null;
  fetchBoards: () => Promise<void>;
}

const storeApi: StateCreator<BoardStore, [['zustand/immer', never]]> = (set) => ({
  boards: [],
  isLoading: false,
  error: null,
  fetchBoards: async () => {
    try {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      const boards = await boardService.getBoardList();

      set((state) => {
        state.boards = boards;
        state.isLoading = false;
      });
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Error al cargar los boards';
        state.boards = [];
        state.isLoading = false;
      });
    }
  },
});

export const useBoardStore = create<BoardStore>()(
  devtools(immer(persist(storeApi, { name: 'board-store' })))
);
