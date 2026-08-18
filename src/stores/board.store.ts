import { create, StateCreator } from 'zustand';
import {
  Board,
  BOARD_COLORS,
  ensureSingleDefault,
  getDefaultBoardId,
} from '../interfaces/board.interface';
import { BoardColumn, BoardColumnDraft } from '../interfaces/column.interface';
import { Task, TaskDraft } from '../interfaces/task.interface';
import { boardService } from '../services/board.service';
import { columnService } from '../services/column.service';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';

interface BoardStore {
  currentBoardId: number | null;
  boards: Board[];
  loading: boolean;
  error: string | null;
  fetchBoards: () => Promise<void>;
  fetchBoardDetails: (url: string, id: number) => Promise<void>;
  addNewBoard: (name?: string, color?: string) => Promise<void>;
  updateBoard: (id: number, name: string, color: string) => void;
  setDefaultBoard: (id: number) => void;
  removeBoard: () => void;
  addNewTask: (task: TaskDraft) => Promise<void>;
  updateTask: (taskId: number, taskData: TaskDraft) => void;
  toggleTaskPinned: (taskId: number) => void;
  removeTask: (taskId: number) => void;
  moveTask: (taskId: number, newColumnId: number, destinationIndex?: number) => void;
  updateTaskOrder: (columnId: number, sourceIndex: number, destinationIndex: number) => void;
  addColumn: (boardId: number, draft: BoardColumnDraft) => Promise<BoardColumn | null>;
  updateColumn: (boardId: number, columnId: number, patch: Partial<BoardColumnDraft>) => void;
  removeColumn: (
    boardId: number,
    columnId: number,
    options?: { moveTasksToColumnId?: number }
  ) => void;
  reorderColumns: (boardId: number, sourceIndex: number, destinationIndex: number) => void;
  applyRemoteTaskInsert: (boardId: number, task: Task) => void;
  applyRemoteTaskUpdate: (boardId: number, task: Task) => void;
  applyRemoteTaskDelete: (taskId: number) => void;
  setTaskCommentSummary: (taskId: number, count: number, latestPreview?: string) => void;
}

const reportWriteError = (error: unknown) => {
  const message = (() => {
    if (error instanceof Error && error.message) return error.message;
    if (error && typeof error === 'object' && 'message' in error) {
      const msg = String((error as { message: unknown }).message);
      if (msg) return msg;
    }
    return 'Error al guardar en Supabase';
  })();

  // setState plano: evita tocar drafts de Immer fuera de un producer.
  useBoardStore.setState({ error: message });
};

const persistBoardOrder = (boardId: number) => {
  const board = useBoardStore.getState().boards.find((b) => b.id === boardId);
  if (!board) return;
  const rows = board.tasks.map((task, index) => ({
    id: task.id,
    columnId: task.columnId,
    position: index,
  }));
  boardService.saveTaskOrder(rows).catch(reportWriteError);
};

const defaultsDiffer = (a: Board[], b: Board[]) =>
  a.length !== b.length || a.some((board, i) => board.isDefault !== b[i]?.isDefault);

const insertAtTopOfColumn = (tasks: Task[], task: Task) => {
  const indices: number[] = [];
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].columnId === task.columnId) indices.push(i);
  }
  if (indices.length === 0) {
    tasks.push(task);
    return;
  }
  if (task.pinned) {
    tasks.splice(indices[0], 0, task);
    return;
  }
  // Tras la última anclada (o al inicio de la columna si no hay ancladas).
  let insertAt = indices[0];
  for (const i of indices) {
    if (tasks[i].pinned) insertAt = i + 1;
    else break;
  }
  tasks.splice(insertAt, 0, task);
};

/** Dentro de cada columna: ancladas primero, sin mezclar slots de otras columnas. */
const normalizePinnedOrder = (tasks: Task[]) => {
  const columnIds = [...new Set(tasks.map((t) => t.columnId))];
  for (const columnId of columnIds) {
    const idxs: number[] = [];
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].columnId === columnId) idxs.push(i);
    }
    if (idxs.length <= 1) continue;
    const items = idxs.map((i) => tasks[i]);
    const sorted = [...items.filter((t) => t.pinned), ...items.filter((t) => !t.pinned)];
    idxs.forEach((idx, j) => {
      tasks[idx] = sorted[j];
    });
  }
};

