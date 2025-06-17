import { useBoardStore } from '../../stores/board.store';

export const NoBoardSelected = () => {
  const boards = useBoardStore((state) => state.boards);
  const fetchBoards = useBoardStore((state) => state.fetchBoards);
  const hasBoards = boards.length > 0;

  const handleReset = () => {
    fetchBoards();
  };

  return (
    <div className="w-full h-full shadow-xl dark:bg-card-dark rounded-lg p-4">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          {hasBoards ? (
            <>
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                Please, select a board
              </h3>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                <span className="hidden md:inline">
                  Choose a board from the sidebar to view its tasks
                </span>
                <span className="md:hidden">
                  Choose a board from the select menu to view its tasks
                </span>
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                No boards available
              </h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                There are no boards to display. Add a new board or restore the initial boards.
              </p>
              <div className="flex justify-center">
                <button onClick={handleReset} className="btn-add">
                  Restore initial boards
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
