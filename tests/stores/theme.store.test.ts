import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { useThemeStore } from '../../src/stores/theme.store';

// Mock localStorage antes de importar el store
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

const originalClassList = window.document.documentElement.classList;
const originalSetAttribute = window.document.documentElement.setAttribute;

describe('ThemeStore', () => {
  let store: typeof useThemeStore;
  let mockClassList: { toggle: ReturnType<typeof vi.fn> };
  let mockSetAttribute: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockClassList = { toggle: vi.fn() };
    mockSetAttribute = vi.fn();
    Object.defineProperty(window.document, 'documentElement', {
      value: {
        classList: mockClassList,
        setAttribute: mockSetAttribute,
      },
      configurable: true,
    });
    window.localStorage.clear();
    store = useThemeStore;
    store.setState({ isDark: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window.document, 'documentElement', {
      value: {
        classList: originalClassList,
        setAttribute: originalSetAttribute,
      },
      configurable: true,
    });
    window.localStorage.clear();
    vi.resetModules();
  });

  test('should have initial state in dark mode', () => {
    expect(store.getState().isDark).toBe(true);
  });

  test('setTheme should set the isDark value correctly', () => {
    store.getState().setTheme(false);
    expect(store.getState().isDark).toBe(false);
    expect(mockClassList.toggle).toHaveBeenCalledWith('dark', false);
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'light');
    store.getState().setTheme(true);
    expect(store.getState().isDark).toBe(true);
    expect(mockClassList.toggle).toHaveBeenCalledWith('dark', true);
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });

  test('toggleTheme should toggle the isDark value', () => {
    store.getState().toggleTheme();
    expect(store.getState().isDark).toBe(false);
    expect(mockClassList.toggle).toHaveBeenCalledWith('dark', false);
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'light');
    store.getState().toggleTheme();
    expect(store.getState().isDark).toBe(true);
    expect(mockClassList.toggle).toHaveBeenCalledWith('dark', true);
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });
});
