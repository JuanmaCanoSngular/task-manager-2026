import { create, StateCreator } from 'zustand';
import { Board } from '../interfaces/board.interface';
import { boardService } from '../services/board.service';
import { persist } from 'zustand/middleware';

interface BoardStore {
  boards: Board[];
  isLoading: boolean;
  error: string | null;
  fetchBoards: () => Promise<void>;
  setBoards: (boards: Board[]) => void;
}

const storeApi: StateCreator<BoardStore> = (set) => ({
  boards: [],
  isLoading: false,
  error: null,
  fetchBoards: async () => {
    try {
      set({ isLoading: true, error: null });
      const boards = await boardService.getBoardList();
      set({ boards, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al cargar los boards',
        isLoading: false,
      });
    }
  },
  setBoards: (boards) => set({ boards }),
});

export const useBoardStore = create<BoardStore>()(persist(storeApi, { name: 'board-store' }));
