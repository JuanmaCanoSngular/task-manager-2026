import { describe, test, expect, beforeEach, vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { Task } from '../../src/interfaces/task.interface';
import { MOCK_COLUMNS } from '../utils/mock-columns';

import * as boardStoreModule from '../../src/stores/board.store';
import { boardService } from '../../src/services/board.service';

const mockColumnsForBoard = (boardId: number) =>
  MOCK_COLUMNS.map((c) => ({ ...c, boardId }));

vi.mock('../../src/services/board.service', () => ({
  boardService: {
    getBoards: vi.fn(),
    insertBoard: vi.fn(async (board: {
      name: string;
      emoji: string;
      color: string;
      isDefault: boolean;
      kind?: string;
    }) => {
      const id = Math.floor(Math.random() * 100000) + 1;
      return {
        id,
        name: board.name,
        emoji: board.emoji,
        color: board.color,
        link: '',
        isDefault: board.isDefault,
        kind: board.kind ?? 'kanban',
        columns: mockColumnsForBoard(id),
        tasks: [],
      };
    }),
    deleteBoard: vi.fn(() => Promise.resolve()),
    updateBoard: vi.fn(() => Promise.resolve()),
    setDefaultBoard: vi.fn(() => Promise.resolve()),
    insertTask: vi.fn(async (_boardId: number, task: { title: string; columnId: number; tags: string[] }) => ({
      id: Math.floor(Math.random() * 100000) + 1,
      title: task.title,
      columnId: task.columnId,
      tags: task.tags,
    })),
    updateTask: vi.fn(() => Promise.resolve()),
    setTaskPinned: vi.fn(() => Promise.resolve()),
    deleteTask: vi.fn(() => Promise.resolve()),
    saveTaskOrder: vi.fn(() => Promise.resolve()),
  },
}));

describe('BoardStore Integration Tests', () => {
  let useBoardStore: typeof boardStoreModule.useBoardStore;

  beforeEach(() => {
    useBoardStore = boardStoreModule.useBoardStore;
    vi.clearAllMocks();
    act(() => {
      useBoardStore.setState({
        currentBoardId: null,
        boards: [],
        error: null,
      });
    });
  });

  test('should add a new board', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board Test', 'bg-blue-500');
    });
    const boards = useBoardStore.getState().boards;
    expect(boards).toHaveLength(1);
    expect(boards[0].name).toBe('Board Test');
    expect(boards[0].emoji).toBe('');
    expect(boards[0].color).toBe('bg-blue-500');
    expect(boards[0].columns).toHaveLength(4);
    expect(useBoardStore.getState().currentBoardId).toBe(boards[0].id);
  });

  test('should remove a board and seleccionar el default restante', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
      await useBoardStore.getState().addNewBoard('Board 2', 'bg-green-500');
    });
    const boardIdToRemove = useBoardStore.getState().currentBoardId;
    act(() => {
      useBoardStore.getState().removeBoard();
    });
    const boards = useBoardStore.getState().boards;
    expect(boards.find((b) => b.id === boardIdToRemove)).toBeUndefined();
    expect(boards).toHaveLength(1);
    expect(boards[0].isDefault).toBe(true);
    expect(useBoardStore.getState().currentBoardId).toBe(boards[0].id);
  });

  test('setDefaultBoard marca uno y desmarca el anterior', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
      await useBoardStore.getState().addNewBoard('Board 2', 'bg-green-500');
    });
    const secondId = useBoardStore.getState().boards[1].id;
    act(() => {
      useBoardStore.getState().setDefaultBoard(secondId);
    });
    const boards = useBoardStore.getState().boards;
    expect(boards.find((b) => b.id === secondId)?.isDefault).toBe(true);
    expect(boards.filter((b) => b.isDefault)).toHaveLength(1);
    expect(boardService.setDefaultBoard).toHaveBeenCalledWith(secondId);
  });

  test('el primer tablero creado es el default', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Solo', 'bg-blue-500');
    });
    expect(useBoardStore.getState().boards[0].isDefault).toBe(true);
    expect(boardService.insertBoard).toHaveBeenCalledWith(
      expect.objectContaining({ isDefault: true })
    );
  });

  test('addNewBoard pasa kind shopping al servicio', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Compra', '#0d9488', 'shopping');
    });
    expect(boardService.insertBoard).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Compra', kind: 'shopping' })
    );
    expect(useBoardStore.getState().boards[0].kind).toBe('shopping');
  });

  test('should add a new task to the current board', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
    });
    const boardId = useBoardStore.getState().currentBoardId!;
    const taskData = {
      title: 'Task 1',
      columnId: 1,
      tags: ['technical' as Task['tags'][number]],
    };
    await act(async () => {
      await useBoardStore.getState().addNewTask(taskData);
    });
    const board = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    expect(board.tasks).toHaveLength(1);
    expect(board.tasks[0].title).toBe('Task 1');
    expect(board.tasks[0].columnId).toBe(1);
  });

  test('should update a task', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
    });
    const boardId = useBoardStore.getState().currentBoardId!;
    const taskData = {
      title: 'Task 1',
      columnId: 1,
      tags: ['technical' as Task['tags'][number]],
    };
    await act(async () => {
      await useBoardStore.getState().addNewTask(taskData);
    });
    const board = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    const taskId = board.tasks[0].id;
    act(() => {
      useBoardStore.getState().updateTask(taskId, {
        title: 'Updated Task',
        columnId: 4,
        tags: ['design' as Task['tags'][number]],
      });
    });
    const updatedTask = useBoardStore.getState().boards.find((b) => b.id === boardId)!.tasks[0];
    expect(updatedTask.title).toBe('Updated Task');
    expect(updatedTask.columnId).toBe(4);
    expect(updatedTask.tags).toEqual(['design']);
  });

  test('should remove a task', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
    });
    const boardId = useBoardStore.getState().currentBoardId!;
    const taskData = {
      title: 'Task 1',
      columnId: 1,
      tags: ['technical' as Task['tags'][number]],
    };
    await act(async () => {
      await useBoardStore.getState().addNewTask(taskData);
    });
    const board = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    const taskId = board.tasks[0].id;
    act(() => {
      useBoardStore.getState().removeTask(taskId);
    });
    const updatedBoard = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    expect(updatedBoard.tasks).toHaveLength(0);
  });

  test('should move a task to a new column', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
    });
    const boardId = useBoardStore.getState().currentBoardId!;
    const taskData = {
      title: 'Task 1',
      columnId: 1,
      tags: ['technical' as Task['tags'][number]],
    };
    await act(async () => {
      await useBoardStore.getState().addNewTask(taskData);
    });
    const board = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    const taskId = board.tasks[0].id;
    act(() => {
      useBoardStore.getState().moveTask(taskId, 4);
    });
    const updatedTask = useBoardStore.getState().boards.find((b) => b.id === boardId)!.tasks[0];
    expect(updatedTask.columnId).toBe(4);
  });

  test('should update task order within a column', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
    });
    const boardId = useBoardStore.getState().currentBoardId!;
    const task1 = {
      title: 'Task 1',
      columnId: 1,
      tags: ['technical' as Task['tags'][number]],
    };
    const task2 = {
      title: 'Task 2',
      columnId: 1,
      tags: ['design' as Task['tags'][number]],
    };
    await act(async () => {
      await useBoardStore.getState().addNewTask(task1);
      await useBoardStore.getState().addNewTask(task2);
    });
    const board = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    const [firstTask, secondTask] = board.tasks;
    act(() => {
      useBoardStore.getState().updateTaskOrder(1, 0, 1);
    });
    const reorderedTasks = useBoardStore.getState().boards.find((b) => b.id === boardId)!.tasks;
    expect(reorderedTasks[0].id).toBe(secondTask.id);
    expect(reorderedTasks[1].id).toBe(firstTask.id);
  });

  test('should handle error when updating a non-existent task', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
    });
    const boardId = useBoardStore.getState().currentBoardId!;
    act(() => {
      useBoardStore.getState().updateTask(999, {
        title: 'Should not exist',
        columnId: 4,
        tags: ['design' as Task['tags'][number]],
      });
    });
    const board = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    expect(board.tasks).toHaveLength(0);
  });

  test('should handle error when removing a non-existent task', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
    });
    const boardId = useBoardStore.getState().currentBoardId!;
    act(() => {
      useBoardStore.getState().removeTask(999);
    });
    const board = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    expect(board.tasks).toHaveLength(0);
  });

  test('should handle error when moving a non-existent task', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
    });
    const boardId = useBoardStore.getState().currentBoardId!;
    act(() => {
      useBoardStore.getState().moveTask(999, 4);
    });
    const board = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    expect(board.tasks).toHaveLength(0);
  });

  test('should handle error when updating task order with invalid indices', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
    });
    const boardId = useBoardStore.getState().currentBoardId!;
    const task1 = {
      title: 'Task 1',
      columnId: 1,
      tags: ['technical' as Task['tags'][number]],
    };
    await act(async () => {
      await useBoardStore.getState().addNewTask(task1);
    });
    const board = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    const originalTask = board.tasks[0];
    act(() => {
      useBoardStore.getState().updateTaskOrder(1, 0, 5);
    });
    const updatedBoard = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    expect(updatedBoard.tasks[0].id).toBe(originalTask.id);
  });

  test('should not add task when no board is selected', async () => {
    const taskData = {
      title: 'Task 1',
      columnId: 1,
      tags: ['technical' as Task['tags'][number]],
    };
    await act(async () => {
      await useBoardStore.getState().addNewTask(taskData);
    });
    const boards = useBoardStore.getState().boards;
    expect(boards).toHaveLength(0);
  });

  test('should not update task when no board is selected', async () => {
    act(() => {
      useBoardStore.getState().updateTask(1, {
        title: 'Updated Task',
        columnId: 4,
        tags: ['design' as Task['tags'][number]],
      });
    });
    const boards = useBoardStore.getState().boards;
    expect(boards).toHaveLength(0);
  });

  test('should not remove task when no board is selected', async () => {
    act(() => {
      useBoardStore.getState().removeTask(1);
    });
    const boards = useBoardStore.getState().boards;
    expect(boards).toHaveLength(0);
  });

  test('should not move task when no board is selected', async () => {
    act(() => {
      useBoardStore.getState().moveTask(1, 4);
    });
    const boards = useBoardStore.getState().boards;
    expect(boards).toHaveLength(0);
  });

  test('should not update task order when no board is selected', async () => {
    act(() => {
      useBoardStore.getState().updateTaskOrder(1, 0, 1);
    });
    const boards = useBoardStore.getState().boards;
    expect(boards).toHaveLength(0);
  });
});

