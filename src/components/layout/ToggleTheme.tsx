import { useEffect } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '../../stores/theme.store';

export const ToggleTheme = () => {
  const { isDark, setTheme } = useThemeStore();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setTheme]);

  return (
    <button
      type="button"
      onClick={() => setTheme(!isDark)}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--text-muted)] shadow-sm shadow-black/10 ring-1 ring-black/5 hover:text-[var(--text)] hover:shadow-md dark:shadow-black/40 dark:ring-white/10 dark:hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 dark:focus:ring-offset-[var(--app-bg)]"
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark ? <SunIcon className="h-5 w-5" aria-hidden /> : <MoonIcon className="h-5 w-5" aria-hidden />}
    </button>
  );
};
