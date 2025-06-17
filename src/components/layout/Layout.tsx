import { useBoardStore } from '../../stores/board.store';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const handleLogoClick = () => {
    useBoardStore.setState({ currentBoardId: null });
  };

  return (
    <div className="h-screen flex flex-col text-light dark:text-dark transition-colors duration-300">
      <header className="flex-shrink-0 p-4">
        <h1 className="text-3xl font-bold text-center">
          <button
            onClick={handleLogoClick}
            className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label="Volver al inicio"
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
