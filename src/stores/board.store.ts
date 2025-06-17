import { create, StateCreator } from 'zustand';
import { Board } from '../interfaces/board.interface';
import { Task } from '../interfaces/task.interface';
import { boardService } from '../services/board.service';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';

interface BoardStore {
  currentBoardId: number | null;
  boards: Board[];
  error: string | null;
  fetchBoards: () => Promise<void>;
  fetchBoardDetails: (url: string, id: number) => Promise<void>;
  addNewBoard: (name?: string, emoji?: string, color?: string) => void;
  removeBoard: () => void;
  addNewTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (taskId: number, taskData: Omit<Task, 'id'>) => void;
  removeTask: (taskId: number) => void;
}

// datos de la store
// métodos que cambiar en state
// para acceder a los datos de la store se usan los selectores reactivos
const storeApi: StateCreator<BoardStore, [['zustand/immer', never]]> = (set) => ({
  currentBoardId: null,
  boards: [],
  error: null,
  fetchBoards: async () => {
    // avoid calling the api if the boards are already in the store
    const existingBoards = useBoardStore.getState().boards;

    if (existingBoards.length > 0) {
      return;
    }

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
  fetchBoardDetails: async (url: string, id: number) => {
    const existingBoard = useBoardStore.getState().boards.find((board) => board.id === id);

    // avoid calling the api if the board is already in the store
    if (existingBoard?.tasks?.length || existingBoard?.isLocal) {
      set((state) => {
        state.currentBoardId = existingBoard.id;
      });
      return;
    }

    try {
      const board = await boardService.getBoardDetails(url);

      set((state) => {
        state.currentBoardId = board.id;
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
        state.boards = state.boards.map((board) => {
          if (board.id === state.currentBoardId) {
            return { ...board, tasks: [] };
          }
          return board;
        });
      });
    }
  },
  addNewBoard: (name?: string, emoji?: string, color?: string) => {
    const board: Board = {
      id: useBoardStore.getState().boards.length + 1,
      name: name || 'Default Board',
      emoji: emoji || '',
      color: color || '',
      link: '',
      tasks: [],
      isLocal: true,
    };

    set((state) => {
      state.boards.push(board);
      state.currentBoardId = board.id;
    });
  },
  removeBoard: () => {
    set((state) => {
      state.boards = state.boards.filter((board) => board.id !== state.currentBoardId);
      state.currentBoardId = null;
    });
  },
  addNewTask: (taskData: Omit<Task, 'id'>) => {
    set((state) => {
      if (state.currentBoardId === null) return;

      const currentBoard = state.boards.find((board) => board.id === state.currentBoardId);
      const newTask: Task = {
        id: (currentBoard?.tasks.length ?? 0) + 1,
        ...taskData,
      };

      const boardIndex = state.boards.findIndex((board) => board.id === state.currentBoardId);
      if (boardIndex !== -1) {
        state.boards[boardIndex].tasks.push(newTask);
      }
    });
  },
  updateTask: (taskId, taskData) => {
    set((state) => {
      const boardIndex = state.boards.findIndex((board) => board.id === state.currentBoardId);
      if (boardIndex === -1) return;

      const taskIndex = state.boards[boardIndex].tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        state.boards[boardIndex].tasks[taskIndex] = {
          ...state.boards[boardIndex].tasks[taskIndex],
          ...taskData,
        };
      }
    });
  },
  removeTask: (taskId) => {
    set((state) => {
      const boardIndex = state.boards.findIndex((board) => board.id === state.currentBoardId);
      if (boardIndex !== -1) {
        state.boards[boardIndex].tasks = state.boards[boardIndex].tasks.filter(
          (task) => task.id !== taskId
        );
      }
    });
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

// Selectores reactivos para acceder a los datos de la store
export const useCurrentBoardTasks = () => {
  return useBoardStore(
    useShallow((state: BoardStore) => {
      if (state.currentBoardId === null) return [];
      return state.boards.find((board: Board) => board.id === state.currentBoardId)?.tasks ?? [];
    })
  );
};

export const useCurrentBoard = () => {
  return useBoardStore(
    useShallow((state: BoardStore) => {
      if (state.currentBoardId === null) return null;
      return state.boards.find((board: Board) => board.id === state.currentBoardId) ?? null;
    })
  );
};

export const useTasksByStatus = (status: string) => {
  return useBoardStore(
    useShallow((state: BoardStore) => {
      if (state.currentBoardId === null) return [];
      const currentBoard = state.boards.find((board: Board) => board.id === state.currentBoardId);
      return currentBoard?.tasks.filter((task) => task.status === status) ?? [];
    })
  );
};
