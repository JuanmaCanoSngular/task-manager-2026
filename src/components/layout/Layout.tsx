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
        <h1
          className="text-3xl font-bold cursor-pointer hover:opacity-80 transition-opacity text-center"
          onClick={handleLogoClick}
        >
          <span className="text-light dark:text-dark">Tasks </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Manager App
          </span>
        </h1>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
};
