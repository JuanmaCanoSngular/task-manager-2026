import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

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

afterEach(() => {
  cleanup();
  vi.resetModules();
});

describe('ToggleTheme', () => {
  test('en modo claro muestra el icono de luna', async () => {
    vi.doMock('../../../src/stores/theme.store', () => ({
      useThemeStore: () => ({ isDark: false, setTheme: vi.fn() }),
    }));
    const { ToggleTheme } = await import('../../../src/components/layout/ToggleTheme');
    render(<ToggleTheme />);
    expect(screen.getByRole('button', { name: /modo oscuro/i })).toBeInTheDocument();
  });

  test('en modo oscuro muestra el icono de sol', async () => {
    vi.doMock('../../../src/stores/theme.store', () => ({
      useThemeStore: () => ({ isDark: true, setTheme: vi.fn() }),
    }));
    const { ToggleTheme } = await import('../../../src/components/layout/ToggleTheme');
    render(<ToggleTheme />);
    expect(screen.getByRole('button', { name: /modo claro/i })).toBeInTheDocument();
  });

  test('al pulsar cambia al tema contrario', async () => {
    const setTheme = vi.fn();
    vi.doMock('../../../src/stores/theme.store', () => ({
      useThemeStore: () => ({ isDark: true, setTheme }),
    }));
    const { ToggleTheme } = await import('../../../src/components/layout/ToggleTheme');
    render(<ToggleTheme />);
    fireEvent.click(screen.getByRole('button', { name: /modo claro/i }));
    expect(setTheme).toHaveBeenCalledWith(false);
  });
});
