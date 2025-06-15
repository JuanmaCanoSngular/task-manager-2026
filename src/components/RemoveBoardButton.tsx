import { useBoardStore } from '../stores/board.store';

export const RemoveBoardButton = () => {
  const removeBoard = useBoardStore((state) => state.removeBoard);

  return (
    <button
      className="bg-red-200 my-2 w-full flex items-center justify-between rounded-lg p-4 hover:bg-red-400 transition-colors duration-300"
      onClick={() => removeBoard()}
    >
      <span className="text-sm font-semibold text-red-800">Remove board</span>
      <span className=" text-2xl font-bold text-red-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-trash-2"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      </span>
    </button>
  );
};
