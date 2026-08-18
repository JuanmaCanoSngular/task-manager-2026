import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task, TaskDraft } from '../../interfaces/task.interface';
import { TaskModal } from './task-modal/TaskModal';
import { useBoardStore } from '../../stores/board.store';
import { useTagStore } from '../../stores/tag.store';
import { TrashIcon } from '@heroicons/react/20/solid';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { PushPinIcon } from '../common/PushPinIcon';
import { isRecentlyCreated } from '../../utils/relativeTime';
import { TagsManagerDialog } from '../tags/TagsManagerDialog';
import { TagChip } from '../tags/TagChip';
import { TaskCardMeta, TaskCommentBadge, TaskChecklistBadge } from './TaskCardMeta';

interface TaskCardProps {
  task: Task;
  index: number;
  dragType?: string;
  columnColor?: string;
  dragDisabled?: boolean;
}

export const TaskCard = ({
  task,
  index,
  dragType,
  columnColor = '#64748b',
  dragDisabled = false,
}: TaskCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const updateTask = useBoardStore((state) => state.updateTask);
  const toggleTaskPinned = useBoardStore((state) => state.toggleTaskPinned);
  const removeTask = useBoardStore((state) => state.removeTask);
  const allTags = useTagStore((state) => state.tags);
  const toggleTagFilter = useTagStore((state) => state.toggleTagFilter);
  const recent = isRecentlyCreated(task.createdAt);
  const [manageTagsOpen, setManageTagsOpen] = useState(false);
  const tagItems = task.tags
    .map((tagId) => allTags.find((t) => t.id === tagId))
    .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));
  const hasTags = tagItems.length > 0;
  const hasComments = (task.commentCount ?? 0) > 0;
  const hasChecklist = (task.checklistTotal ?? 0) > 0;
  const title = (task.title ?? '').trim() || 'Sin título';
  const titleIsFallback = !(task.title ?? '').trim();
  const isPinned = Boolean(task.pinned);
  const hasExtra = hasTags || Boolean(task.createdAt);

  const handleSubmit = (data: TaskDraft) => {
    updateTask(task.id, data);
    setIsOpen(false);
  };

  const handleDelete = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleTogglePin = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    toggleTaskPinned(task.id);
  };

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleDeleteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDelete(e);
    }
  };

  const handlePinKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTogglePin(e);
    }
  };

  return (
    <>
      <Draggable
        draggableId={task.id.toString()}
        index={index}
        isDragDisabled={dragDisabled}
        {...(dragType ? ({ type: dragType } as object) : {})}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="listitem"
            aria-label={`Editar tarea: ${title}${isPinned ? ', destacada' : ''}${hasComments ? `, ${task.commentCount} comentarios` : ''}`}
            className={`task-card group relative rounded-xl text-left px-3 py-2.5 md:px-3.5 md:py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset card-move-transition ${
              dragDisabled ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
            } ${snapshot.isDragging ? 'card-dragging' : ''} ${recent ? 'card-recent' : ''}`}
            style={{
              ...provided.draggableProps.style,
              height: 'auto',
              backgroundColor: isPinned
                ? `color-mix(in srgb, ${columnColor} 12%, var(--surface))`
                : 'var(--surface)',
              border: isPinned ? `2px solid ${columnColor}` : '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
              color: 'var(--text)',
            }}
          >
            <button
              type="button"
              onClick={handleDelete}
              onKeyDown={handleDeleteKeyDown}
              tabIndex={0}
              className="task-card__action task-card__action--danger top-1.5 right-7 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
              aria-label={`Eliminar tarea: ${title}`}
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleTogglePin}
              onKeyDown={handlePinKeyDown}
              tabIndex={0}
              className={`absolute z-30 top-1.5 right-1 flex h-6 w-6 items-center justify-center rounded-md bg-transparent shadow-none focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:opacity-100 ${
                isPinned
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
              }`}
              style={{ color: columnColor }}
              aria-label={isPinned ? `Desanclar tarea: ${title}` : `Anclar tarea: ${title}`}
              aria-pressed={isPinned}
              title={isPinned ? 'Desanclar' : 'Anclar arriba'}
            >
              <PushPinIcon className="w-3 h-3" />
            </button>

            <div className={`flex items-start gap-1.5 min-w-0 pr-14 ${recent ? 'pl-3' : ''}`}>
              {hasComments ? <TaskCommentBadge task={task} /> : null}
              {hasChecklist ? <TaskChecklistBadge task={task} /> : null}
              <p
                className={`min-w-0 flex-1 text-sm leading-5 line-clamp-2 ${
                  titleIsFallback ? 'italic text-[var(--text-muted)]' : ''
                }`}
              >
                {title}
              </p>
            </div>

            {hasExtra ? (
              <div className="task-card__extra">
                <div className="task-card__extra-inner">
                  {hasTags && (
                    <div className="mt-1.5 flex flex-wrap gap-1 min-w-0">
                      {tagItems.map((tagInfo) => (
                        <button
                          key={tagInfo.id}
                          type="button"
                          className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTagFilter(tagInfo.id);
                          }}
                          aria-label={`Filtrar por ${tagInfo.name}`}
                        >
                          <TagChip name={tagInfo.name} color={tagInfo.color} />
                        </button>
                      ))}
                    </div>
                  )}
                  <TaskCardMeta task={task} recent={recent} />
                </div>
              </div>
            ) : null}
          </div>
        )}
      </Draggable>

      <TaskModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode="edit"
        task={task}
        onSubmit={handleSubmit}
        onManageTags={() => setManageTagsOpen(true)}
      />

      <TagsManagerDialog open={manageTagsOpen} onClose={() => setManageTagsOpen(false)} />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          removeTask(task.id);
          setIsDeleteDialogOpen(false);
        }}
        title="¿Eliminar tarea?"
        description="¿Seguro que quieres eliminar esta tarea? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
};
