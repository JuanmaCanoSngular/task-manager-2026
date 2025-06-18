import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import {
  setupWindowMocks,
  mockBoardStore,
  cleanupTest,
  getByRole,
} from '../../utils/component-test-utils';

// Setup window mocks
beforeAll(() => {
  setupWindowMocks();
});

afterEach(() => {
  cleanup();
  cleanupTest();
});

describe('Layout', () => {
  test('should render children content', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore(),
    }));
    const { Layout } = await import('../../../src/components/layout/Layout');

    render(
      <Layout>
        <div data-testid="test-content">Test content</div>
      </Layout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('should render the header with logo', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore(),
    }));
    const { Layout } = await import('../../../src/components/layout/Layout');

    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(getByRole.banner()).toBeInTheDocument();
    expect(getByRole.heading(1)).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Manager App')).toBeInTheDocument();
  });

  test('should have proper accessibility attributes', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore(),
    }));
    const { Layout } = await import('../../../src/components/layout/Layout');

    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const logoButton = getByRole.button(/go to home/i);
    expect(logoButton).toBeInTheDocument();
    expect(logoButton).toHaveAttribute('aria-label', 'Go to home');
  });

  test('should call setCurrentBoardId with null when logo is clicked', async () => {
    const setState = vi.fn();
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: {
        setState,
        getState: () => mockBoardStore(),
      },
    }));
    const { Layout } = await import('../../../src/components/layout/Layout');

    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const logoButton = getByRole.button(/go to home/i);
    fireEvent.click(logoButton);

    expect(setState).toHaveBeenCalledWith({ currentBoardId: null });
  });

  test('should have proper CSS classes for layout structure', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore(),
    }));
    const { Layout } = await import('../../../src/components/layout/Layout');

    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const layoutContainer = getByRole.main().parentElement;
    expect(layoutContainer).toHaveClass('h-screen', 'flex', 'flex-col');
    expect(getByRole.banner()).toHaveClass('flex-shrink-0', 'p-4');
    expect(getByRole.main()).toHaveClass('flex-1');
  });

  test('should have proper heading structure', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore(),
    }));
    const { Layout } = await import('../../../src/components/layout/Layout');

    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const heading = getByRole.heading(1);
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('TasksManager App');
  });

  test('should handle multiple logo clicks', async () => {
    const setState = vi.fn();
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: {
        setState,
        getState: () => mockBoardStore(),
      },
    }));
    const { Layout } = await import('../../../src/components/layout/Layout');

    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const logoButton = getByRole.button(/go to home/i);
    fireEvent.click(logoButton);
    fireEvent.click(logoButton);
    fireEvent.click(logoButton);

    expect(setState).toHaveBeenCalledTimes(3);
    expect(setState).toHaveBeenNthCalledWith(1, { currentBoardId: null });
    expect(setState).toHaveBeenNthCalledWith(2, { currentBoardId: null });
    expect(setState).toHaveBeenNthCalledWith(3, { currentBoardId: null });
  });

  test('should render complex children content', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore(),
    }));
    const { Layout } = await import('../../../src/components/layout/Layout');

    render(
      <Layout>
        <div>
          <h2>Complex Content</h2>
          <p>This is a paragraph</p>
          <button>Click me</button>
        </div>
      </Layout>
    );

    expect(getByRole.heading(2)).toBeInTheDocument();
    expect(screen.getByText('Complex Content')).toBeInTheDocument();
    expect(screen.getByText('This is a paragraph')).toBeInTheDocument();
    expect(getByRole.button('Click me')).toBeInTheDocument();
  });

  test('should have proper semantic HTML structure', async () => {
    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: () => mockBoardStore(),
    }));
    const { Layout } = await import('../../../src/components/layout/Layout');

    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    // Check for proper semantic elements using roles
    expect(getByRole.banner()).toBeInTheDocument(); // header
    expect(getByRole.main()).toBeInTheDocument();
    expect(getByRole.heading(1)).toBeInTheDocument();
  });
});
