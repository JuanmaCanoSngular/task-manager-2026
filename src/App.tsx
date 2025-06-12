import { useEffect } from 'react';
import { useBoardStore } from './stores/board.store';
import { useTaskStore } from './stores/task.store';
import { BoardCard, TaskCard } from './components';
import Layout from './components/Layout';
import { ToggleTheme } from './components/toggleTheme';

const App = () => {
  const { boards, isLoading: boardsLoading, error: boardsError, fetchBoards } = useBoardStore();
  const { currentBoard, fetchBoardDetails, getCurrentBoardInfo } = useTaskStore();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  if (boardsLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Cargando boards...</p>
      </div>
    );
  }

  if (boardsError) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <p className="text-xl text-red-600">Error: {boardsError}</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 flex flex-col">
          <div className="flex-1 flex flex-col gap-4">
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} fetchBoardDetails={fetchBoardDetails} />
            ))}
            <ToggleTheme />
          </div>
        </div>

        <div className="md:col-span-2">
          {currentBoard ? (
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                <pre>{getCurrentBoardInfo()?.name}</pre>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentBoard.tasks?.map((task) => <TaskCard key={task.id} task={task} />)}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Layout>
  );
};

export default App;
