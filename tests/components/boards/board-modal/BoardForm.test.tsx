import { describe, test, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { BoardForm } from '../../../../src/components/boards/board-modal/BoardForm';

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

const renderBoardForm = () => {
  return render(<BoardForm onSubmit={() => {}} onCancel={() => {}} />);
};

describe('BoardForm', () => {
  test('should render', () => {
    renderBoardForm();
  });
});
