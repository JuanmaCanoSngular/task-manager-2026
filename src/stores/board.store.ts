import { create, StateCreator } from 'zustand';
import {
  Board,
  BOARD_COLORS,
  ensureSingleDefault,
  getDefaultBoardId,
} from '../interfaces/board.interface';
import { Task, TaskStatus } from '../interfaces/task.interface';
import { boardService } from '../services/board.service';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';

interface BoardStore {
  currentBoardId: number | null;
  boards: Board[];
  error: string | null;
  fetchBoards: () => Promise<void>;
  fetchBoardDetails: (url: string, id: number) => Promise<void>;
  addNewBoard: (name?: string, color?: string) => Promise<void>;
  updateBoard: (id: number, name: string, color: string) => void;
  setDefaultBoard: (id: number) => void;
  removeBoard: () => void;
  addNewTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (taskId: number, taskData: Omit<Task, 'id'>) => void;
  removeTask: (taskId: number) => void;
  moveTask: (taskId: number, newStatus: TaskStatus, destinationIndex?: number) => void;
  updateTaskOrder: (status: TaskStatus, sourceIndex: number, destinationIndex: number) => void;
}

// Registra en el store el error de una escritura en Supabase (write-through).
// El estado local ya se actualizó de forma optimista; esto solo informa del fallo.
const reportWriteError = (error: unknown) => {
  useBoardStore.setState((state) => {
    if (error instanceof Error && error.message) {
      state.error = error.message;
      return;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      const msg = String((error as { message: unknown }).message);
      if (msg) {
        state.error = msg;
        return;
      }
    }
    state.error = 'Error al guardar en Supabase';
  });
};

// Persiste el orden y estado de todas las tareas del tablero indicado.
const persistBoardOrder = (boardId: number) => {
  const board = useBoardStore.getState().boards.find((b) => b.id === boardId);
  if (!board) return;
  const rows = board.tasks.map((task, index) => ({
    id: task.id,
    status: task.status,
    position: index,
  }));
  boardService.saveTaskOrder(rows).catch(reportWriteError);
};

const defaultsDiffer = (a: Board[], b: Board[]) =>
  a.length !== b.length || a.some((board, i) => board.isDefault !== b[i]?.isDefault);

const storeApi: StateCreator<BoardStore, [['zustand/immer', never]]> = (set) => ({
  currentBoardId: null,
  boards: [],
  error: null,
  fetchBoards: async () => {
    if (useBoardStore.getState().boards.length > 0) {
      return;
    }

    try {
      const boards = await boardService.getBoards();
      const normalized = ensureSingleDefault(boards);
      const defaultId = getDefaultBoardId(normalized);

      set((state) => {
        state.error = null;
        state.boards = normalized;
        state.currentBoardId = defaultId;
      });

      if (defaultsDiffer(boards, normalized) && defaultId !== null) {
        // Segundo plano: no tumbar la home si falla (p. ej. columna is_default ausente).
        boardService.setDefaultBoard(defaultId).catch((err) => {
          console.warn('No se pudo persistir el tablero por defecto:', err);
        });
      }
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Error al cargar los tableros';
        state.boards = [];
        state.currentBoardId = null;
      });
    }
  },
  fetchBoardDetails: async (_url: string, id: number) => {
    set((state) => {
      state.currentBoardId = id;
    });
  },
  addNewBoard: async (name?: string, color?: string) => {
    const isFirst = useBoardStore.getState().boards.length === 0;
    try {
      const board = await boardService.insertBoard({
        name: name || 'Nuevo tablero',
        emoji: '',
        color: color || BOARD_COLORS[0],
        isDefault: isFirst,
      });
      set((state) => {
        state.boards.push(board);
        state.currentBoardId = board.id;
        state.error = null;
      });
    } catch (error) {
      reportWriteError(error);
    }
  },
  updateBoard: (id: number, name: string, color: string) => {
    set((state) => {
      const board = state.boards.find((b) => b.id === id);
      if (board) {
        board.name = name;
        board.color = color;
      }
    });
    boardService.updateBoard(id, { name, color }).catch(reportWriteError);
  },
  setDefaultBoard: (id: number) => {
    const target = useBoardStore.getState().boards.find((b) => b.id === id);
    if (!target || target.isDefault) return;

    set((state) => {
      for (const board of state.boards) {
        board.isDefault = board.id === id;
      }
    });
    boardService.setDefaultBoard(id).catch(reportWriteError);
  },
  removeBoard: () => {
    let removedId: number | null = null;
    let promotedDefaultId: number | null = null;
    set((state) => {
      removedId = state.currentBoardId;
      const wasDefault = state.boards.find((b) => b.id === removedId)?.isDefault ?? false;
      state.boards = state.boards.filter((board) => board.id !== state.currentBoardId);

      if (state.boards.length === 0) {
        state.currentBoardId = null;
        return;
      }

      if (wasDefault || state.boards.length === 1 || !state.boards.some((b) => b.isDefault)) {
        state.boards.forEach((b, i) => {
          b.isDefault = i === 0;
        });
        promotedDefaultId = state.boards[0].id;
      }

      state.currentBoardId = getDefaultBoardId(state.boards);
    });
    if (removedId !== null) {
      boardService.deleteBoard(removedId).catch(reportWriteError);
    }
    if (promotedDefaultId !== null) {
      boardService.setDefaultBoard(promotedDefaultId).catch(reportWriteError);
    }
  },
  addNewTask: async (taskData: Omit<Task, 'id'>) => {
    const boardId = useBoardStore.getState().currentBoardId;
    if (boardId === null) return;

    const board = useBoardStore.getState().boards.find((b) => b.id === boardId);
    if (!board) return;

    try {
      const task = await boardService.insertTask(boardId, taskData, board.tasks.length);
      set((state) => {
        const boardIndex = state.boards.findIndex((b) => b.id === boardId);
        if (boardIndex !== -1) {
          state.boards[boardIndex].tasks.push(task);
        }
        state.error = null;
      });
    } catch (error) {
      reportWriteError(error);
    }
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
    boardService.updateTask(taskId, taskData).catch(reportWriteError);
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
    boardService.deleteTask(taskId).catch(reportWriteError);
  },
  moveTask: (taskId, newStatus, destinationIndex) => {
    let affectedBoardId: number | null = null;
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
        affectedBoardId = state.boards[boardIndex].id;
      }
    });
    if (affectedBoardId !== null) {
      persistBoardOrder(affectedBoardId);
    }
  },
  updateTaskOrder: (status, sourceIndex, destinationIndex) => {
    let affectedBoardId: number | null = null;
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
      affectedBoardId = state.boards[boardIndex].id;
    });
    if (affectedBoardId !== null) {
      persistBoardOrder(affectedBoardId);
    }
  },
});

export const useBoardStore = create<BoardStore>()(
  immer(
    devtools(storeApi, {
      name: 'board-store',
    })
  )
);

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
