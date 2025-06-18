import { describe, test, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { BoardName } from '../../../../src/components/boards/board-modal/BoardName';

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

const renderBoardName = () => {
  return render(<BoardName value="Test Board" onChange={() => {}} />);
};

describe('BoardName', () => {
  test('should render', () => {
    renderBoardName();
  });
});
