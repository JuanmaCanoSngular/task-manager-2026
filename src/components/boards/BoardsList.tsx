import { useBoardStore, useCurrentBoard } from '../../stores/board.store';
import { BoardCard } from './BoardCard';
import { AddNewBoardButton } from './AddNewBoardButton';
import { CreateTaskButton } from '../tasks/CreateTaskButton';
import { isShoppingBoard } from '../../interfaces/board.interface';

export const BoardsList = () => {
  const boards = useBoardStore((state) => state.boards);
  const currentBoard = useCurrentBoard();
  const hideCreateTask = isShoppingBoard(currentBoard);

  return (
    <div className="flex flex-col w-full h-full min-h-0">
      <nav aria-label="Navegación de tableros" className="flex flex-col min-h-0">
        <div className="flex flex-col gap-4" role="list">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
          <AddNewBoardButton />
          {hideCreateTask ? null : <CreateTaskButton />}
        </div>
      </nav>
    </div>
  );
};