describe('BoardStore Selectors', () => {
  let useBoardStore: typeof boardStoreModule.useBoardStore;

  beforeEach(() => {
    useBoardStore = boardStoreModule.useBoardStore;
    act(() => {
      useBoardStore.setState({
        currentBoardId: null,
        boards: [],
        error: null,
      });
    });
  });

  test('useCurrentBoardTasks returns empty array if no board selected', async () => {
    const { result } = renderHook(() => boardStoreModule.useCurrentBoardTasks());
    expect(result.current).toEqual([]);
  });

  test('useCurrentBoardTasks returns tasks of current board', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
      await useBoardStore.getState().addNewTask({ title: 'Task 1', columnId: 1, tags: ['technical'] });
    });
    const { result } = renderHook(() => boardStoreModule.useCurrentBoardTasks());
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe('Task 1');
  });

  test('useCurrentBoard returns null if no board selected', async () => {
    const { result } = renderHook(() => boardStoreModule.useCurrentBoard());
    expect(result.current).toBeNull();
  });

  test('useCurrentBoard returns the current board', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
    });
    const { result } = renderHook(() => boardStoreModule.useCurrentBoard());
    expect(result.current).not.toBeNull();
    expect(result.current?.name).toBe('Board 1');
  });

  test('useTasksByColumn returns empty array if no board selected', async () => {
    const { result } = renderHook(() => boardStoreModule.useTasksByColumn(1));
    expect(result.current).toEqual([]);
  });

  test('useTasksByColumn returns tasks in the given column', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
      await useBoardStore.getState().addNewTask({ title: 'Task 1', columnId: 1, tags: ['technical'] });
      await useBoardStore.getState().addNewTask({ title: 'Task 2', columnId: 4, tags: ['design'] });
    });
    const { result: backlogResult } = renderHook(() => boardStoreModule.useTasksByColumn(1));
    const { result: completedResult } = renderHook(() => boardStoreModule.useTasksByColumn(4));
    expect(backlogResult.current).toHaveLength(1);
    expect(backlogResult.current[0].title).toBe('Task 1');
    expect(completedResult.current).toHaveLength(1);
    expect(completedResult.current[0].title).toBe('Task 2');
  });

  test('toggleTaskPinned ancla la tarea arriba y no deja arrastrarla bajo no ancladas', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
    });
    const boardId = useBoardStore.getState().currentBoardId!;
    const colId = useBoardStore.getState().boards[0].columns[0].id;

    act(() => {
      useBoardStore.setState((state) => {
        const board = state.boards.find((b) => b.id === boardId)!;
        board.tasks = [
          { id: 1, title: 'A', columnId: colId, tags: [] },
          { id: 2, title: 'B', columnId: colId, tags: [] },
          { id: 3, title: 'C', columnId: colId, tags: [] },
        ];
      });
    });

    act(() => {
      useBoardStore.getState().toggleTaskPinned(3);
    });

    let titles = useBoardStore
      .getState()
      .boards[0].tasks.filter((t) => t.columnId === colId)
      .map((t) => t.title);
    expect(titles).toEqual(['C', 'A', 'B']);
    expect(useBoardStore.getState().boards[0].tasks.find((t) => t.id === 3)?.pinned).toBe(true);
    expect(boardService.setTaskPinned).toHaveBeenCalledWith(3, true);

    const persistCalls = vi.mocked(boardService.saveTaskOrder).mock.calls.length;
    act(() => {
      useBoardStore.getState().updateTaskOrder(colId, 1, 0);
    });
    titles = useBoardStore
      .getState()
      .boards[0].tasks.filter((t) => t.columnId === colId)
      .map((t) => t.title);
    expect(titles).toEqual(['C', 'A', 'B']);
    expect(vi.mocked(boardService.saveTaskOrder).mock.calls.length).toBe(persistCalls);

    act(() => {
      useBoardStore.getState().toggleTaskPinned(3);
    });
    expect(useBoardStore.getState().boards[0].tasks.find((t) => t.id === 3)?.pinned).toBeFalsy();
    expect(boardService.setTaskPinned).toHaveBeenCalledWith(3, false);
  });
});

