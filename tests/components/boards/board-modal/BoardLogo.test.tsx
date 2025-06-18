import { describe, test, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { BoardLogo } from '../../../../src/components/boards/board-modal/BoardLogo';

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

const mockLogoOptions = [
  { emoji: '📋', color: '#3B82F6' },
  { emoji: '🎯', color: '#EF4444' },
  { emoji: '🚀', color: '#10B981' },
];

const renderBoardLogo = () => {
  return render(
    <BoardLogo
      logoOptions={mockLogoOptions}
      selectedIndex={0}
      onSelect={() => {}}
      onGenerateNew={() => {}}
    />
  );
};

describe('BoardLogo', () => {
  test('should render', () => {
    renderBoardLogo();
  });
});
