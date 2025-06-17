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
      <div className="flex flex-col p-4 h-full">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <aside className="flex-shrink-0 md:w-64 md:flex md:flex-col">
            <BoardsList />
          </aside>

          <section className="flex-1">
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
