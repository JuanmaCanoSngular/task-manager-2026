import { create, StateCreator } from 'zustand';
import {
  Board,
  BOARD_COLORS,
  ensureSingleDefault,
  getDefaultBoardId,
} from '../interfaces/board.interface';
import { Task, TaskDraft, TaskStatus } from '../interfaces/task.interface';
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
  addNewTask: (task: TaskDraft) => Promise<void>;
  updateTask: (taskId: number, taskData: TaskDraft) => void;
  removeTask: (taskId: number) => void;
  moveTask: (taskId: number, newStatus: TaskStatus, destinationIndex?: number) => void;
  updateTaskOrder: (status: TaskStatus, sourceIndex: number, destinationIndex: number) => void;
  /** Sync desde Realtime (Telegram / otras pestañas). No escribe en DB. */
  applyRemoteTaskInsert: (boardId: number, task: Task) => void;
  applyRemoteTaskUpdate: (boardId: number, task: Task) => void;
  applyRemoteTaskDelete: (taskId: number) => void;
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

/** Inserta la tarea al inicio de su columna (status), sin tocar el orden manual previo del resto. */
const insertAtTopOfStatus = (tasks: Task[], task: Task) => {
  const firstOfStatus = tasks.findIndex((t) => t.status === task.status);
  if (firstOfStatus === -1) {
    tasks.push(task);
    return;
  }
  tasks.splice(firstOfStatus, 0, task);
};

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
  addNewTask: async (taskData) => {
    const boardId = useBoardStore.getState().currentBoardId;
    if (boardId === null) return;

    const board = useBoardStore.getState().boards.find((b) => b.id === boardId);
    if (!board) return;

    try {
      // position provisional; tras colocar arriba se re-persiste el orden.
      const task = await boardService.insertTask(boardId, taskData, 0);
      set((state) => {
        const boardIndex = state.boards.findIndex((b) => b.id === boardId);
        if (boardIndex !== -1) {
          insertAtTopOfStatus(state.boards[boardIndex].tasks, task);
        }
        state.error = null;
      });
      persistBoardOrder(boardId);
    } catch (error) {
      reportWriteError(error);
    }
  },
  updateTask: (taskId, taskData) => {
    let affectedBoardId: number | null = null;
    set((state) => {
      const boardIndex = state.boards.findIndex((board) => board.id === state.currentBoardId);
      if (boardIndex === -1) return;

      const taskIndex = state.boards[boardIndex].tasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) return;

      const prev = state.boards[boardIndex].tasks[taskIndex];
      const statusChanged = prev.status !== taskData.status;
      const next: Task = {
        ...prev,
        title: taskData.title,
        status: taskData.status,
        tags: taskData.tags,
        background: taskData.background,
      };

      if (statusChanged) {
        state.boards[boardIndex].tasks.splice(taskIndex, 1);
        insertAtTopOfStatus(state.boards[boardIndex].tasks, next);
        affectedBoardId = state.boards[boardIndex].id;
      } else {
        state.boards[boardIndex].tasks[taskIndex] = next;
      }
    });
    boardService.updateTask(taskId, taskData).catch(reportWriteError);
    if (affectedBoardId !== null) {
      persistBoardOrder(affectedBoardId);
    }
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
  applyRemoteTaskInsert: (boardId, task) => {
    set((state) => {
      const board = state.boards.find((b) => b.id === boardId);
      if (!board) return;
      if (board.tasks.some((t) => t.id === task.id)) return;
      insertAtTopOfStatus(board.tasks, task);
    });
  },
  applyRemoteTaskUpdate: (boardId, task) => {
    set((state) => {
      let fromBoard: (typeof state.boards)[number] | null = null;
      let fromIndex = -1;
      for (const board of state.boards) {
        const idx = board.tasks.findIndex((t) => t.id === task.id);
        if (idx !== -1) {
          fromBoard = board;
          fromIndex = idx;
          break;
        }
      }

      if (fromBoard && fromBoard.id === boardId && fromIndex !== -1) {
        const prevStatus = fromBoard.tasks[fromIndex].status;
        // Mismo tablero: actualiza campos. Si cambia de columna, va arriba de la nueva.
        if (prevStatus === task.status) {
          fromBoard.tasks[fromIndex] = task;
          return;
        }
        fromBoard.tasks.splice(fromIndex, 1);
        insertAtTopOfStatus(fromBoard.tasks, task);
        return;
      }

      if (fromBoard && fromIndex !== -1) {
        fromBoard.tasks.splice(fromIndex, 1);
      }
      const board = state.boards.find((b) => b.id === boardId);
      if (board) insertAtTopOfStatus(board.tasks, task);
    });
  },
  applyRemoteTaskDelete: (taskId) => {
    set((state) => {
      for (const board of state.boards) {
        board.tasks = board.tasks.filter((t) => t.id !== taskId);
      }
    });
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
