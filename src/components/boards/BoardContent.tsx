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
import { ShoppingBoard } from './shopping/ShoppingBoard';
import {
  useBoardStore,
  useCurrentBoard,
  useCurrentBoardColumns,
  useCurrentBoardTasks,
} from '../../stores/board.store';
import { NoBoardSelected } from './NoBoardSelected';
import { ColumnsManagerButton } from '../columns/ColumnsManagerButton';
import { TagsManagerButton } from '../tags/TagsManagerButton';
import { TagChip } from '../tags/TagChip';
import { useTagStore } from '../../stores/tag.store';
import { taskMatchesTagFilter } from '../../interfaces/tag.interface';
import { isShoppingBoard } from '../../interfaces/board.interface';
import { useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { useScrollOverflow } from '../../hooks/useScrollOverflow';
import { ColumnsOverflowHint } from './ColumnsOverflowHint';

const COLUMN_DND_TYPE = 'COLUMN';

const parseTaskDroppable = (
  id: string
): { columnId: number; zone: 'pinned' | 'unpinned' } | null => {
  const [col, zone] = id.split(':');
  if (zone !== 'pinned' && zone !== 'unpinned') return null;
  const columnId = Number.parseInt(col, 10);
  if (Number.isNaN(columnId)) return null;
  return { columnId, zone };
};

const columnIndexInZone = (
  columnId: number,
  zone: 'pinned' | 'unpinned',
  zoneIndex: number
): number => {
  const boardId = useBoardStore.getState().currentBoardId;
  const board = useBoardStore.getState().boards.find((b) => b.id === boardId);
  const pinnedCount =
    board?.tasks.filter((task) => task.columnId === columnId && task.pinned).length ?? 0;
  return zone === 'pinned' ? zoneIndex : pinnedCount + zoneIndex;
};

const columnDraggableId = (columnId: number) => `column-${columnId}`;

const isColumnDrag = (draggableId: string) => draggableId.startsWith('column-');

const isColumnShiftPreview = (index: number, sourceIndex: number, destinationIndex: number) => {
  if (sourceIndex === destinationIndex) return false;
  if (sourceIndex < destinationIndex) return index > sourceIndex && index <= destinationIndex;
  return index >= destinationIndex && index < sourceIndex;
};

export const BoardContent = () => {
  const currentBoardId = useBoardStore((state) => state.currentBoardId);
  const board = useCurrentBoard();
  const columns = useCurrentBoardColumns();
  const boardTasks = useCurrentBoardTasks();
  const tags = useTagStore((state) => state.tags);
  const filterTagIds = useTagStore((state) => state.filterTagIds);
  const toggleTagFilter = useTagStore((state) => state.toggleTagFilter);
  const clearTagFilter = useTagStore((state) => state.clearTagFilter);
  const moveTask = useBoardStore((state) => state.moveTask);
  const updateTaskOrder = useBoardStore((state) => state.updateTaskOrder);
  const reorderColumns = useBoardStore((state) => state.reorderColumns);
  const [columnDragState, setColumnDragState] = useState<{
    sourceIndex: number;
    destinationIndex: number;
  } | null>(null);
  const [tagsOpen, setTagsOpen] = useState(false);
  const columnsScrollRef = useRef<HTMLDivElement | null>(null);
  const { canScrollLeft, canScrollRight, scrollByPage } = useScrollOverflow(
    columnsScrollRef,
    columns.length
  );
  const filtering = filterTagIds.length > 0;
  const totalTasks = boardTasks.length;
  const visibleTasks = filtering
    ? boardTasks.filter((task) => taskMatchesTagFilter(task.tags, filterTagIds)).length
    : totalTasks;

  if (currentBoardId === null) {
    return <NoBoardSelected />;
  }

  if (board && isShoppingBoard(board)) {
    return <ShoppingBoard board={board} />;
  }

  const overflowColumns = columns.length > 3;

  const columnsScrollClass = overflowColumns
    ? 'overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth'
    : 'overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth md:overflow-x-hidden md:w-full';

  const columnShellClass = overflowColumns
    ? 'w-full min-w-full flex-shrink-0 snap-center md:w-[calc((100%-2.5rem)/3)] md:min-w-[calc((100%-2.5rem)/3)] md:snap-start 2xl:w-[calc((100%-3.75rem)/4)] 2xl:min-w-[calc((100%-3.75rem)/4)]'
    : 'w-full min-w-full flex-shrink-0 snap-center md:flex-1 md:min-w-0 md:max-w-none md:basis-0';

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
    const from = parseTaskDroppable(source.droppableId);
    const to = parseTaskDroppable(destination.droppableId);
    if (!from || !to) return;

    const sourceIndex = columnIndexInZone(from.columnId, from.zone, source.index);
    const destinationIndex = columnIndexInZone(to.columnId, to.zone, destination.index);

    if (from.columnId === to.columnId) {
      updateTaskOrder(from.columnId, sourceIndex, destinationIndex);
    } else {
      moveTask(taskId, to.columnId, destinationIndex);
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
        <div className="flex items-center justify-between gap-3 flex-shrink-0 min-w-0">
          <div className="min-w-0 flex-1 flex items-center gap-2.5 flex-wrap">
            {board ? (
              <h2
                className="flex h-7 min-w-0 max-w-full items-center"
                style={{ color: board.color }}
              >
                <span className="truncate text-lg md:text-xl font-semibold tracking-tight leading-none">
                  {board.name}
                </span>
              </h2>
            ) : null}
            {tags.length > 0 ? (
              <ul
                className="flex flex-wrap items-center gap-1.5 min-w-0"
                aria-label="Filtrar por etiqueta"
              >
                {tags.map((tag) => {
                  const selected = filterTagIds.includes(tag.id);
                  const dimOthers = filtering && !selected;
                  return (
                    <li key={tag.id} className={dimOthers ? 'opacity-40' : undefined}>
                      <button
                        type="button"
                        onClick={() => toggleTagFilter(tag.id)}
                        className="inline-flex h-7 items-center rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                        aria-pressed={selected}
                        aria-label={
                          selected ? `Quitar filtro ${tag.name}` : `Filtrar por ${tag.name}`
                        }
                        title={selected ? `Quitar filtro ${tag.name}` : `Filtrar por ${tag.name}`}
                      >
                        <TagChip
                          name={tag.name}
                          color={tag.color}
                          active={!dimOthers}
                          selected={selected}
                          className="h-7"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            {filtering ? (
              <p
                className="m-0 flex h-7 items-center text-[11px] font-medium leading-none text-teal-700 dark:text-teal-400 whitespace-nowrap"
                aria-live="polite"
              >
                Filtrando {visibleTasks} {visibleTasks === 1 ? 'tarea' : 'tareas'} de un total de{' '}
                {totalTasks}
              </p>
            ) : null}
            {filtering ? (
              <button
                type="button"
                onClick={clearTagFilter}
                className="inline-flex h-7 items-center gap-0.5 rounded-md px-1.5 text-[11px] font-semibold leading-none text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                aria-label="Quitar filtros de etiqueta"
              >
                <XMarkIcon className="w-3.5 h-3.5" aria-hidden />
                Quitar
              </button>
            ) : null}
            <TagsManagerButton open={tagsOpen} onOpenChange={setTagsOpen} />
          </div>
          <ColumnsManagerButton boardId={currentBoardId} />
        </div>

        <Droppable droppableId="board-columns" direction="horizontal" type={COLUMN_DND_TYPE}>
          {(provided) => (
            <div className="relative flex-1 min-h-0 min-w-0">
              <div
                ref={(node) => {
                  columnsScrollRef.current = node;
                  provided.innerRef(node);
                }}
                {...provided.droppableProps}
                className={`board-columns-scroll flex gap-3 md:gap-5 flex-1 min-h-0 min-w-0 h-full pb-2 ${columnsScrollClass}`}
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
                            isColumnDragging={isColumnDragging}
                          />
                        </div>
                      );
                    }}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
              <ColumnsOverflowHint
                canScrollLeft={canScrollLeft}
                canScrollRight={canScrollRight}
                onScrollLeft={() => scrollByPage(-1)}
                onScrollRight={() => scrollByPage(1)}
              />
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};