describe('BoardStore API Integration Tests', () => {
  let useBoardStore: typeof boardStoreModule.useBoardStore;

  beforeEach(() => {
    useBoardStore = boardStoreModule.useBoardStore;
    act(() => {
      useBoardStore.setState({
        currentBoardId: null,
        boards: [],
        error: null,
      });
    });
    vi.clearAllMocks();
  });

  test('fetchBoards should not call API if boards already exist', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
    });

    await act(async () => {
      await useBoardStore.getState().fetchBoards();
    });

    expect(boardService.getBoards).not.toHaveBeenCalled();
  });

  test('fetchBoards should call API and update state when no boards exist', async () => {
    const mockBoards = [
      {
        id: 1,
        name: 'API Board 1',
        emoji: '🚀',
        color: '#ff0000',
        link: 'https://example.com/1',
        columns: mockColumnsForBoard(1),
        tasks: [],
        isDefault: true,
        isLocal: false,
      },
      {
        id: 2,
        name: 'API Board 2',
        emoji: '🎯',
        color: '#00ff00',
        link: 'https://example.com/2',
        columns: mockColumnsForBoard(2),
        tasks: [],
        isDefault: false,
        isLocal: false,
      },
    ];

    (boardService.getBoards as ReturnType<typeof vi.fn>).mockResolvedValue(mockBoards);

    await act(async () => {
      await useBoardStore.getState().fetchBoards();
    });

    expect(boardService.getBoards).toHaveBeenCalled();
    expect(useBoardStore.getState().boards).toEqual(mockBoards);
    expect(useBoardStore.getState().currentBoardId).toBe(1);
    expect(useBoardStore.getState().error).toBeNull();
  });

  test('fetchBoards should handle API errors', async () => {
    const errorMessage = 'Network error';
    (boardService.getBoards as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error(errorMessage)
    );

    await act(async () => {
      await useBoardStore.getState().fetchBoards();
    });

    expect(boardService.getBoards).toHaveBeenCalled();
    expect(useBoardStore.getState().error).toBe(errorMessage);
    expect(useBoardStore.getState().boards).toEqual([]);
  });

  test('fetchBoardDetails should set currentBoardId without calling the service', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
      await useBoardStore.getState().addNewTask({ title: 'Task 1', columnId: 1, tags: ['technical'] });
    });

    const boardId = useBoardStore.getState().currentBoardId!;

    act(() => {
      useBoardStore.setState({ currentBoardId: null });
    });

    await act(async () => {
      await useBoardStore.getState().fetchBoardDetails('https://example.com/board', boardId);
    });

    expect(boardService.getBoards).not.toHaveBeenCalled();
    expect(useBoardStore.getState().currentBoardId).toBe(boardId);
  });

  test('fetchBoardDetails should keep the board tasks intact', async () => {
    act(() => {
      useBoardStore.setState({
        currentBoardId: null,
        boards: [
          {
            id: 1,
            name: 'Board 1',
            emoji: '📋',
            color: 'bg-blue-500',
            link: '',
            isDefault: true,
            columns: mockColumnsForBoard(1),
            tasks: [
              { id: 1, title: 'Task 1', columnId: 1, tags: ['technical'] },
              { id: 2, title: 'Task 2', columnId: 4, tags: ['design'] },
            ],
          },
        ],
        error: null,
      });
    });

    await act(async () => {
      await useBoardStore.getState().fetchBoardDetails('https://example.com/board', 1);
    });

    expect(useBoardStore.getState().currentBoardId).toBe(1);
    const board = useBoardStore.getState().boards.find((b) => b.id === 1);
    expect(board?.tasks).toHaveLength(2);
  });
});

