import { create, StateCreator } from 'zustand';
import { Board } from '../interfaces/board.interface';
import { Task, TaskStatus } from '../interfaces/task.interface';
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
  moveTask: (taskId: number, newStatus: TaskStatus, destinationIndex?: number) => void;
  updateTaskOrder: (status: TaskStatus, sourceIndex: number, destinationIndex: number) => void;
}

// methods that change the state
// to access the data of the store, use the reactive selectors
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
    set((state) => {
      const board: Board = {
        id: getNextBoardId(state.boards),
        name: name || 'Default Board',
        emoji: emoji || '',
        color: color || '',
        link: '',
        tasks: [],
        isLocal: true,
      };
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

      const newTask: Task = {
        id: getNextTaskId(state.currentBoardId),
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
  moveTask: (taskId, newStatus, destinationIndex) => {
    set((state) => {
      const boardIndex = state.boards.findIndex((board) => board.id === state.currentBoardId);
      if (boardIndex === -1) return;

      const taskIndex = state.boards[boardIndex].tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        const task = state.boards[boardIndex].tasks[taskIndex];
        task.status = newStatus as TaskStatus;

        if (destinationIndex !== undefined) {
          state.boards[boardIndex].tasks.splice(taskIndex, 1);

          const actualDestinationIndex =
            state.boards[boardIndex].tasks.findIndex((t) => t.status === newStatus) +
            destinationIndex;

          state.boards[boardIndex].tasks.splice(actualDestinationIndex, 0, task);
        }
      }
    });
  },
  updateTaskOrder: (status, sourceIndex, destinationIndex) => {
    set((state) => {
      const boardIndex = state.boards.findIndex((board) => board.id === state.currentBoardId);
      if (boardIndex === -1) return;

      const tasksInStatus = state.boards[boardIndex].tasks.filter((task) => task.status === status);

      if (sourceIndex >= tasksInStatus.length || destinationIndex >= tasksInStatus.length) return;

      const taskToMove = tasksInStatus[sourceIndex];

      const realSourceIndex = state.boards[boardIndex].tasks.findIndex(
        (task) => task.id === taskToMove.id
      );

      state.boards[boardIndex].tasks.splice(realSourceIndex, 1);

      const realDestinationIndex =
        state.boards[boardIndex].tasks.findIndex((task) => task.status === status) +
        destinationIndex;

      state.boards[boardIndex].tasks.splice(realDestinationIndex, 0, taskToMove);
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

// function to get the next available task id
const getNextTaskId = (id: number): number => {
  const board = useBoardStore.getState().boards.find((board) => board.id === id);
  const allTaskIds = board?.tasks.map((task) => task.id) ?? [];
  return allTaskIds.length > 0 ? Math.max(...allTaskIds) + 1 : 1;
};

const getNextBoardId = (boards: Board[]): number => {
  const allBoardIds = boards.map((board) => board.id);
  return allBoardIds.length > 0 ? Math.max(...allBoardIds) + 1 : 1;
};
