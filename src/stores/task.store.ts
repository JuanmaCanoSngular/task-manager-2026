import { create, StateCreator } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { boardService } from '../services/board.service';
import { Task } from '../interfaces/task.interface';

interface TaskStore {
  currentBoardId: number | null;
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchBoardDetails: (url: string) => Promise<void>;
}

const storeApi: StateCreator<TaskStore, [['zustand/immer', never]]> = (set) => ({
  currentBoardId: null,
  tasks: [],
  isLoading: false,
  error: null,
  fetchBoardDetails: async (url: string) => {
    set((state) => {
      state.isLoading = true;
    });

    try {
      const board = await boardService.getBoardDetails(url);

      set((state) => {
        state.currentBoardId = board.id;
        state.tasks = board.tasks || [];
        state.isLoading = false;
      });
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Error desconocido';
        state.tasks = [];
        state.isLoading = false;
      });
    }
  },
});

export const useTaskStore = create<TaskStore>()(
  devtools(
    immer(
      persist(storeApi, {
        name: 'task-store',
      })
    )
  )
);
