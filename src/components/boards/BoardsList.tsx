import { useBoardStore } from '../../stores/board.store';
import { BoardCard } from './BoardCard';
import { AddNewBoardButton } from './AddNewBoardButton';
import { BoardSelectMobile } from './BoardSelectMobile';
import { RemoveBoardMobileButton } from './RemoveBoardMobileButton';
import { ToggleTheme } from '../layout/ToggleTheme';

export const BoardsList = () => {
  const boards = useBoardStore((state) => state.boards);

  return (
    <div className="md:col-span-1 flex flex-col w-full md:w-[250px]">
      {/* Select for mobile */}
      <div className="md:hidden mb-4">
        <BoardSelectMobile />
      </div>

      {/* List of boards for desktop */}
      <div className="hidden md:flex flex-col gap-4">
        {boards.map((board) => (
          <BoardCard key={board.id} board={board} />
        ))}
        <AddNewBoardButton />
        <ToggleTheme />
      </div>

      {/* Action buttons for mobile */}
      <div className="md:hidden flex flex-col gap-4">
        <AddNewBoardButton />
        <RemoveBoardMobileButton />
      </div>
    </div>
  );
};
