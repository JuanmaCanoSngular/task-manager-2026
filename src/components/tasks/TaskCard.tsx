import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task, TaskDraft } from '../../interfaces/task.interface';
import { tagChipStyle } from '../../interfaces/tag.interface';
import { TaskModal } from './task-modal/TaskModal';
import { useBoardStore } from '../../stores/board.store';
import { useTagStore } from '../../stores/tag.store';
import { TrashIcon } from '@heroicons/react/20/solid';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { PushPinIcon } from '../common/PushPinIcon';
import { isRecentlyCreated } from '../../utils/relativeTime';
import { TagsManagerDialog } from '../tags/TagsManagerDialog';
import { TaskCardMeta } from './TaskCardMeta';

interface TaskCardProps {
  task: Task;
  index: number;
  dragType?: string;
  columnColor?: string;
}

export const TaskCard = ({ task, index, dragType, columnColor = '#64748b' }: TaskCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const updateTask = useBoardStore((state) => state.updateTask);
  const toggleTaskPinned = useBoardStore((state) => state.toggleTaskPinned);
  const removeTask = useBoardStore((state) => state.removeTask);
  const allTags = useTagStore((state) => state.tags);
  const recent = isRecentlyCreated(task.createdAt);
  const [manageTagsOpen, setManageTagsOpen] = useState(false);
  const tagItems = task.tags
    .map((tagId) => allTags.find((t) => t.id === tagId))
    .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));
  const hasTags = tagItems.length > 0;
  const hasComments = (task.commentCount ?? 0) > 0;
  const title = (task.title ?? '').trim() || 'Sin título';
  const titleIsFallback = !(task.title ?? '').trim();
  const isPinned = Boolean(task.pinned);
  const hasExtra = hasTags || hasComments || Boolean(task.createdAt);

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
            className={`task-card group relative cursor-grab active:cursor-grabbing rounded-xl text-left px-3 py-2.5 md:px-3.5 md:py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset card-move-transition ${
              snapshot.isDragging ? 'card-dragging' : ''
            } ${recent ? 'card-recent' : ''}`}
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

            <p
              className={`text-sm leading-snug pr-16 line-clamp-2 ${recent ? 'pl-3' : ''} ${
                titleIsFallback ? 'italic text-[var(--text-muted)]' : ''
              }`}
            >
              {title}
            </p>

            {hasExtra ? (
              <div className="task-card__extra">
                <div className="task-card__extra-inner">
                  {hasTags && (
                    <div className="mt-1.5 flex flex-wrap gap-1 min-w-0">
                      {tagItems.map((tagInfo) => (
                        <span
                          key={tagInfo.id}
                          className="tag-base !px-2 !py-0.5 !text-[11px]"
                          style={tagChipStyle(tagInfo.color, true)}
                        >
                          {tagInfo.name}
                        </span>
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
