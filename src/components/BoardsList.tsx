import { useBoardStore } from '../stores/board.store';
import { useTaskStore } from '../stores/task.store';
import { BoardCard } from './BoardCard';
import { ToggleTheme } from './ToggleTheme';
import { AddNewBoard } from './AddNewBoard';

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
