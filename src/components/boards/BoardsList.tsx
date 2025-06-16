import { useBoardStore } from '../../stores/board.store';
import { BoardCard } from './BoardCard';
import { AddNewBoardButton } from './AddNewBoardButton';
import { ToggleTheme } from '../layout/ToggleTheme';

export const BoardsList = () => {
  const boards = useBoardStore((state) => state.boards);

  return (
    <div className="md:col-span-1 flex flex-col w-full md:w-[250px]">
      <div className="flex-1 flex flex-col gap-4">
        {boards.map((board) => (
          <BoardCard key={board.id} board={board} />
        ))}
        <AddNewBoardButton />
        <ToggleTheme />
      </div>
    </div>
  );
};
