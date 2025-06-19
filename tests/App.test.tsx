import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { setupWindowMocks, cleanupTest } from './utils/component-test-utils';

beforeAll(() => {
  setupWindowMocks();
});

afterEach(() => {
  cleanup();
  cleanupTest();
});

describe('App', () => {
  test('should render skip links for accessibility', async () => {
    const mockUseBoardStore = vi.fn((selector) =>
      selector({
        error: null,
        fetchBoards: vi.fn(),
        boards: [],
        currentBoardId: null,
      })
    );

    vi.doMock('../src/stores/board.store', () => ({
      useBoardStore: mockUseBoardStore,
      useCurrentBoard: () => null,
    }));

    const { default: App } = await import('../src/App');
    render(<App />);

    // Should render skip links
    const skipToMainContent = screen.getByRole('link', { name: /skip to main content/i });
    const skipToBoardsList = screen.getByRole('link', { name: /skip to boards list/i });

    expect(skipToMainContent).toBeInTheDocument();
    expect(skipToBoardsList).toBeInTheDocument();

    // Should have correct href attributes
    expect(skipToMainContent).toHaveAttribute('href', '#main-content');
    expect(skipToBoardsList).toHaveAttribute('href', '#boards-list');

    // Should have proper styling classes
    expect(skipToMainContent).toHaveClass(
      'bg-blue-600',
      'text-white',
      'px-4',
      'py-2',
      'rounded-lg'
    );
    expect(skipToBoardsList).toHaveClass('bg-blue-600', 'text-white', 'px-4', 'py-2', 'rounded-lg');
  });

  test('should have proper target elements with correct IDs', async () => {
    const mockUseBoardStore = vi.fn((selector) =>
      selector({
        error: null,
        fetchBoards: vi.fn(),
        boards: [],
        currentBoardId: null,
      })
    );

    vi.doMock('../src/stores/board.store', () => ({
      useBoardStore: mockUseBoardStore,
      useCurrentBoard: () => null,
    }));

    const { default: App } = await import('../src/App');
    render(<App />);

    // Should have elements with the target IDs
    const mainContent = document.getElementById('main-content');
    const boardsList = document.getElementById('boards-list');

    expect(mainContent).toBeInTheDocument();
    expect(boardsList).toBeInTheDocument();

    // Should have proper semantic roles
    expect(mainContent).toHaveAttribute('id', 'main-content');
    expect(boardsList).toHaveAttribute('id', 'boards-list');
  });

  test('should render error state correctly', async () => {
    const mockUseBoardStore = vi.fn((selector) =>
      selector({
        error: 'Test error message',
        fetchBoards: vi.fn(),
        boards: [],
        currentBoardId: null,
      })
    );

    vi.doMock('../src/stores/board.store', () => ({
      useBoardStore: mockUseBoardStore,
      useCurrentBoard: () => null,
    }));

    const { default: App } = await import('../src/App');
    render(<App />);

    expect(screen.getByText(/error: test error message/i)).toBeInTheDocument();
  });
});
