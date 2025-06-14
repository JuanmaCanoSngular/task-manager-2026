import { Board } from '../interfaces/board.interface';
import { useBoardStore } from '../stores/board.store';

interface BoardCardProps {
  board: Board;
}

export const BoardCard = ({ board }: BoardCardProps) => {
  const currentBoardId = useBoardStore((state) => state.currentBoardId);
  const fetchBoardDetails = useBoardStore((state) => state.fetchBoardDetails);
  const isActive = currentBoardId === board.id;

  return (
    <button
      key={board.id}
      onClick={() => fetchBoardDetails(board.link)}
      className={`card-base ${isActive ? 'card-active' : 'card-hover'}`}
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
