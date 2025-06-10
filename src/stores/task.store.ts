import { create } from 'zustand';
import { Board } from '../interfaces/board.interface';
import { boardService } from '../services/board.service';
import { Task } from '../interfaces/task.interface';
import { devtools, persist } from 'zustand/middleware';
import { StateCreator } from 'zustand';

interface TaskStore {
    currentBoard: Board | null;
    isLoading: boolean;
    error: string | null;
    tasks: Task[];
    fetchBoardDetails: (url: string) => Promise<void>;
    setCurrentBoard: (board: Board | null) => void;
}

const storeApi: StateCreator<TaskStore> = (set) => ({
    currentBoard: null,
    isLoading: false,
    error: null,
    tasks: [],
    fetchBoardDetails: async (url: string) => {
        set({ isLoading: true, error: null });
        try {
            const board = await boardService.getBoardDetails(url);
            console.log(board);
            set({ currentBoard: board, isLoading: false, tasks: board.tasks });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Error desconocido',
                isLoading: false,
            });
        }
    },
    setCurrentBoard: (board) => set({ currentBoard: board }),
});

export const useTaskStore = create<TaskStore>()(
    persist(devtools(storeApi), { name: 'task-store' })
);
