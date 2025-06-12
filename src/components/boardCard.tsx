import { Board } from '../interfaces/board.interface';

interface BoardCardProps {
  board: Board;
  fetchBoardDetails: (link: string) => void;
}

export const BoardCard = ({ board, fetchBoardDetails }: BoardCardProps) => {
  return (
    <button
      key={board.id}
      onClick={() => fetchBoardDetails(board.link)}
      className="bg-card text-text dark:bg-card-dark dark:text-text-dark p-4 rounded-lg shadow hover:shadow-md transition-shadow text-left border border-transparent hover:border-primary dark:hover:border-primary-dark"
    >
      <h2 className="text-xl font-semibold">{board.name}</h2>
      <p className="text-gray-400 mt-2">Click para ver las tareas</p>
    </button>
  );
};
