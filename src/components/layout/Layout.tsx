import { useBoardStore } from '../../stores/board.store';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const setCurrentBoard = useBoardStore((state) => state.setCurrentBoard);

  const handleLogoClick = () => {
    setCurrentBoard(null);
  };

  return (
    <main className="min-h-screen flex flex-col bg-background text-light dark:bg-background-dark dark:text-dark p-4 transition-colors duration-300">
      <header className="flex justify-center my-6">
        <h1
          className="text-3xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleLogoClick}
        >
          <span className="text-light dark:text-dark">Tasks </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Manager App
          </span>
        </h1>
      </header>
      <section className="flex-1">{children}</section>
    </main>
  );
};
