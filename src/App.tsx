import { useEffect } from 'react';
import { useBoardStore } from './stores/board.store';
import { BoardsList } from './components/boards/BoardsList';
import { BoardContent } from './components/boards/BoardContent';
import { Layout } from './components/layout/Layout';

const App = () => {
  const error = useBoardStore((state) => state.error);
  const fetchBoards = useBoardStore((state) => state.fetchBoards);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-light dark:bg-background-dark dark:text-dark">
        <p className="text-xl text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="grid grid-rows-[auto_1fr] gap-4 md:grid-cols-[250px_1fr] md:grid-rows-none">
        <BoardsList />
        <div className="w-full">
          <BoardContent />
        </div>
      </div>
    </Layout>
  );
};

export default App;
