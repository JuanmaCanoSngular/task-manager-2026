import { describe, test, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { BoardModal } from '../../../../src/components/boards/board-modal/BoardModal';

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

const renderBoardModal = () => {
  return render(<BoardModal isOpen={true} onClose={() => {}} onSubmit={() => {}} />);
};

describe('BoardModal', () => {
  test('should render', () => {
    renderBoardModal();
  });
});
