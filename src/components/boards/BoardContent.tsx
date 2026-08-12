import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  DragStart,
  DragUpdate,
} from '@hello-pangea/dnd';
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { StatusColumn } from './StatusColumn';
import { useBoardStore, useCurrentBoardColumns } from '../../stores/board.store';
import { NoBoardSelected } from './NoBoardSelected';
import { ColumnsManagerButton } from '../columns/ColumnsManagerButton';
import { useState } from 'react';

const COLUMN_DND_TYPE = 'COLUMN';
const TASK_DND_TYPE = 'TASK';

const columnDraggableId = (columnId: number) => `column-${columnId}`;

const isColumnDrag = (draggableId: string) => draggableId.startsWith('column-');

const isColumnShiftPreview = (index: number, sourceIndex: number, destinationIndex: number) => {
  if (sourceIndex === destinationIndex) return false;
  if (sourceIndex < destinationIndex) return index > sourceIndex && index <= destinationIndex;
  return index >= destinationIndex && index < sourceIndex;
};

export const BoardContent = () => {
  const currentBoardId = useBoardStore((state) => state.currentBoardId);
  const columns = useCurrentBoardColumns();
  const moveTask = useBoardStore((state) => state.moveTask);
  const updateTaskOrder = useBoardStore((state) => state.updateTaskOrder);
  const reorderColumns = useBoardStore((state) => state.reorderColumns);
  const [columnDragState, setColumnDragState] = useState<{
    sourceIndex: number;
    destinationIndex: number;
  } | null>(null);

  if (currentBoardId === null) {
    return <NoBoardSelected />;
  }

  const scrollColumns = columns.length > 4;
  const columnShellClass = scrollColumns
    ? 'w-56 flex-shrink-0 snap-start'
    : 'flex-1 min-w-[11rem] basis-0 max-w-md';

  const handleDragStart = (start: DragStart) => {
    if (start.type === COLUMN_DND_TYPE) {
      setColumnDragState({
        sourceIndex: start.source.index,
        destinationIndex: start.source.index,
      });
    }
  };

  const handleDragUpdate = (update: DragUpdate) => {
    if (update.type === COLUMN_DND_TYPE && update.destination) {
      setColumnDragState({
        sourceIndex: update.source.index,
        destinationIndex: update.destination.index,
      });
    }
  };

  const handleDragEnd = (result: DropResult) => {
    setColumnDragState(null);

    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    if (type === COLUMN_DND_TYPE || isColumnDrag(draggableId)) {
      reorderColumns(currentBoardId, source.index, destination.index);
      return;
    }

    const taskId = parseInt(draggableId, 10);
    const sourceColumnId = parseInt(source.droppableId, 10);
    const destinationColumnId = parseInt(destination.droppableId, 10);

    if (sourceColumnId === destinationColumnId) {
      updateTaskOrder(sourceColumnId, source.index, destination.index);
    } else {
      moveTask(taskId, destinationColumnId, destination.index);
    }
  };

  return (
    <DragDropContext
      onDragStart={handleDragStart}
      onDragUpdate={handleDragUpdate}
      onDragEnd={handleDragEnd}
    >
      <div
        className="w-full h-full min-w-0 min-h-0 rounded-2xl p-4 md:p-5 flex flex-col gap-4 overflow-hidden"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="flex justify-end flex-shrink-0">
          <ColumnsManagerButton boardId={currentBoardId} />
        </div>

        <Droppable droppableId="board-columns" direction="horizontal" type={COLUMN_DND_TYPE}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-4 md:gap-5 flex-1 min-h-0 min-w-0 overflow-x-auto overflow-y-hidden pb-1 snap-x snap-mandatory"
              data-testid="board-columns-scroll"
            >
              {columns.map((column, index) => (
                <Draggable
                  key={column.id}
                  draggableId={columnDraggableId(column.id)}
                  index={index}
                  {...({ type: COLUMN_DND_TYPE } as object)}
                >
                  {(colProvided, colSnapshot) => {
                    const isColumnDragging = columnDragState !== null;
                    const isDropTarget =
                      isColumnDragging &&
                      columnDragState.destinationIndex === index &&
                      columnDragState.sourceIndex !== columnDragState.destinationIndex;
                    const isShiftPreview =
                      isColumnDragging &&
                      !colSnapshot.isDragging &&
                      !isDropTarget &&
                      isColumnShiftPreview(
                        index,
                        columnDragState.sourceIndex,
                        columnDragState.destinationIndex
                      );

                    return (
                      <div
                        ref={colProvided.innerRef}
                        {...colProvided.draggableProps}
                        style={colProvided.draggableProps.style}
                        className={`${columnShellClass} h-full flex flex-col rounded-xl p-1 transition-all duration-200 ${
                          colSnapshot.isDragging ? 'column-dragging' : ''
                        } ${isDropTarget ? 'drop-zone-active' : ''} ${
                          isShiftPreview ? 'column-shift-preview' : ''
                        }`}
                      >
                        <StatusColumn
                          column={column}
                          dragHandleProps={
                            colProvided.dragHandleProps as DraggableProvidedDragHandleProps | null
                          }
                          taskDndType={TASK_DND_TYPE}
                          isColumnDragging={isColumnDragging}
                        />
                      </div>
                    );
                  }}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};
