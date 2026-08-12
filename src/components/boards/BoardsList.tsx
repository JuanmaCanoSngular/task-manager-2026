import { useBoardStore } from '../../stores/board.store';
import { BoardCard } from './BoardCard';
import { AddNewBoardButton } from './AddNewBoardButton';
import { BoardSelectMobile } from './BoardSelectMobile';
import { RemoveBoardMobileButton } from './RemoveBoardMobileButton';
import { CreateTaskButton } from '../tasks/CreateTaskButton';

export const BoardsList = () => {
  const boards = useBoardStore((state) => state.boards);

  return (
    <div className="md:col-span-1 flex flex-col w-full md:w-[250px] h-full">
      {/* Select for mobile */}
      <div className="md:hidden mb-4">
        <BoardSelectMobile />
      </div>

      {/* List of boards for desktop */}
      <div className="hidden md:flex flex-col h-full">
        <nav aria-label="Navegación de tableros">
          <div className="flex flex-col gap-4" role="list">
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
            <AddNewBoardButton />
            <CreateTaskButton />
          </div>
        </nav>
      </div>

      {/* Action buttons for mobile */}
      <div className="md:hidden flex flex-col gap-4">
        <AddNewBoardButton />
        <CreateTaskButton />
        <RemoveBoardMobileButton />
      </div>
    </div>
  );
};
