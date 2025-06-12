import { useState, useEffect } from 'react';

const getButtonClasses = (active: boolean, pos: 'left' | 'right') =>
  `flex items-center justify-center w-1/2 px-4 py-2 focus:outline-none transition-colors duration-200 ${
    pos === 'left' ? 'rounded-l-lg' : 'rounded-r-lg'
  } ${
    active
      ? 'bg-white text-card-dark'
      : 'bg-transparent text-white hover:bg-white hover:text-card-dark group'
  }`;

const MoonIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SunIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ToggleTheme = () => {
  const [isDark, setIsDark] = useState(true);

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
      setIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="flex bg-card-dark rounded-lg p-1 w-full">
      <button
        className={getButtonClasses(isDark, 'left')}
        onClick={() => setIsDark(true)}
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
        onClick={() => setIsDark(false)}
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