describe('BoardStore Edge Cases', () => {
  let useBoardStore: typeof boardStoreModule.useBoardStore;

  beforeEach(() => {
    useBoardStore = boardStoreModule.useBoardStore;
    act(() => {
      useBoardStore.setState({
        currentBoardId: null,
        boards: [],
        error: null,
      });
    });
  });

  test('moveTask with destinationIndex should reorder tasks correctly', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
      await useBoardStore.getState().addNewTask({ title: 'Task 1', columnId: 1, tags: ['technical'] });
      await useBoardStore.getState().addNewTask({ title: 'Task 2', columnId: 4, tags: ['design'] });
      await useBoardStore.getState().addNewTask({ title: 'Task 3', columnId: 1, tags: ['front-end'] });
    });

    const boardId = useBoardStore.getState().currentBoardId!;
    const board = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    const taskToMove = board.tasks.find((t) => t.title === 'Task 1')!;

    act(() => {
      useBoardStore.getState().moveTask(taskToMove.id, 4, 1);
    });

    const updatedBoard = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    const completedTasks = updatedBoard.tasks.filter((t) => t.columnId === 4);
    expect(completedTasks).toHaveLength(2);
    expect(completedTasks[1].title).toBe('Task 1');
  });

  test('updateTaskOrder should handle edge cases with empty column', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
      await useBoardStore.getState().addNewTask({ title: 'Task 1', columnId: 1, tags: ['technical'] });
    });

    act(() => {
      useBoardStore.getState().updateTaskOrder(4, 0, 1);
    });

    const boardId = useBoardStore.getState().currentBoardId!;
    const board = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    expect(board.tasks).toHaveLength(1);
    expect(board.tasks[0].title).toBe('Task 1');
  });

  test('addNewBoard with default values', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard();
    });

    const boards = useBoardStore.getState().boards;
    expect(boards).toHaveLength(1);
    expect(boards[0].name).toBe('Nuevo tablero');
    expect(boards[0].emoji).toBe('');
    expect(boards[0].color).toBe('#0d9488');
  });

  test('addNewBoard with partial values', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Custom Board');
    });

    const boards = useBoardStore.getState().boards;
    expect(boards).toHaveLength(1);
    expect(boards[0].name).toBe('Custom Board');
    expect(boards[0].emoji).toBe('');
    expect(boards[0].color).toBe('#0d9488');
  });
});
