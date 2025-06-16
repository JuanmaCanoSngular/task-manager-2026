import { useEffect } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/20/solid';
import { useThemeStore } from '../../stores/theme.store';

const getButtonClasses = (active: boolean, pos: 'left' | 'right') =>
  `flex items-center justify-center w-1/2 px-4 py-2 focus:outline-none transition-colors duration-200 ${
    pos === 'left' ? 'rounded-l-lg' : 'rounded-r-lg'
  } ${
    active
      ? 'bg-white text-card-dark'
      : 'bg-transparent text-white hover:bg-white hover:text-card-dark group'
  }`;

export const ToggleTheme = () => {
  const { isDark, setTheme } = useThemeStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setTheme]);

  return (
    <div className="flex bg-card-dark rounded-lg w-full">
      <button
        className={getButtonClasses(isDark, 'left')}
        onClick={() => setTheme(true)}
        aria-pressed={isDark}
      >
        <MoonIcon
          className={`mr-2 w-5 h-5 transition-colors duration-200 ${
            isDark ? 'text-card-dark' : 'text-white group-hover:text-card-dark'
          }`}
        />
        Dark
      </button>
      <button
        className={getButtonClasses(!isDark, 'right')}
        onClick={() => setTheme(false)}
        aria-pressed={!isDark}
      >
        <SunIcon
          className={`mr-2 w-5 h-5 transition-colors duration-200 ${
            !isDark ? 'text-card-dark' : 'text-white group-hover:text-card-dark'
          }`}
        />
        Light
      </button>
    </div>
  );
};
