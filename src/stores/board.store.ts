import { create, StateCreator } from 'zustand';
import { Board, BOARD_COLORS } from '../interfaces/board.interface';
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
  addNewBoard: (name?: string, color?: string) => void;
  updateBoard: (id: number, name: string, color: string) => void;
  removeBoard: () => void;
  addNewTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (taskId: number, taskData: Omit<Task, 'id'>) => void;
  removeTask: (taskId: number) => void;
  moveTask: (taskId: number, newStatus: TaskStatus, destinationIndex?: number) => void;
  updateTaskOrder: (status: TaskStatus, sourceIndex: number, destinationIndex: number) => void;
}

// Registra en el store el error de una escritura en Supabase (write-through).
// El estado local ya se actualizó de forma optimista; esto solo informa del fallo.
const reportWriteError = (error: unknown) => {
  useBoardStore.setState((state) => {
    state.error = error instanceof Error ? error.message : 'Error al guardar en Supabase';
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

// methods that change the state
// to access the data of the store, use the reactive selectors
const storeApi: StateCreator<BoardStore, [['zustand/immer', never]]> = (set) => ({
  currentBoardId: null,
  boards: [],
  error: null,
  fetchBoards: async () => {
    // Evita recargar si los tableros ya están en memoria.
    if (useBoardStore.getState().boards.length > 0) {
      return;
    }

    try {
      const boards = await boardService.getBoards();
      set((state) => {
        state.error = null;
        state.boards = boards;
      });
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Error al cargar los tableros';
        state.boards = [];
      });
    }
  },
  // Los datos ya se cargan completos en fetchBoards; aquí solo se selecciona el tablero.
  fetchBoardDetails: async (_url: string, id: number) => {
    set((state) => {
      state.currentBoardId = id;
    });
  },
  addNewBoard: (name?: string, color?: string) => {
    let created: Board | null = null;
    set((state) => {
      const board: Board = {
        id: getNextBoardId(state.boards),
        name: name || 'Nuevo tablero',
        emoji: '',
        color: color || BOARD_COLORS[0],
        link: '',
        tasks: [],
      };
      state.boards.push(board);
      state.currentBoardId = board.id;
      created = board;
    });
    if (created) {
      boardService.insertBoard(created).catch(reportWriteError);
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
  removeBoard: () => {
    let removedId: number | null = null;
    set((state) => {
      removedId = state.currentBoardId;
      state.boards = state.boards.filter((board) => board.id !== state.currentBoardId);
      state.currentBoardId = null;
    });
    if (removedId !== null) {
      boardService.deleteBoard(removedId).catch(reportWriteError);
    }
  },
  addNewTask: (taskData: Omit<Task, 'id'>) => {
    let inserted: { boardId: number; task: Task; position: number } | null = null;
    set((state) => {
      if (state.currentBoardId === null) return;

      const newTask: Task = {
        id: getNextTaskId(),
        ...taskData,
      };

      const boardIndex = state.boards.findIndex((board) => board.id === state.currentBoardId);
      if (boardIndex !== -1) {
        state.boards[boardIndex].tasks.push(newTask);
        inserted = {
          boardId: state.currentBoardId,
          task: newTask,
          position: state.boards[boardIndex].tasks.length - 1,
        };
      }
    });
    if (inserted) {
      const { boardId, task, position } = inserted;
      boardService.insertTask(boardId, task, position).catch(reportWriteError);
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

// Devuelve un id de tarea único a nivel global (la tabla `tasks` usa PK global).
const getNextTaskId = (): number => {
  const boards = useBoardStore.getState().boards;
  const allTaskIds = boards.flatMap((board) => board.tasks.map((task) => task.id));
  return allTaskIds.length > 0 ? Math.max(...allTaskIds) + 1 : 1;
};

const getNextBoardId = (boards: Board[]): number => {
  const allBoardIds = boards.map((board) => board.id);
  return allBoardIds.length > 0 ? Math.max(...allBoardIds) + 1 : 1;
};
