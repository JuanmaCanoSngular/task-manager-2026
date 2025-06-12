import { useBoardStore } from '../stores/board.store';
import { useTaskStore } from '../stores/task.store';
import { BoardCard } from './BoardCard';
import { AddNewBoard } from './AddNewBoard';
import { ToggleTheme } from './ToggleTheme';

export const BoardsList = () => {
  const { boards } = useBoardStore();
  const { fetchBoardDetails } = useTaskStore();

  return (
    <div className="md:col-span-1 flex flex-col w-[250px]">
      <div className="flex-1 flex flex-col gap-4">
        {boards.map((board) => (
          <BoardCard key={board.id} board={board} fetchBoardDetails={fetchBoardDetails} />
        ))}
        <AddNewBoard />
        <ToggleTheme />
      </div>
    </div>
  );
};
