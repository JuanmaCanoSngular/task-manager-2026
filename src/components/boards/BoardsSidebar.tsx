import { useEffect, useState } from 'react';
import { BoardsList } from './BoardsList';

const STORAGE_KEY = 'taskblero-boards-sidebar';

const readCollapsed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

/** Icono de panel lateral (rail + lienzo). Gira al plegar. */
const SidebarPanelIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="boards-sidebar__icon w-5 h-5" aria-hidden>
    <rect
      x="3.6"
      y="4.6"
      width="16.8"
      height="14.8"
      rx="2.4"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <rect
      className="boards-sidebar__rail"
      x="3.6"
      y="4.6"
      width="5.2"
      height="14.8"
      rx="2.4"
      fill="currentColor"
    />
    <path d="M8.8 5v14" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

/** Columna de tableros: plegable en tablet y escritorio. */
export const BoardsSidebar = () => {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  return (
    <aside
      id="boards-list"
      className={`boards-sidebar flex-shrink-0 min-w-0 min-h-0 flex flex-col overflow-hidden ${
        collapsed ? 'boards-sidebar--collapsed md:w-12' : 'md:w-64'
      }`}
    >
      <div className="hidden md:flex items-center justify-end mb-2 min-h-9 relative">
        <span className="absolute left-0 inset-y-0 flex items-center pointer-events-none">
          <span className="boards-sidebar__label text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)] whitespace-nowrap">
            Tableros
          </span>
        </span>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="boards-sidebar__fab relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] focus:outline-none"
          aria-expanded={!collapsed}
          aria-controls="boards-list-nav"
          aria-label={collapsed ? 'Mostrar tableros' : 'Ocultar tableros'}
          title={collapsed ? 'Mostrar tableros' : 'Ocultar tableros'}
        >
          <SidebarPanelIcon />
        </button>
      </div>

      <div id="boards-list-nav" className="boards-sidebar__panel min-h-0 flex-1">
        <BoardsList />
      </div>
    </aside>
  );
};
