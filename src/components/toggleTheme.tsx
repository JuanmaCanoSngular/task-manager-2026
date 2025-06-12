import { useState, useEffect } from 'react';

export const ToggleTheme = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="flex bg-card dark:bg-card-dark rounded-lg p-1 w-fit border border-primary dark:border-primary-dark">
      <button
        className={`flex items-center px-4 py-2 rounded-l-lg focus:outline-none transition-colors duration-200 ${isDark ? 'bg-primary text-card dark:bg-primary-dark dark:text-card-dark' : 'bg-transparent text-primary dark:text-primary-dark'}`}
        onClick={() => setIsDark(true)}
        aria-pressed={isDark}
      >
        <span className="mr-2">🌙</span> Oscuro
      </button>
      <button
        className={`flex items-center px-4 py-2 rounded-r-lg focus:outline-none transition-colors duration-200 ${!isDark ? 'bg-primary text-card dark:bg-primary-dark dark:text-card-dark' : 'bg-transparent text-primary dark:text-primary-dark'}`}
        onClick={() => setIsDark(false)}
        aria-pressed={!isDark}
      >
        <span className="mr-2">☀️</span> Claro
      </button>
    </div>
  );
};
