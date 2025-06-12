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
      className={`text-light dark:text-dark p-4 
        rounded-xl shadow-sm transition-shadow text-left flex items-center gap-3
        ${isActive ? 'shadow-pink-500 ' : ' hover:bg-slate-200 dark:hover:bg-card-dark'}`}
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
