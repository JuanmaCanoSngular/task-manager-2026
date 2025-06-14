import { create, StateCreator } from 'zustand';
import { Board } from '../interfaces/board.interface';
import { boardService } from '../services/board.service';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Task } from '../interfaces/task.interface';

interface BoardStore {
  currentBoardId: number | null;
  boards: Board[];
  currentBoardTasks: Task[];
  error: string | null;
  fetchBoards: () => Promise<void>;
  fetchBoardDetails: (url: string) => Promise<void>;
}

const storeApi: StateCreator<BoardStore, [['zustand/immer', never]]> = (set) => ({
  currentBoardId: null,
  boards: [],
  currentBoardTasks: [],
  error: null,
  fetchBoards: async () => {
    try {
      set((state) => {
        state.error = null;
      });

      const boards = await boardService.getBoardList();

      set((state) => {
        state.boards = boards;
      });
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Error al cargar los boards';
        state.boards = [];
      });
    }
  },
  fetchBoardDetails: async (url: string) => {
    const existingBoard = useBoardStore.getState().boards.find((board) => board.link === url);

    // avoid calling the api if the board is already in the store
    if (existingBoard?.tasks?.length) {
      set((state) => {
        state.currentBoardId = existingBoard.id;
        state.currentBoardTasks = existingBoard.tasks ?? [];
      });
      return;
    }

    try {
      const board = await boardService.getBoardDetails(url);

      set((state) => {
        state.currentBoardId = board.id;
        state.currentBoardTasks = board.tasks ?? [];
        state.boards = state.boards.map((boardItem) => {
          if (boardItem.id === board.id) {
            return { ...boardItem, tasks: board.tasks };
          }
          return boardItem;
        });
      });
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Error desconocido';
        state.currentBoardTasks = [];
        state.boards = state.boards.map((board) => {
          if (board.id === state.currentBoardId) {
            return { ...board, tasks: [] };
          }
          return board;
        });
      });
    }
  },
});

export const useBoardStore = create<BoardStore>()(
  immer(
    devtools(
      persist(storeApi, {
        name: 'board-store',
      }),
      {
        name: 'board-store',
      }
    )
  )
);
