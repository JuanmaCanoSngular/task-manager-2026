import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const THEME_TRANSITION_MS = 600;

const applyTheme = (isDark: boolean) => {
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
};

const canUseViewTransition = () =>
  typeof document !== 'undefined' &&
  typeof document.startViewTransition === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const applyThemeWithTransition = (isDark: boolean) => {
  if (!canUseViewTransition()) {
    applyTheme(isDark);
    return;
  }

  const transition = document.startViewTransition(() => {
    applyTheme(isDark);
  });

  void transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: ['inset(0 0 100% 0)', 'inset(0)'] },
        {
          pseudoElement: '::view-transition-new(root)',
          duration: THEME_TRANSITION_MS,
        }
      );
    })
    .catch(() => {
      /* transición cancelada o no lista */
    });
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: true,
      toggleTheme: () => {
        const next = !get().isDark;
        applyThemeWithTransition(next);
        set({ isDark: next });
      },
      setTheme: (isDark) => {
        if (get().isDark === isDark) {
          applyTheme(isDark);
          return;
        }
        applyThemeWithTransition(isDark);
        set({ isDark });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
