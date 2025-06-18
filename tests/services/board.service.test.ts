import { describe, test, expect, beforeEach, beforeAll, vi } from 'vitest';
import { setupAxiosMock, setupMatchMediaMock, exampleResponses } from '../utils/test-utils';

// Setup global mocks before importing the service
const { mockedGet } = setupAxiosMock();

let boardService: typeof import('../../src/services/board.service').boardService;

beforeAll(async () => {
  // Import the service after mocks are set up
  const serviceModule = await import('../../src/services/board.service');
  boardService = serviceModule.boardService;
});

beforeEach(() => {
  setupMatchMediaMock();
  vi.clearAllMocks();
});

describe('Board Service', () => {
  describe('getBoardList', () => {
    test('should fetch board list successfully', async () => {
      mockedGet.mockResolvedValueOnce(exampleResponses.boardList);
      const result = await boardService.getBoardList();
      expect(mockedGet).toHaveBeenCalledWith(
        'https://raw.githubusercontent.com/devchallenges-io/curriculum/refs/heads/main/4-frontend-libaries/challenges/group_1/data/task-manager/list.json'
      );
      expect(result).toEqual(exampleResponses.boardList.data);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 1);
      expect(result[0]).toHaveProperty('name', 'Productivity Board');
      expect(result[0]).toHaveProperty('emoji', '🚀');
    });

    test('should handle API errors when fetching board list', async () => {
      const error = new Error('Network Error');
      mockedGet.mockRejectedValueOnce(error);
      await expect(boardService.getBoardList()).rejects.toThrow('Network Error');
      expect(mockedGet).toHaveBeenCalledWith(
        'https://raw.githubusercontent.com/devchallenges-io/curriculum/refs/heads/main/4-frontend-libaries/challenges/group_1/data/task-manager/list.json'
      );
    });

    test('should return empty array when API returns no boards', async () => {
      mockedGet.mockResolvedValueOnce({ data: [] });
      const result = await boardService.getBoardList();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getBoardDetails', () => {
    test('should fetch board details successfully', async () => {
      const boardUrl = 'https://example.com/board1.json';
      mockedGet.mockResolvedValueOnce(exampleResponses.boardDetails);
      const result = await boardService.getBoardDetails(boardUrl);
      expect(mockedGet).toHaveBeenCalledWith(boardUrl);
      expect(result).toEqual(exampleResponses.boardDetails.data);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'Productivity Board');
      expect(result).toHaveProperty('tasks');
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0]).toHaveProperty('title', 'Sample Task');
    });

    test('should handle API errors when fetching board details', async () => {
      const boardUrl = 'https://example.com/invalid-board.json';
      const error = new Error('404 Not Found');
      mockedGet.mockRejectedValueOnce(error);
      await expect(boardService.getBoardDetails(boardUrl)).rejects.toThrow('404 Not Found');
      expect(mockedGet).toHaveBeenCalledWith(boardUrl);
    });

    test('should handle board with no tasks', async () => {
      const boardUrl = 'https://example.com/empty-board.json';
      const emptyBoardResponse = {
        data: {
          ...exampleResponses.boardDetails.data,
          tasks: [],
        },
      };
      mockedGet.mockResolvedValueOnce(emptyBoardResponse);
      const result = await boardService.getBoardDetails(boardUrl);
      expect(result.tasks).toEqual([]);
      expect(result.tasks).toHaveLength(0);
    });

    test('should handle different board URLs', async () => {
      const customUrl = 'https://custom-api.com/boards/123.json';
      mockedGet.mockResolvedValueOnce(exampleResponses.boardDetails);
      await boardService.getBoardDetails(customUrl);
      expect(mockedGet).toHaveBeenCalledWith(customUrl);
    });
  });

  describe('service configuration', () => {
    test('should use correct base URL for board list', async () => {
      mockedGet.mockResolvedValueOnce(exampleResponses.boardList);
      await boardService.getBoardList();
      expect(mockedGet).toHaveBeenCalledWith(
        expect.stringContaining('devchallenges-io/curriculum')
      );
      expect(mockedGet).toHaveBeenCalledWith(expect.stringContaining('task-manager/list.json'));
    });

    test('should handle axios response structure correctly', async () => {
      mockedGet.mockResolvedValueOnce(exampleResponses.boardList);
      const result = await boardService.getBoardList();
      // Ensure the service extracts response.data correctly
      expect(result).toBe(exampleResponses.boardList.data);
      expect(result).not.toBe(exampleResponses.boardList);
    });
  });
});
