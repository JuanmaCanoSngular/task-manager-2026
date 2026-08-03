import { useBoardStore } from '../../stores/board.store';
import { ErrorBanner } from '../common/ErrorBanner';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const handleLogoClick = () => {
    useBoardStore.setState({ currentBoardId: null });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLogoClick();
    }
  };

  return (
    <div className="h-screen flex flex-col text-light dark:text-dark transition-colors duration-300">
      <header className="flex-shrink-0 p-4">
        <h1 className="text-2xl font-bold text-center">
          <button
            onClick={handleLogoClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            className="inline-flex items-center gap-2 rounded-xl px-2 py-1 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Ir al inicio"
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-base text-white"
              style={{
                backgroundImage: 'linear-gradient(135deg, var(--brand), var(--brand-2))',
                boxShadow: 'var(--shadow-brand)',
              }}
            >
              ✓
            </span>
            <span style={{ color: 'var(--text)' }}>Gestión de tareas</span>
          </button>
        </h1>
      </header>

      <ErrorBanner />

      <main className="flex-1">{children}</main>
    </div>
  );
};
