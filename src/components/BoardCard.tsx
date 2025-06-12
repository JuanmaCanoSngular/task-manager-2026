import { Board } from '../interfaces/board.interface';
import { useTaskStore } from '../stores/task.store';

interface BoardCardProps {
  board: Board;
  fetchBoardDetails: (link: string) => void;
}

export const BoardCard = ({ board, fetchBoardDetails }: BoardCardProps) => {
  const { currentBoard } = useTaskStore();
  const isActive = currentBoard && currentBoard.id === board.id;

  return (
    <button
      key={board.id}
      onClick={() => fetchBoardDetails(board.link)}
      className={`text-light dark:text-dark p-4 rounded-xl shadow hover:shadow-md transition-shadow text-left border flex items-center gap-3 ${isActive ? 'border-primary' : 'border-transparent hover:border-primary dark:hover:border-primary-dark'}`}
    >
      <span
        className="flex items-center justify-center w-10 h-10 rounded-full text-xl"
        style={{ backgroundColor: board.color }}
      >
        {board.emoji}
      </span>
      <h2 className="text-xl">{board.name}</h2>
    </button>
  );
};
