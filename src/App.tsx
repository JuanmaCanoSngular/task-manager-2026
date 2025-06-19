import { useEffect } from 'react';
import { useBoardStore } from './stores/board.store';
import { BoardsList } from './components/boards/BoardsList';
import { BoardContent } from './components/boards/BoardContent';
import { Layout } from './components/layout/Layout';
import { ToggleTheme } from './components/layout/ToggleTheme';

const App = () => {
  const error = useBoardStore((state) => state.error);
  const fetchBoards = useBoardStore((state) => state.fetchBoards);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-light dark:bg-background-dark dark:text-dark">
        <p className="text-xl text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <Layout>
      {/* Skip links for keyboard navigation */}
      <div className="absolute -top-40 left-4 z-50 focus-within:top-4">
        <a
          href="#main-content"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <a
          href="#boards-list"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Skip to boards list
        </a>
      </div>

      <div className="flex flex-col p-4 h-full">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <aside id="boards-list" className="flex-shrink-0 md:w-64 md:flex md:flex-col">
            <BoardsList />
          </aside>

          <section id="main-content" className="flex-1">
            <BoardContent />
          </section>
        </div>

        <footer className="flex-shrink-0 md:hidden mt-4">
          <ToggleTheme />
        </footer>
      </div>
    </Layout>
  );
};

export default App;
