import { vi } from 'vitest';
import { screen } from '@testing-library/react';

// Common window mocks for component tests
export const setupWindowMocks = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  });
};

// Mock Zustand stores
export const mockBoardStore = (overrides = {}) => ({
  currentBoardId: null,
  boards: [],
  setCurrentBoardId: vi.fn(),
  addBoard: vi.fn(),
  removeBoard: vi.fn(),
  ...overrides,
});

export const mockThemeStore = (overrides = {}) => ({
  isDark: false,
  setTheme: vi.fn(),
  ...overrides,
});

// Common test cleanup
export const cleanupTest = () => {
  vi.clearAllMocks();
  vi.resetModules();
};

// Helper to mock a Zustand store for a specific test
export const mockZustandStore = (
  storePath: string,
  mockImplementation: Record<string, unknown>
) => {
  vi.doMock(storePath, () => mockImplementation);
};

// Role-based query helpers for better accessibility testing
export const getByRole = {
  button: (name?: string | RegExp) => screen.getByRole('button', name ? { name } : undefined),
  heading: (level?: 1 | 2 | 3 | 4 | 5 | 6) =>
    screen.getByRole('heading', level ? { level } : undefined),
  link: (name?: string | RegExp) => screen.getByRole('link', name ? { name } : undefined),
  textbox: (name?: string | RegExp) => screen.getByRole('textbox', name ? { name } : undefined),
  dialog: (name?: string | RegExp) => screen.getByRole('dialog', name ? { name } : undefined),
  banner: () => screen.getByRole('banner'),
  main: () => screen.getByRole('main'),
  navigation: (name?: string | RegExp) =>
    screen.getByRole('navigation', name ? { name } : undefined),
  list: (name?: string | RegExp) => screen.getByRole('list', name ? { name } : undefined),
  listitem: (name?: string | RegExp) => screen.getByRole('listitem', name ? { name } : undefined),
  form: (name?: string | RegExp) => screen.getByRole('form', name ? { name } : undefined),
  searchbox: (name?: string | RegExp) => screen.getByRole('searchbox', name ? { name } : undefined),
  combobox: (name?: string | RegExp) => screen.getByRole('combobox', name ? { name } : undefined),
  option: (name?: string | RegExp) => screen.getByRole('option', name ? { name } : undefined),
  tab: (name?: string | RegExp) => screen.getByRole('tab', name ? { name } : undefined),
  tabpanel: (name?: string | RegExp) => screen.getByRole('tabpanel', name ? { name } : undefined),
  alert: (name?: string | RegExp) => screen.getByRole('alert', name ? { name } : undefined),
  status: (name?: string | RegExp) => screen.getByRole('status', name ? { name } : undefined),
  progressbar: (name?: string | RegExp) =>
    screen.getByRole('progressbar', name ? { name } : undefined),
  checkbox: (name?: string | RegExp) => screen.getByRole('checkbox', name ? { name } : undefined),
  radio: (name?: string | RegExp) => screen.getByRole('radio', name ? { name } : undefined),
  switch: (name?: string | RegExp) => screen.getByRole('switch', name ? { name } : undefined),
  slider: (name?: string | RegExp) => screen.getByRole('slider', name ? { name } : undefined),
  spinbutton: (name?: string | RegExp) =>
    screen.getByRole('spinbutton', name ? { name } : undefined),
  tree: (name?: string | RegExp) => screen.getByRole('tree', name ? { name } : undefined),
  treeitem: (name?: string | RegExp) => screen.getByRole('treeitem', name ? { name } : undefined),
  grid: (name?: string | RegExp) => screen.getByRole('grid', name ? { name } : undefined),
  gridcell: (name?: string | RegExp) => screen.getByRole('gridcell', name ? { name } : undefined),
  row: (name?: string | RegExp) => screen.getByRole('row', name ? { name } : undefined),
  columnheader: (name?: string | RegExp) =>
    screen.getByRole('columnheader', name ? { name } : undefined),
  rowheader: (name?: string | RegExp) => screen.getByRole('rowheader', name ? { name } : undefined),
  cell: (name?: string | RegExp) => screen.getByRole('cell', name ? { name } : undefined),
  table: (name?: string | RegExp) => screen.getByRole('table', name ? { name } : undefined),
  article: (name?: string | RegExp) => screen.getByRole('article', name ? { name } : undefined),
  section: (name?: string | RegExp) => screen.getByRole('section', name ? { name } : undefined),
  aside: (name?: string | RegExp) => screen.getByRole('aside', name ? { name } : undefined),
  complementary: (name?: string | RegExp) =>
    screen.getByRole('complementary', name ? { name } : undefined),
  contentinfo: (name?: string | RegExp) =>
    screen.getByRole('contentinfo', name ? { name } : undefined),
  definition: (name?: string | RegExp) =>
    screen.getByRole('definition', name ? { name } : undefined),
  term: (name?: string | RegExp) => screen.getByRole('term', name ? { name } : undefined),
  group: (name?: string | RegExp) => screen.getByRole('group', name ? { name } : undefined),
  region: (name?: string | RegExp) => screen.getByRole('region', name ? { name } : undefined),
  separator: (name?: string | RegExp) => screen.getByRole('separator', name ? { name } : undefined),
  toolbar: (name?: string | RegExp) => screen.getByRole('toolbar', name ? { name } : undefined),
  tooltip: (name?: string | RegExp) => screen.getByRole('tooltip', name ? { name } : undefined),
  menubar: (name?: string | RegExp) => screen.getByRole('menubar', name ? { name } : undefined),
  menu: (name?: string | RegExp) => screen.getByRole('menu', name ? { name } : undefined),
  menuitem: (name?: string | RegExp) => screen.getByRole('menuitem', name ? { name } : undefined),
  menuitemcheckbox: (name?: string | RegExp) =>
    screen.getByRole('menuitemcheckbox', name ? { name } : undefined),
  menuitemradio: (name?: string | RegExp) =>
    screen.getByRole('menuitemradio', name ? { name } : undefined),
  scrollbar: (name?: string | RegExp) => screen.getByRole('scrollbar', name ? { name } : undefined),
  log: (name?: string | RegExp) => screen.getByRole('log', name ? { name } : undefined),
  marquee: (name?: string | RegExp) => screen.getByRole('marquee', name ? { name } : undefined),
  timer: (name?: string | RegExp) => screen.getByRole('timer', name ? { name } : undefined),
  application: (name?: string | RegExp) =>
    screen.getByRole('application', name ? { name } : undefined),
  document: (name?: string | RegExp) => screen.getByRole('document', name ? { name } : undefined),
  feed: (name?: string | RegExp) => screen.getByRole('feed', name ? { name } : undefined),
  note: (name?: string | RegExp) => screen.getByRole('note', name ? { name } : undefined),
  presentation: (name?: string | RegExp) =>
    screen.getByRole('presentation', name ? { name } : undefined),
  search: (name?: string | RegExp) => screen.getByRole('search', name ? { name } : undefined),
};

// Query all by role helpers
export const getAllByRole = {
  button: (name?: string | RegExp) => screen.getAllByRole('button', name ? { name } : undefined),
  heading: (level?: 1 | 2 | 3 | 4 | 5 | 6) =>
    screen.getAllByRole('heading', level ? { level } : undefined),
  listitem: (name?: string | RegExp) =>
    screen.getAllByRole('listitem', name ? { name } : undefined),
  option: (name?: string | RegExp) => screen.getAllByRole('option', name ? { name } : undefined),
  tab: (name?: string | RegExp) => screen.getAllByRole('tab', name ? { name } : undefined),
  menuitem: (name?: string | RegExp) =>
    screen.getAllByRole('menuitem', name ? { name } : undefined),
  gridcell: (name?: string | RegExp) =>
    screen.getAllByRole('gridcell', name ? { name } : undefined),
  row: (name?: string | RegExp) => screen.getAllByRole('row', name ? { name } : undefined),
  cell: (name?: string | RegExp) => screen.getAllByRole('cell', name ? { name } : undefined),
};
