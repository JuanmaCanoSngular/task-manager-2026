import { describe, test, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

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

describe('App', () => {
  test('should render', () => {
    renderApp();
  });
});
