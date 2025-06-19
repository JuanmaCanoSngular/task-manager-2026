import { useBoardStore } from '../../stores/board.store';

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
        <h1 className="text-3xl font-bold text-center">
          <button
            onClick={handleLogoClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label="Go to home - Tasks Manager App"
          >
            <span className="text-light dark:text-dark">Tasks</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              Manager App
            </span>
          </button>
        </h1>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
};