/** Índice de destino válido: ancladas solo entre ancladas; el resto, debajo. */
const clampColumnDestination = (
  tasksInColumn: Task[],
  sourceIndex: number,
  destinationIndex: number
): number => {
  const moving = tasksInColumn[sourceIndex];
  if (!moving) return destinationIndex;
  const pinnedCount = tasksInColumn.filter((task) => task.pinned).length;
  if (moving.pinned) {
    return Math.min(destinationIndex, Math.max(0, pinnedCount - 1));
  }
  return Math.max(destinationIndex, pinnedCount);
};

/** Copia plana: no escapar proxies de Immer fuera del `set()`. */
const plainColumns = (columns: BoardColumn[]): BoardColumn[] =>
  columns.map((c) => ({
    id: c.id,
    boardId: c.boardId,
    name: c.name,
    color: c.color,
    position: c.position,
    slug: c.slug,
    isInbox: c.isInbox,
  }));

const storeApi: StateCreator<BoardStore, [['zustand/immer', never]]> = (set) => ({
  currentBoardId: null,
  boards: [],
  loading: false,
  error: null,
  fetchBoards: async () => {
    if (useBoardStore.getState().boards.length > 0) {
      return;
    }

    set((state) => {
      state.loading = true;
    });

    try {
      const boards = await boardService.getBoards();
      const normalized = ensureSingleDefault(boards);
      const defaultId = getDefaultBoardId(normalized);

      set((state) => {
        state.error = null;
        state.boards = normalized;
        state.currentBoardId = defaultId;
        state.loading = false;
      });

      if (defaultsDiffer(boards, normalized) && defaultId !== null) {
        boardService.setDefaultBoard(defaultId).catch((err) => {
          console.warn('No se pudo persistir el tablero por defecto:', err);
        });
      }
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Error al cargar los tableros';
        state.boards = [];
        state.currentBoardId = null;
        state.loading = false;
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
      const task = await boardService.insertTask(boardId, taskData, 0, board.columns);
      set((state) => {
        const boardIndex = state.boards.findIndex((b) => b.id === boardId);
        if (boardIndex !== -1) {
          insertAtTopOfColumn(state.boards[boardIndex].tasks, task);
        }
        state.error = null;
      });
      persistBoardOrder(boardId);
    } catch (error) {
      reportWriteError(error);
    }
  },
  updateTask: (taskId, taskData) => {
    const currentBoardId = useBoardStore.getState().currentBoardId;
    const board = useBoardStore.getState().boards.find((b) => b.id === currentBoardId);
    if (!board) return;

    const columns = plainColumns(board.columns);
    let affectedBoardId: number | null = null;

    set((state) => {
      const boardIndex = state.boards.findIndex((b) => b.id === state.currentBoardId);
      if (boardIndex === -1) return;

      const taskIndex = state.boards[boardIndex].tasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) return;

      const prev = state.boards[boardIndex].tasks[taskIndex];
      const columnChanged = prev.columnId !== taskData.columnId;
      const next: Task = {
        id: prev.id,
        title: (taskData.title ?? '').trim() || prev.title,
        columnId: taskData.columnId,
        tags: [...taskData.tags],
        ...(prev.pinned ? { pinned: true } : {}),
        ...(prev.createdAt ? { createdAt: prev.createdAt } : {}),
        ...(prev.commentCount ? { commentCount: prev.commentCount } : {}),
        ...(prev.latestCommentPreview
          ? { latestCommentPreview: prev.latestCommentPreview }
          : {}),
      };

      if (columnChanged) {
        state.boards[boardIndex].tasks.splice(taskIndex, 1);
        insertAtTopOfColumn(state.boards[boardIndex].tasks, next);
        normalizePinnedOrder(state.boards[boardIndex].tasks);
        affectedBoardId = state.boards[boardIndex].id;
      } else {
        state.boards[boardIndex].tasks[taskIndex] = next;
      }
    });

    boardService.updateTask(taskId, taskData, columns).catch(reportWriteError);
    if (affectedBoardId !== null) {
      persistBoardOrder(affectedBoardId);
    }
  },
  toggleTaskPinned: (taskId) => {
    let affectedBoardId: number | null = null;
    let nextPinned = false;

    set((state) => {
      const boardIndex = state.boards.findIndex((b) => b.id === state.currentBoardId);
      if (boardIndex === -1) return;

      const taskIndex = state.boards[boardIndex].tasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) return;

      const prev = state.boards[boardIndex].tasks[taskIndex];
      nextPinned = !prev.pinned;
      const next: Task = nextPinned
        ? { ...prev, pinned: true }
        : (() => {
            const { pinned: _p, ...rest } = prev;
            return rest;
          })();

      state.boards[boardIndex].tasks.splice(taskIndex, 1);
      insertAtTopOfColumn(state.boards[boardIndex].tasks, next);
      normalizePinnedOrder(state.boards[boardIndex].tasks);
      affectedBoardId = state.boards[boardIndex].id;
    });

    if (affectedBoardId === null) return;
    boardService.setTaskPinned(taskId, nextPinned).catch(reportWriteError);
    persistBoardOrder(affectedBoardId);
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
  addColumn: async (boardId, draft) => {
    try {
      const column = await columnService.insertColumn(boardId, draft);
      set((state) => {
        const board = state.boards.find((b) => b.id === boardId);
        if (board) {
          board.columns.push(column);
          board.columns.sort((a, b) => a.position - b.position);
        }
        state.error = null;
      });
      return column;
    } catch (error) {
      reportWriteError(error);
      return null;
    }
  },
  updateColumn: (boardId, columnId, patch) => {
    set((state) => {
      const board = state.boards.find((b) => b.id === boardId);
      const col = board?.columns.find((c) => c.id === columnId);
      if (!col) return;
      if (patch.name !== undefined) col.name = patch.name.trim();
      if (patch.color !== undefined) col.color = patch.color;
    });
    columnService.updateColumn(columnId, patch).catch(reportWriteError);
  },
  removeColumn: (boardId, columnId, options) => {
    const board = useBoardStore.getState().boards.find((b) => b.id === boardId);
    if (!board) return;

    const columns = plainColumns(board.columns);
    const moveTo = options?.moveTasksToColumnId;

    set((state) => {
      const target = state.boards.find((b) => b.id === boardId);
      if (!target) return;

      if (moveTo) {
        const moved = target.tasks.filter((t) => t.columnId === columnId);
        target.tasks = target.tasks.filter((t) => t.columnId !== columnId);
        for (const task of moved) {
          task.columnId = moveTo;
          insertAtTopOfColumn(target.tasks, task);
        }
      } else {
        target.tasks = target.tasks.filter((t) => t.columnId !== columnId);
      }
      target.columns = target.columns.filter((c) => c.id !== columnId);
    });

    const persist = async () => {
      try {
        if (moveTo) {
          await boardService.moveTasksToColumn(columnId, moveTo, columns);
          persistBoardOrder(boardId);
        }
        await columnService.deleteColumn(columnId);
      } catch (error) {
        reportWriteError(error);
      }
    };
    void persist();
  },
  reorderColumns: (boardId, sourceIndex, destinationIndex) => {
    if (sourceIndex === destinationIndex) return;

    let rows: { id: number; position: number }[] = [];
    set((state) => {
      const board = state.boards.find((b) => b.id === boardId);
      if (!board) return;

      const cols = [...board.columns].sort((a, b) => a.position - b.position);
      if (sourceIndex >= cols.length || destinationIndex >= cols.length) return;

      const [moved] = cols.splice(sourceIndex, 1);
      cols.splice(destinationIndex, 0, moved);

      cols.forEach((col, index) => {
        col.position = index;
      });
      board.columns = cols;

      rows = cols.map((col) => ({ id: col.id, position: col.position }));
    });

    if (rows.length > 0) {
      columnService.saveColumnOrder(rows).catch(reportWriteError);
    }
  },
  applyRemoteTaskInsert: (boardId, task) => {
    set((state) => {
      const board = state.boards.find((b) => b.id === boardId);
      if (!board) return;
      if (board.tasks.some((t) => t.id === task.id)) return;
      insertAtTopOfColumn(board.tasks, task);
      normalizePinnedOrder(board.tasks);
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
        const prevColumnId = fromBoard.tasks[fromIndex].columnId;
        if (prevColumnId === task.columnId) {
          fromBoard.tasks[fromIndex] = task;
          normalizePinnedOrder(fromBoard.tasks);
          return;
        }
        fromBoard.tasks.splice(fromIndex, 1);
        insertAtTopOfColumn(fromBoard.tasks, task);
        normalizePinnedOrder(fromBoard.tasks);
        return;
      }

      if (fromBoard && fromIndex !== -1) {
        fromBoard.tasks.splice(fromIndex, 1);
      }
      const board = state.boards.find((b) => b.id === boardId);
      if (board) {
        insertAtTopOfColumn(board.tasks, task);
        normalizePinnedOrder(board.tasks);
      }
    });
  },
  applyRemoteTaskDelete: (taskId) => {
    set((state) => {
      for (const board of state.boards) {
        board.tasks = board.tasks.filter((t) => t.id !== taskId);
      }
    });
  },
  setTaskCommentSummary: (taskId, count, latestPreview) => {
    set((state) => {
      for (const board of state.boards) {
        const taskIndex = board.tasks.findIndex((t) => t.id === taskId);
        if (taskIndex === -1) continue;

        const task = board.tasks[taskIndex];
        if (count > 0) {
          board.tasks[taskIndex] = {
            ...task,
            commentCount: count,
            latestCommentPreview: latestPreview,
          };
        } else {
          const { commentCount: _c, latestCommentPreview: _p, ...rest } = task;
          board.tasks[taskIndex] = rest;
        }
        break;
      }
    });
  },
  moveTask: (taskId, newColumnId, destinationIndex) => {
    let affectedBoardId: number | null = null;
    set((state) => {
      const boardIndex = state.boards.findIndex((board) => board.id === state.currentBoardId);
      if (boardIndex === -1) return;

      const taskIndex = state.boards[boardIndex].tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        const task = state.boards[boardIndex].tasks[taskIndex];
        task.columnId = newColumnId;

        if (destinationIndex !== undefined) {
          state.boards[boardIndex].tasks.splice(taskIndex, 1);

          const destColumnTasks = state.boards[boardIndex].tasks.filter(
            (t) => t.columnId === newColumnId
          );
          const pinnedCount = destColumnTasks.filter((t) => t.pinned).length;
          const clampedIndex = task.pinned
            ? Math.min(destinationIndex, pinnedCount)
            : Math.max(destinationIndex, pinnedCount);

          const firstOfDest = state.boards[boardIndex].tasks.findIndex(
            (t) => t.columnId === newColumnId
          );
          const actualDestinationIndex =
            (firstOfDest === -1 ? state.boards[boardIndex].tasks.length : firstOfDest) +
            clampedIndex;

          state.boards[boardIndex].tasks.splice(actualDestinationIndex, 0, task);
        }
        normalizePinnedOrder(state.boards[boardIndex].tasks);
        affectedBoardId = state.boards[boardIndex].id;
      }
    });
    if (affectedBoardId !== null) {
      persistBoardOrder(affectedBoardId);
    }
  },
  updateTaskOrder: (columnId, sourceIndex, destinationIndex) => {
    let affectedBoardId: number | null = null;
    set((state) => {
      const boardIndex = state.boards.findIndex((board) => board.id === state.currentBoardId);
      if (boardIndex === -1) return;

      const tasksInColumn = state.boards[boardIndex].tasks.filter(
        (task) => task.columnId === columnId
      );

      if (sourceIndex >= tasksInColumn.length || destinationIndex >= tasksInColumn.length) return;

      const clampedDest = clampColumnDestination(tasksInColumn, sourceIndex, destinationIndex);
      if (clampedDest === sourceIndex) return;

      const taskToMove = tasksInColumn[sourceIndex];

      const realSourceIndex = state.boards[boardIndex].tasks.findIndex(
        (task) => task.id === taskToMove.id
      );

      state.boards[boardIndex].tasks.splice(realSourceIndex, 1);

      const realDestinationIndex =
        state.boards[boardIndex].tasks.findIndex((task) => task.columnId === columnId) +
        clampedDest;

      state.boards[boardIndex].tasks.splice(realDestinationIndex, 0, taskToMove);
      normalizePinnedOrder(state.boards[boardIndex].tasks);
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

export const useCurrentBoardColumns = () => {
  return useBoardStore(
    useShallow((state: BoardStore) => {
      if (state.currentBoardId === null) return [];
      return state.boards.find((board: Board) => board.id === state.currentBoardId)?.columns ?? [];
    })
  );
};

export const useTasksByColumn = (columnId: number) => {
  return useBoardStore(
    useShallow((state: BoardStore) => {
      if (state.currentBoardId === null) return [];
      const currentBoard = state.boards.find((board: Board) => board.id === state.currentBoardId);
      return currentBoard?.tasks.filter((task) => task.columnId === columnId) ?? [];
    })
  );
};

/** @deprecated Usar useTasksByColumn */
export const useTasksByStatus = useTasksByColumn;
