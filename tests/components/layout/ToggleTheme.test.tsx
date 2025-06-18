import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

// Mock matchMedia and ResizeObserver
beforeAll(() => {
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
    value: vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  });
});

afterEach(() => {
  cleanup();
  vi.resetModules();
});

describe('ToggleTheme', () => {
  test('should render both theme buttons', async () => {
    vi.doMock('../../../src/stores/theme.store', () => ({
      useThemeStore: () => ({ isDark: false, setTheme: vi.fn() }),
    }));
    const { ToggleTheme } = await import('../../../src/components/layout/ToggleTheme');
    render(<ToggleTheme />);
    expect(screen.getByRole('radio', { name: /dark/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /light/i })).toBeInTheDocument();
  });

  test('should have correct aria attributes and roles', async () => {
    vi.doMock('../../../src/stores/theme.store', () => ({
      useThemeStore: () => ({ isDark: false, setTheme: vi.fn() }),
    }));
    const { ToggleTheme } = await import('../../../src/components/layout/ToggleTheme');
    render(<ToggleTheme />);
    const group = screen.getByRole('radiogroup');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('aria-label', expect.stringMatching(/theme|color/i));
    const darkBtn = screen.getByRole('radio', { name: /dark/i });
    const lightBtn = screen.getByRole('radio', { name: /light/i });
    expect(darkBtn).toHaveAttribute('aria-pressed', 'false');
    expect(lightBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('should call setTheme(true) when clicking dark button', async () => {
    const setTheme = vi.fn();
    vi.doMock('../../../src/stores/theme.store', () => ({
      useThemeStore: () => ({ isDark: false, setTheme }),
    }));
    const { ToggleTheme } = await import('../../../src/components/layout/ToggleTheme');
    render(<ToggleTheme />);
    const darkBtn = screen.getByRole('radio', { name: /dark/i });
    fireEvent.click(darkBtn);
    expect(setTheme).toHaveBeenCalledWith(true);
  });

  test('should call setTheme(false) when clicking light button', async () => {
    const setTheme = vi.fn();
    vi.doMock('../../../src/stores/theme.store', () => ({
      useThemeStore: () => ({ isDark: true, setTheme }),
    }));
    const { ToggleTheme } = await import('../../../src/components/layout/ToggleTheme');
    render(<ToggleTheme />);
    const lightBtn = screen.getByRole('radio', { name: /light/i });
    fireEvent.click(lightBtn);
    expect(setTheme).toHaveBeenCalledWith(false);
  });

  test('should visually indicate the active theme', async () => {
    // Light active
    vi.doMock('../../../src/stores/theme.store', () => ({
      useThemeStore: () => ({ isDark: false, setTheme: vi.fn() }),
    }));
    const { ToggleTheme } = await import('../../../src/components/layout/ToggleTheme');
    render(<ToggleTheme />);
    let radios = screen.getAllByRole('radio');
    expect(radios[1]).toHaveClass('bg-white'); // Light
    expect(radios[0]).not.toHaveClass('bg-white'); // Dark
    cleanup();
    vi.resetModules();
    // Dark active
    vi.doMock('../../../src/stores/theme.store', () => ({
      useThemeStore: () => ({ isDark: true, setTheme: vi.fn() }),
    }));
    const { ToggleTheme: ToggleThemeDark } = await import(
      '../../../src/components/layout/ToggleTheme'
    );
    render(<ToggleThemeDark />);
    radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveClass('bg-white'); // Dark
    expect(radios[1]).not.toHaveClass('bg-white'); // Light
  });
});
