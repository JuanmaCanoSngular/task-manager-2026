import { describe, test, expect, beforeEach, vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { Task, TaskStatus } from '../../src/interfaces/task.interface';

// Import the real store without mocking Zustand
import * as boardStoreModule from '../../src/stores/board.store';
import { boardService } from '../../src/services/board.service';

// Mock only the board service. Las escrituras (write-through) devuelven promesas
// resueltas para que el `.catch` del store no falle.
vi.mock('../../src/services/board.service', () => ({
  boardService: {
    getBoards: vi.fn(),
    insertBoard: vi.fn(async (board: { name: string; emoji: string; color: string; isDefault: boolean }) => ({
      id: Math.floor(Math.random() * 100000) + 1,
      name: board.name,
      emoji: board.emoji,
      color: board.color,
      link: '',
      isDefault: board.isDefault,
      tasks: [],
    })),
    deleteBoard: vi.fn(() => Promise.resolve()),
    updateBoard: vi.fn(() => Promise.resolve()),
    setDefaultBoard: vi.fn(() => Promise.resolve()),
    insertTask: vi.fn(async (_boardId: number, task: { title: string; status: string; tags: string[] }) => ({
      id: Math.floor(Math.random() * 100000) + 1,
      title: task.title,
      status: task.status,
      tags: task.tags,
    })),
    updateTask: vi.fn(() => Promise.resolve()),
    deleteTask: vi.fn(() => Promise.resolve()),
    saveTaskOrder: vi.fn(() => Promise.resolve()),
  },
}));

describe('BoardStore Integration Tests', () => {
  let useBoardStore: typeof boardStoreModule.useBoardStore;

  beforeEach(() => {
    // Use the real store for these tests
    useBoardStore = boardStoreModule.useBoardStore;
    vi.clearAllMocks();
    // Reset state before each test
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

  test('should add a new task to the current board', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
    });
    const boardId = useBoardStore.getState().currentBoardId!;
    const taskData = {
      title: 'Task 1',
      status: 'backlog' as TaskStatus,
      tags: ['technical' as Task['tags'][number]],
    };
    await act(async () => {
      await useBoardStore.getState().addNewTask(taskData);
    });
    const board = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    expect(board.tasks).toHaveLength(1);
    expect(board.tasks[0].title).toBe('Task 1');
  });

  test('should update a task', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
    });
    const boardId = useBoardStore.getState().currentBoardId!;
    const taskData = {
      title: 'Task 1',
      status: 'backlog' as TaskStatus,
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
        status: 'completed',
        tags: ['design' as Task['tags'][number]],
      });
    });
    const updatedTask = useBoardStore.getState().boards.find((b) => b.id === boardId)!.tasks[0];
    expect(updatedTask.title).toBe('Updated Task');
    expect(updatedTask.status).toBe('completed');
    expect(updatedTask.tags).toEqual(['design']);
  });

  test('should remove a task', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
    });
    const boardId = useBoardStore.getState().currentBoardId!;
    const taskData = {
      title: 'Task 1',
      status: 'backlog' as TaskStatus,
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

  test('should move a task to a new status', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
    });
    const boardId = useBoardStore.getState().currentBoardId!;
    const taskData = {
      title: 'Task 1',
      status: 'backlog' as TaskStatus,
      tags: ['technical' as Task['tags'][number]],
    };
    await act(async () => {
      await useBoardStore.getState().addNewTask(taskData);
    });
    const board = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    const taskId = board.tasks[0].id;
    act(() => {
      useBoardStore.getState().moveTask(taskId, 'completed');
    });
    const updatedTask = useBoardStore.getState().boards.find((b) => b.id === boardId)!.tasks[0];
    expect(updatedTask.status).toBe('completed');
  });

  test('should update task order within a status', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
    });
    const boardId = useBoardStore.getState().currentBoardId!;
    const task1 = {
      title: 'Task 1',
      status: 'backlog' as TaskStatus,
      tags: ['technical' as Task['tags'][number]],
    };
    const task2 = {
      title: 'Task 2',
      status: 'backlog' as TaskStatus,
      tags: ['design' as Task['tags'][number]],
    };
    await act(async () => {
      await useBoardStore.getState().addNewTask(task1);
      await useBoardStore.getState().addNewTask(task2);
    });
    const board = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    const [firstTask, secondTask] = board.tasks;
    act(() => {
      useBoardStore.getState().updateTaskOrder('backlog', 0, 1);
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
    // Try to update a task that doesn't exist
    act(() => {
      useBoardStore.getState().updateTask(999, {
        title: 'Should not exist',
        status: 'completed',
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
    // Try to remove a task that doesn't exist
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
    // Try to move a task that doesn't exist
    act(() => {
      useBoardStore.getState().moveTask(999, 'completed');
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
      status: 'backlog' as TaskStatus,
      tags: ['technical' as Task['tags'][number]],
    };
    await act(async () => {
      await useBoardStore.getState().addNewTask(task1);
    });
    const board = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    const originalTask = board.tasks[0];
    // Try to update order with invalid indices
    act(() => {
      useBoardStore.getState().updateTaskOrder('backlog', 0, 5); // Invalid destination index
    });
    const updatedBoard = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    expect(updatedBoard.tasks[0].id).toBe(originalTask.id);
  });

  test('should not add task when no board is selected', async () => {
    const taskData = {
      title: 'Task 1',
      status: 'backlog' as TaskStatus,
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
        status: 'completed',
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
      useBoardStore.getState().moveTask(1, 'completed');
    });
    const boards = useBoardStore.getState().boards;
    expect(boards).toHaveLength(0);
  });

  test('should not update task order when no board is selected', async () => {
    act(() => {
      useBoardStore.getState().updateTaskOrder('backlog', 0, 1);
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
      await useBoardStore.getState().addNewTask({ title: 'Task 1', status: 'backlog', tags: ['technical'] });
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

  test('useTasksByStatus returns empty array if no board selected', async () => {
    const { result } = renderHook(() => boardStoreModule.useTasksByStatus('backlog'));
    expect(result.current).toEqual([]);
  });

  test('useTasksByStatus returns tasks with given status', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
      await useBoardStore.getState().addNewTask({ title: 'Task 1', status: 'backlog', tags: ['technical'] });
      await useBoardStore.getState().addNewTask({ title: 'Task 2', status: 'completed', tags: ['design'] });
    });
    const { result: backlogResult } = renderHook(() =>
      boardStoreModule.useTasksByStatus('backlog')
    );
    const { result: completedResult } = renderHook(() =>
      boardStoreModule.useTasksByStatus('completed')
    );
    expect(backlogResult.current).toHaveLength(1);
    expect(backlogResult.current[0].title).toBe('Task 1');
    expect(completedResult.current).toHaveLength(1);
    expect(completedResult.current[0].title).toBe('Task 2');
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
    // Add a board first
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
    });

    // Try to fetch boards again
    await act(async () => {
      await useBoardStore.getState().fetchBoards();
    });

    // Should not call the API
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

  // Con Supabase los datos se cargan completos en fetchBoards; fetchBoardDetails
  // ya no llama al servicio, solo selecciona el tablero activo.
  test('fetchBoardDetails should set currentBoardId without calling the service', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
      await useBoardStore.getState().addNewTask({ title: 'Task 1', status: 'backlog', tags: ['technical'] });
    });

    const boardId = useBoardStore.getState().currentBoardId!;

    // Cambiar la selección a null y volver a seleccionar mediante fetchBoardDetails
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
            tasks: [
              { id: 1, title: 'Task 1', status: 'backlog', tags: ['technical'] },
              { id: 2, title: 'Task 2', status: 'completed', tags: ['design'] },
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
      await useBoardStore.getState().addNewTask({ title: 'Task 1', status: 'backlog', tags: ['technical'] });
      await useBoardStore.getState().addNewTask({ title: 'Task 2', status: 'completed', tags: ['design'] });
      await useBoardStore.getState().addNewTask({ title: 'Task 3', status: 'backlog', tags: ['front-end'] });
    });

    const boardId = useBoardStore.getState().currentBoardId!;
    const board = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    const taskToMove = board.tasks.find((t) => t.title === 'Task 1')!;

    act(() => {
      useBoardStore.getState().moveTask(taskToMove.id, 'completed', 1);
    });

    const updatedBoard = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    const completedTasks = updatedBoard.tasks.filter((t) => t.status === 'completed');
    expect(completedTasks).toHaveLength(2);
    expect(completedTasks[1].title).toBe('Task 1');
  });

  test('updateTaskOrder should handle edge cases with empty status', async () => {
    await act(async () => {
      await useBoardStore.getState().addNewBoard('Board 1', 'bg-blue-500');
      await useBoardStore.getState().addNewTask({ title: 'Task 1', status: 'backlog', tags: ['technical'] });
    });

    // Try to reorder tasks in a status that doesn't exist
    act(() => {
      useBoardStore.getState().updateTaskOrder('completed', 0, 1);
    });

    const boardId = useBoardStore.getState().currentBoardId!;
    const board = useBoardStore.getState().boards.find((b) => b.id === boardId)!;
    // Should not change anything
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
