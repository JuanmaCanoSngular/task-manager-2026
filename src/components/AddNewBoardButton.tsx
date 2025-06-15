import { useBoardStore } from '../stores/board.store';

export const AddNewBoardButton = () => {
  const addNewBoard = useBoardStore((state) => state.addNewBoard);

  return (
    <button
      onClick={addNewBoard}
      className="text-light dark:text-dark card-hover p-4 text-left flex items-center gap-3 shadow rounded-xl"
    >
      <span className="flex items-center justify-center w-6 h-6">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-light dark:text-dark"
        >
          <circle cx="12" cy="12" r="12" fill="currentColor" />
          <path
            d="M12 7V17"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            className="dark:stroke-light"
          />
          <path
            d="M7 12H17"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            className="dark:stroke-light"
          />
        </svg>
      </span>
      <h2 className="text-xl">Add new board</h2>
    </button>
  );
};
