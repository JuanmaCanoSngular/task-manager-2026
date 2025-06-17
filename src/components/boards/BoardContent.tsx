import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { StatusColumn } from './StatusColumn';
import { TASK_STATUS, TaskStatus } from '../../interfaces/task.interface';
import { useBoardStore } from '../../stores/board.store';
import { NoBoardSelected } from './NoBoardSelected';

export const BoardContent = () => {
  const currentBoardId = useBoardStore((state) => state.currentBoardId);
  const moveTask = useBoardStore((state) => state.moveTask);
  const updateTaskOrder = useBoardStore((state) => state.updateTaskOrder);

  if (currentBoardId === null) {
    return <NoBoardSelected />;
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const taskId = parseInt(draggableId);
    const sourceStatus = source.droppableId as TaskStatus;
    const destinationStatus = destination.droppableId as TaskStatus;

    if (sourceStatus === destinationStatus) {
      updateTaskOrder(sourceStatus, source.index, destination.index);
    } else {
      moveTask(taskId, destinationStatus, destination.index);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="w-full h-full shadow-xl dark:bg-card-dark rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
          {TASK_STATUS.map((status) => (
            <StatusColumn
              key={status.status}
              status={status.status}
              label={status.label}
              color={status.color}
            />
          ))}
        </div>
      </div>
    </DragDropContext>
  );
};
