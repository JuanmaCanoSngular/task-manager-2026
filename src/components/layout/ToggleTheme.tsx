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
    <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1 w-full">
      <button
        className={`flex items-center justify-center w-1/2 px-3 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isDark
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
        onClick={() => setTheme(true)}
        aria-pressed={isDark}
        aria-label="Switch to dark mode"
      >
        <MoonIcon className="w-4 h-4 mr-2" />
        Dark
      </button>
      <button
        className={`flex items-center justify-center w-1/2 px-3 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          !isDark
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-600'
        }`}
        onClick={() => setTheme(false)}
        aria-pressed={!isDark}
        aria-label="Switch to light mode"
      >
        <SunIcon className="w-4 h-4 mr-2" />
        Light
      </button>
    </div>
  );
};
