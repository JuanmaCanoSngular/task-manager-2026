import { useBoardStore } from '../../stores/board.store';
import { BoardCard } from './BoardCard';
import { AddNewBoardButton } from './AddNewBoardButton';
import { CreateTaskButton } from '../tasks/CreateTaskButton';

export const BoardsList = () => {
  const boards = useBoardStore((state) => state.boards);

  return (
    <div className="flex flex-col w-full h-full min-h-0">
      <nav aria-label="Navegación de tableros" className="flex flex-col min-h-0">
        <div className="flex flex-col gap-4" role="list">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
          <AddNewBoardButton />
          <CreateTaskButton />
        </div>
      </nav>
    </div>
  );
};
