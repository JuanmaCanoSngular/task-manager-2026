import { useEffect } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/20/solid';
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
    <div
      className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1 w-full"
      role="radiogroup"
      aria-label="Seleccionar tema de color"
    >
      <button
        className={`flex items-center justify-center w-1/2 px-3 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isDark
            ? 'bg-white text-slate-900 shadow-md border-2 border-blue-500'
            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-2 border-transparent'
        }`}
        onClick={() => setTheme(true)}
        aria-pressed={isDark}
        aria-label="Switch to dark mode"
        role="radio"
      >
        <MoonIcon className="w-4 h-4 mr-2" />
        <span className="font-medium">Dark</span>
      </button>
      <button
        className={`flex items-center justify-center w-1/2 px-3 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          !isDark
            ? 'bg-white text-slate-900 shadow-md border-2 border-blue-500'
            : 'text-slate-300 hover:text-slate-100 hover:bg-slate-600 border-2 border-transparent'
        }`}
        onClick={() => setTheme(false)}
        aria-pressed={!isDark}
        aria-label="Switch to light mode"
        role="radio"
      >
        <SunIcon className="w-4 h-4 mr-2" />
        <span className="font-medium">Light</span>
      </button>
    </div>
  );
};
