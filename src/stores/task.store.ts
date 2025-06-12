import { create, StateCreator } from 'zustand';
import { boardService } from '../services/board.service';
import { devtools } from 'zustand/middleware';
import { useBoardStore } from './board.store';
import { Task } from '../interfaces/task.interface';

interface TaskStore {
  currentBoard: CurrentBoard | null;
  isLoading: boolean;
  error: string | null;
  fetchBoardDetails: (url: string) => Promise<void>;
  setCurrentBoard: (board: CurrentBoard | null) => void;
  getCurrentBoardInfo: () => {
    id: number;
    name: string;
    emoji: string;
    color: string;
    link: string;
  } | null;
}

type CurrentBoard = {
  id: number;
  tasks: Task[];
};

const storeApi: StateCreator<TaskStore> = (set, get) => ({
  currentBoard: null,
  isLoading: false,
  error: null,
  fetchBoardDetails: async (url: string) => {
    set({ isLoading: true, error: null });
    try {
      const board = await boardService.getBoardDetails(url);
      set({ currentBoard: { id: board.id, tasks: board.tasks || [] }, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false,
      });
    }
  },
  setCurrentBoard: (board) => set({ currentBoard: board }),
  getCurrentBoardInfo: () => {
    const currentBoard = get().currentBoard;
    if (!currentBoard) return null;
    const boards = useBoardStore.getState().boards;
    const board = boards.find((b) => b.id === currentBoard.id);
    if (!board) return null;
    const { id, name, emoji, color, link } = board;
    return { id, name, emoji, color, link };
  },
});

export const useTaskStore = create<TaskStore>()(devtools(storeApi));
