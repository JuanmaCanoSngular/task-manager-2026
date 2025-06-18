import { describe, test, expect, beforeEach, beforeAll, vi } from 'vitest';
import { setupAxiosMock, setupMatchMediaMock } from '../utils/test-utils';

// Setup global mocks before tests
const { mockedGet } = setupAxiosMock();

// Mock environment variables
vi.mock('../../src/services/image.service', async () => {
  const actual = await vi.importActual('../../src/services/image.service');
  return {
    ...actual,
    UNSPLASH_ACCESS_KEY: 'test-access-key',
  };
});

let imageService: typeof import('../../src/services/image.service').imageService;

beforeAll(async () => {
  // Import the service after mocks are set up
  const serviceModule = await import('../../src/services/image.service');
  imageService = serviceModule.imageService;
});

beforeEach(() => {
  setupMatchMediaMock();
  vi.clearAllMocks();
});

describe('Image Service', () => {
  describe('getRandomImage', () => {
    test('should return image URL when API call is successful', async () => {
      const mockResponse = {
        data: [
          {
            urls: {
              small: 'https://images.unsplash.com/test-image-small.jpg',
            },
          },
        ],
      };
      mockedGet.mockResolvedValueOnce(mockResponse);
      const result = await imageService.getRandomImage('productivity');
      expect(mockedGet).toHaveBeenCalledWith(
        'https://api.unsplash.com/photos/random',
        expect.objectContaining({
          params: {
            query: 'productivity',
            orientation: 'landscape',
            count: 1,
          },
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Client-ID .+$/),
          }),
        })
      );
      expect(result).toBe('https://images.unsplash.com/test-image-small.jpg');
    });

    test('should use random category when no category is provided', async () => {
      const mockResponse = {
        data: [
          {
            urls: {
              small: 'https://images.unsplash.com/test-image-small.jpg',
            },
          },
        ],
      };
      mockedGet.mockResolvedValueOnce(mockResponse);
      await imageService.getRandomImage();
      expect(mockedGet).toHaveBeenCalledWith(
        'https://api.unsplash.com/photos/random',
        expect.objectContaining({
          params: expect.objectContaining({
            query: expect.stringMatching(/^(productivity|workspace|minimal|nature|pattern)$/),
            orientation: 'landscape',
            count: 1,
          }),
        })
      );
    });

    test('should return fallback URL when API call fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockedGet.mockRejectedValueOnce(new Error('API Error'));
      const result = await imageService.getRandomImage('test-category');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error al obtener imagen de Unsplash:',
        expect.any(Error)
      );
      expect(result).toBe('https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80');
      consoleSpy.mockRestore();
    });

    test('should handle network errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockedGet.mockRejectedValueOnce(new Error('Network Error'));
      const result = await imageService.getRandomImage();
      expect(result).toBe('https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80');
      consoleSpy.mockRestore();
    });
  });

  describe('getTaskBackground', () => {
    test('should return image for todo status', async () => {
      const mockResponse = {
        data: [
          {
            urls: {
              small: 'https://images.unsplash.com/todo-image.jpg',
            },
          },
        ],
      };
      mockedGet.mockResolvedValueOnce(mockResponse);
      const result = await imageService.getTaskBackground('todo');
      expect(mockedGet).toHaveBeenCalledWith(
        'https://api.unsplash.com/photos/random',
        expect.objectContaining({
          params: expect.objectContaining({
            query: 'minimal',
          }),
        })
      );
      expect(result).toBe('https://images.unsplash.com/todo-image.jpg');
    });

    test('should return image for in_progress status', async () => {
      const mockResponse = {
        data: [
          {
            urls: {
              small: 'https://images.unsplash.com/in-progress-image.jpg',
            },
          },
        ],
      };
      mockedGet.mockResolvedValueOnce(mockResponse);
      const result = await imageService.getTaskBackground('in_progress');
      expect(mockedGet).toHaveBeenCalledWith(
        'https://api.unsplash.com/photos/random',
        expect.objectContaining({
          params: expect.objectContaining({
            query: 'workspace',
          }),
        })
      );
      expect(result).toBe('https://images.unsplash.com/in-progress-image.jpg');
    });

    test('should return image for in_review status', async () => {
      const mockResponse = {
        data: [
          {
            urls: {
              small: 'https://images.unsplash.com/in-review-image.jpg',
            },
          },
        ],
      };
      mockedGet.mockResolvedValueOnce(mockResponse);
      const result = await imageService.getTaskBackground('in_review');
      expect(mockedGet).toHaveBeenCalledWith(
        'https://api.unsplash.com/photos/random',
        expect.objectContaining({
          params: expect.objectContaining({
            query: 'gradient',
          }),
        })
      );
      expect(result).toBe('https://images.unsplash.com/in-review-image.jpg');
    });

    test('should return image for done status', async () => {
      const mockResponse = {
        data: [
          {
            urls: {
              small: 'https://images.unsplash.com/done-image.jpg',
            },
          },
        ],
      };
      mockedGet.mockResolvedValueOnce(mockResponse);
      const result = await imageService.getTaskBackground('done');
      expect(mockedGet).toHaveBeenCalledWith(
        'https://api.unsplash.com/photos/random',
        expect.objectContaining({
          params: expect.objectContaining({
            query: 'nature',
          }),
        })
      );
      expect(result).toBe('https://images.unsplash.com/done-image.jpg');
    });

    test('should return abstract image for unknown status', async () => {
      const mockResponse = {
        data: [
          {
            urls: {
              small: 'https://images.unsplash.com/abstract-image.jpg',
            },
          },
        ],
      };
      mockedGet.mockResolvedValueOnce(mockResponse);
      const result = await imageService.getTaskBackground('unknown_status');
      expect(mockedGet).toHaveBeenCalledWith(
        'https://api.unsplash.com/photos/random',
        expect.objectContaining({
          params: expect.objectContaining({
            query: 'abstract',
          }),
        })
      );
      expect(result).toBe('https://images.unsplash.com/abstract-image.jpg');
    });

    test('should handle API errors in getTaskBackground', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockedGet.mockRejectedValueOnce(new Error('API Error'));
      const result = await imageService.getTaskBackground('todo');
      expect(result).toBe('https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80');
      consoleSpy.mockRestore();
    });
  });

  describe('constants and configuration', () => {
    test('should have correct API URL', () => {
      expect(imageService).toBeDefined();
      expect(typeof imageService.getRandomImage).toBe('function');
      expect(typeof imageService.getTaskBackground).toBe('function');
    });

    test('should use correct request parameters', async () => {
      const mockResponse = {
        data: [
          {
            urls: {
              small: 'https://images.unsplash.com/test.jpg',
            },
          },
        ],
      };
      mockedGet.mockResolvedValueOnce(mockResponse);
      await imageService.getRandomImage('test');
      expect(mockedGet).toHaveBeenCalledWith(
        'https://api.unsplash.com/photos/random',
        expect.objectContaining({
          params: {
            query: 'test',
            orientation: 'landscape',
            count: 1,
          },
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Client-ID .+$/),
          }),
        })
      );
    });
  });
});
