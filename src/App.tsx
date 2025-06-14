import { useEffect } from 'react';
import { useBoardStore } from './stores/board.store';
import { BoardsList, Layout, BoardContent } from './components';

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
      <div className="grid grid-rows-[auto_1fr] h-[calc(100vh-8rem)] gap-4 lg:grid-cols-[250px_1fr] lg:grid-rows-none">
        <BoardsList />
        <div className="w-full">
          <BoardContent />
        </div>
      </div>
    </Layout>
  );
};

export default App;
