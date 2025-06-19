import { useBoardStore, useCurrentBoard } from '../../stores/board.store';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import '../../styles/boards-select.css';

export const BoardSelectMobile = () => {
  const boards = useBoardStore((state) => state.boards);
  const currentBoardId = useBoardStore((state) => state.currentBoardId);
  const currentBoard = useCurrentBoard();
  const fetchBoardDetails = useBoardStore((state) => state.fetchBoardDetails);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const boardId = Number(e.target.value);

    // if the board is not selected, set the current board id to null
    if (boardId === -1) {
      useBoardStore.setState({ currentBoardId: null });
      return;
    }

    const board = boards.find((b) => b.id === boardId);
    if (board) {
      fetchBoardDetails(board.link, board.id);
    }
  };

  return (
    <div className="relative board-select">
      <label htmlFor="board-select" className="sr-only">
        Select board
      </label>
      <select
        id="board-select"
        value={currentBoardId ?? -1}
        onChange={handleChange}
        aria-label="Select board"
        className={`w-full h-16 pl-4 pr-10 rounded-xl bg-card dark:bg-card-dark border-2 appearance-none cursor-pointer [color:transparent] [text-shadow:0_0_0_transparent] transition-all duration-300
          ${currentBoardId !== null ? 'card-active' : 'border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-400'}`}
      >
        <option value={-1} className="text-light dark:text-dark">
          Select board
        </option>
        {boards.map((board) => (
          <option key={board.id} value={board.id} className="text-light dark:text-dark">
            {board.name}
          </option>
        ))}
      </select>

      <div className="absolute inset-0 pointer-events-none flex items-center px-4">
        {currentBoard ? (
          <>
            <span
              className="flex items-center justify-center w-10 h-10 rounded-full text-xl mr-3"
              style={{ backgroundColor: currentBoard.color }}
              aria-hidden="true"
            >
              {currentBoard.emoji}
            </span>
            <span className="text-xl text-light dark:text-dark">{currentBoard.name}</span>
          </>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">Seleccionar tablero</span>
        )}
      </div>

      {/* arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
        <ChevronDownIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
      </div>
    </div>
  );
};
