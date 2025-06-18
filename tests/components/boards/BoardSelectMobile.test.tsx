import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeAll, afterEach, beforeEach } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import { setupWindowMocks, cleanupTest } from '../../utils/component-test-utils';

beforeAll(() => {
  setupWindowMocks();
});

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  cleanup();
  cleanupTest();
});

describe('BoardSelectMobile', () => {
  test('renders correctly with boards and a selected board', async () => {
    const mockBoards = [
      { id: 1, name: 'Board 1', emoji: '📋', color: 'blue', link: '/1', tasks: [] },
      { id: 2, name: 'Board 2', emoji: '🎯', color: 'green', link: '/2', tasks: [] },
    ];
    const mockUseBoardStore = vi.fn((selector) =>
      selector({
        boards: mockBoards,
        currentBoardId: 2,
        fetchBoardDetails: vi.fn(),
      })
    );
    const mockUseCurrentBoard = vi.fn(() => mockBoards[1]);
    const setStateSpy = vi.fn();

    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: Object.assign(mockUseBoardStore, { setState: setStateSpy }),
      useCurrentBoard: mockUseCurrentBoard,
    }));

    const { BoardSelectMobile } = await import('../../../src/components/boards/BoardSelectMobile');
    render(<BoardSelectMobile />);

    // The select should have the value of the selected board
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('2');
    // Options should be present
    expect(screen.getAllByText('Board 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Board 2').length).toBeGreaterThan(0);
    // The selected board name and emoji should be visible
    expect(screen.getAllByText('Board 2').length).toBeGreaterThan(0);
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });

  test('renders correctly with no boards', async () => {
    const mockUseBoardStore = vi.fn((selector) =>
      selector({
        boards: [],
        currentBoardId: null,
        fetchBoardDetails: vi.fn(),
      })
    );
    const mockUseCurrentBoard = vi.fn(() => null);

    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: mockUseBoardStore,
      useCurrentBoard: mockUseCurrentBoard,
    }));

    const { BoardSelectMobile } = await import('../../../src/components/boards/BoardSelectMobile');
    render(<BoardSelectMobile />);

    // The select should have value -1
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('-1');
    // Should show the placeholder
    expect(screen.getByText('Select board')).toBeInTheDocument();
    // Should show the 'Select board' text
    expect(screen.getByText('Seleccionar tablero')).toBeInTheDocument();
  });

  test('renders correctly with no board selected', async () => {
    const mockBoards = [
      { id: 1, name: 'Board 1', emoji: '📋', color: 'blue', link: '/1', tasks: [] },
      { id: 2, name: 'Board 2', emoji: '🎯', color: 'green', link: '/2', tasks: [] },
    ];
    const mockUseBoardStore = vi.fn((selector) =>
      selector({
        boards: mockBoards,
        currentBoardId: null,
        fetchBoardDetails: vi.fn(),
      })
    );
    const mockUseCurrentBoard = vi.fn(() => null);

    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: mockUseBoardStore,
      useCurrentBoard: mockUseCurrentBoard,
    }));

    const { BoardSelectMobile } = await import('../../../src/components/boards/BoardSelectMobile');
    render(<BoardSelectMobile />);

    // The select should have value -1
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('-1');
    // Should show the 'Select board' text
    expect(screen.getByText('Seleccionar tablero')).toBeInTheDocument();
  });

  test('calls fetchBoardDetails when a board is selected', async () => {
    const mockBoards = [
      { id: 1, name: 'Board 1', emoji: '📋', color: 'blue', link: '/1', tasks: [] },
      { id: 2, name: 'Board 2', emoji: '🎯', color: 'green', link: '/2', tasks: [] },
    ];
    const fetchBoardDetails = vi.fn();
    const mockUseBoardStore = vi.fn((selector) =>
      selector({
        boards: mockBoards,
        currentBoardId: null,
        fetchBoardDetails,
      })
    );
    const mockUseCurrentBoard = vi.fn(() => null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Zustand mock for tests
    (window as any).useBoardStore = { setState: vi.fn() };

    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: mockUseBoardStore,
      useCurrentBoard: mockUseCurrentBoard,
    }));

    const { BoardSelectMobile } = await import('../../../src/components/boards/BoardSelectMobile');
    render(<BoardSelectMobile />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });
    expect(fetchBoardDetails).toHaveBeenCalledWith('/2', 2);
  });

  test('sets currentBoardId to null when "Select board" is chosen', async () => {
    const mockBoards = [
      { id: 1, name: 'Board 1', emoji: '📋', color: 'blue', link: '/1', tasks: [] },
    ];
    const fetchBoardDetails = vi.fn();
    const setStateSpy = vi.fn();
    const mockUseBoardStore = vi.fn((selector) =>
      selector({
        boards: mockBoards,
        currentBoardId: 1,
        fetchBoardDetails,
      })
    );
    const mockUseCurrentBoard = vi.fn(() => mockBoards[0]);

    vi.doMock('../../../src/stores/board.store', () => ({
      useBoardStore: Object.assign(mockUseBoardStore, { setState: setStateSpy }),
      useCurrentBoard: mockUseCurrentBoard,
    }));

    const { BoardSelectMobile } = await import('../../../src/components/boards/BoardSelectMobile');
    render(<BoardSelectMobile />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '-1' } });
    expect(setStateSpy).toHaveBeenCalledWith({ currentBoardId: null });
  });
});
