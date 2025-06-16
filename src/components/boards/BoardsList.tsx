import { useBoardStore } from '../../stores/board.store';
import { BoardCard } from './BoardCard';
import { AddNewBoardButton } from './AddNewBoardButton';
import { BoardSelect } from './BoardSelect';
import { RemoveBoardMobileButton } from './RemoveBoardMobileButton';

export const BoardsList = () => {
  const boards = useBoardStore((state) => state.boards);

  return (
    <div className="md:col-span-1 flex flex-col w-full md:w-[250px]">
      {/* Select para móvil */}
      <div className="md:hidden mb-4">
        <BoardSelect />
      </div>

      {/* Lista de boards para desktop */}
      <div className="hidden md:flex flex-col gap-4">
        {boards.map((board) => (
          <BoardCard key={board.id} board={board} />
        ))}
        <AddNewBoardButton />
      </div>

      {/* Botones de acción para móvil */}
      <div className="md:hidden flex flex-col gap-4">
        <AddNewBoardButton />
        <RemoveBoardMobileButton />
      </div>
    </div>
  );
};
