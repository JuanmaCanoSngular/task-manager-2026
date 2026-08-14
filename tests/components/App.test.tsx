import { describe, test, beforeAll, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from '../../src/App';

vi.mock('../../src/hooks/useTasksRealtime', () => ({
  useTasksRealtime: () => undefined,
}));

vi.mock('../../src/stores/tag.store', () => ({
  useTagStore: Object.assign(
    (selector: (s: { fetchTags: (boardId: number) => void; tags: unknown[] }) => unknown) =>
      selector({ fetchTags: vi.fn(), tags: [] }),
    { setState: vi.fn() }
  ),
}));

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

const renderApp = () => {
  return render(<App />);
};

describe('App Component', () => {
  test('should render', () => {
    renderApp();
  });
});
