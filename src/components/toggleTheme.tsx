import { useState, useEffect } from 'react';

export const ToggleTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    // Verificar si hay una preferencia guardada
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Si no hay preferencia guardada, usar la preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Actualizar el tema cuando cambie el estado
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="flex bg-card dark:bg-cardDark rounded-lg p-1 w-fit border border-primary dark:border-primaryDark">
      <button
        className={`flex items-center px-4 py-2 rounded-l-lg focus:outline-none transition-colors duration-200 ${isDark ? 'bg-primary text-card dark:bg-primaryDark dark:text-cardDark' : 'bg-transparent text-primary dark:text-primaryDark'}`}
        onClick={() => setIsDark(true)}
        aria-pressed={isDark}
      >
        <span className="mr-2">🌙</span> Oscuro
      </button>
      <button
        className={`flex items-center px-4 py-2 rounded-r-lg focus:outline-none transition-colors duration-200 ${!isDark ? 'bg-primary text-card dark:bg-primaryDark dark:text-cardDark' : 'bg-transparent text-primary dark:text-primaryDark'}`}
        onClick={() => setIsDark(false)}
        aria-pressed={!isDark}
      >
        <span className="mr-2">☀️</span> Claro
      </button>
    </div>
  );
};
