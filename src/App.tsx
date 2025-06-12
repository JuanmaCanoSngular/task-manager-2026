import { useEffect } from 'react';
import { useBoardStore } from './stores/board.store';
import { BoardsList, Layout, BoardContent } from './components';

const App = () => {
  const { isLoading: boardsLoading, error: boardsError, fetchBoards } = useBoardStore();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  if (boardsLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-light dark:bg-background-dark dark:text-dark">
        <p className="text-xl text-gray-400">Cargando boards...</p>
      </div>
    );
  }

  if (boardsError) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-light dark:bg-background-dark dark:text-dark">
        <p className="text-xl text-red-400">Error: {boardsError}</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex flex-col lg:flex-row gap-4 items-start">
        <BoardsList />
        <div className="flex-1 w-full">
          <BoardContent />
        </div>
      </div>
    </Layout>
  );
};

export default App;
