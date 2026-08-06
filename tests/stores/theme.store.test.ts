import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { useThemeStore } from '../../src/stores/theme.store';

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
  let mockAnimate: ReturnType<typeof vi.fn>;
  let mockStartViewTransition: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockClassList = { toggle: vi.fn() };
    mockSetAttribute = vi.fn();
    mockAnimate = vi.fn();
    mockStartViewTransition = vi.fn((cb: () => void) => {
      cb();
      return { ready: Promise.resolve() };
    });

    Object.defineProperty(window.document, 'documentElement', {
      value: {
        classList: mockClassList,
        setAttribute: mockSetAttribute,
        animate: mockAnimate,
      },
      configurable: true,
    });

    Object.defineProperty(document, 'startViewTransition', {
      value: mockStartViewTransition,
      writable: true,
      configurable: true,
    });

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? false : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

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

  test('setTheme should set the isDark value correctly', async () => {
    store.getState().setTheme(false);
    expect(store.getState().isDark).toBe(false);
    expect(mockClassList.toggle).toHaveBeenCalledWith('dark', false);
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'light');
    expect(mockStartViewTransition).toHaveBeenCalled();
    await Promise.resolve();
    expect(mockAnimate).toHaveBeenCalledWith(
      { clipPath: ['inset(0 0 100% 0)', 'inset(0)'] },
      {
        pseudoElement: '::view-transition-new(root)',
        duration: 600,
      }
    );

    store.getState().setTheme(true);
    expect(store.getState().isDark).toBe(true);
    expect(mockClassList.toggle).toHaveBeenCalledWith('dark', true);
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });

  test('setTheme no anima si el tema no cambia', () => {
    store.getState().setTheme(true);
    expect(mockStartViewTransition).not.toHaveBeenCalled();
    expect(mockClassList.toggle).toHaveBeenCalledWith('dark', true);
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

  test('setTheme sin View Transitions aplica el tema directo', () => {
    Object.defineProperty(document, 'startViewTransition', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    store.getState().setTheme(false);
    expect(store.getState().isDark).toBe(false);
    expect(mockClassList.toggle).toHaveBeenCalledWith('dark', false);
    expect(mockAnimate).not.toHaveBeenCalled();
  });
});
