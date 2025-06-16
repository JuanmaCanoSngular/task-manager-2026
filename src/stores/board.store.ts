import { create, StateCreator } from 'zustand';
import { Board } from '../interfaces/board.interface';
import { Task } from '../interfaces/task.interface';
import { boardService } from '../services/board.service';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface BoardStore {
  currentBoardId: number | null;
  boards: Board[];
  error: string | null;
  fetchBoards: () => Promise<void>;
  fetchBoardDetails: (url: string, id: number) => Promise<void>;
  addNewBoard: () => void;
  removeBoard: () => void;
  addNewTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (taskId: number, taskData: Omit<Task, 'id'>) => void;
  removeTask: (taskId: number) => void;
}

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
  addNewBoard: () => {
    const board: Board = {
      id: useBoardStore.getState().boards.length + 1,
      name: 'Default Board',
      emoji: generateEmoji(),
      color: generateRandomColor(),
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

const generateEmoji = () => {
  const emojiRanges = [
    [0x1f300, 0x1f5ff], // Misc Symbols and Pictographs
    [0x1f600, 0x1f64f], // Emoticons
    [0x1f680, 0x1f6ff], // Transport and Map Symbols
    [0x1f900, 0x1f9ff], // Supplemental Symbols and Pictographs
    [0x2600, 0x26ff], // Misc Symbols
    [0x2700, 0x27bf], // Dingbats
  ];
  const range = emojiRanges[Math.floor(Math.random() * emojiRanges.length)];
  const codePoint = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
  return String.fromCodePoint(codePoint);
};

const generateRandomColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215);
  return '#' + randomColor.toString(16).padStart(6, '0');
};
