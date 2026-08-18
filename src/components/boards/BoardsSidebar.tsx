import { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { BoardsList } from './BoardsList';

const STORAGE_KEY = 'taskblero-boards-sidebar';

const readCollapsed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

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
      className={`flex-shrink-0 min-w-0 min-h-0 flex flex-col transition-[width] duration-200 ease-out ${
        collapsed ? 'md:w-10' : 'md:w-64'
      }`}
    >
      <div className={`hidden md:flex items-center mb-2 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {collapsed ? null : (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Tableros
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          aria-expanded={!collapsed}
          aria-controls="boards-list-nav"
          aria-label={collapsed ? 'Mostrar tableros' : 'Ocultar tableros'}
          title={collapsed ? 'Mostrar tableros' : 'Ocultar tableros'}
        >
          {collapsed ? (
            <ChevronRightIcon className="w-4 h-4" aria-hidden />
          ) : (
            <ChevronLeftIcon className="w-4 h-4" aria-hidden />
          )}
        </button>
      </div>

      <div id="boards-list-nav" className={`min-h-0 flex-1 ${collapsed ? 'md:hidden' : ''}`}>
        <BoardsList />
      </div>
    </aside>
  );
};
