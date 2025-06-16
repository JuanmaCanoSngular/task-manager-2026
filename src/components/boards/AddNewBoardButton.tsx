import { useBoardStore } from '../../stores/board.store';
import { PlusCircleIcon } from '@heroicons/react/20/solid';

export const AddNewBoardButton = () => {
  const addNewBoard = useBoardStore((state) => state.addNewBoard);

  return (
    <button onClick={addNewBoard} className="btn-add w-full">
      <h2 className="text-xl">Add new board</h2>
      <span className="flex items-center justify-center w-6 h-6">
        <PlusCircleIcon className="w-6 h-6 text-current" />
      </span>
    </button>
  );
};
