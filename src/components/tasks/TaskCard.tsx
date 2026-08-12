import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task, TaskDraft } from '../../interfaces/task.interface';
import { tagChipStyle } from '../../interfaces/tag.interface';
import { TaskModal } from './task-modal/TaskModal';
import { useBoardStore } from '../../stores/board.store';
import { useTagStore } from '../../stores/tag.store';
import { TrashIcon } from '@heroicons/react/20/solid';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { isRecentlyCreated } from '../../utils/relativeTime';
import { TagsManagerDialog } from '../tags/TagsManagerDialog';
import { TaskCardMeta } from './TaskCardMeta';

interface TaskCardProps {
  task: Task;
  index: number;
  dragType?: string;
}

export const TaskCard = ({ task, index, dragType }: TaskCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const updateTask = useBoardStore((state) => state.updateTask);
  const removeTask = useBoardStore((state) => state.removeTask);
  const allTags = useTagStore((state) => state.tags);
  const recent = isRecentlyCreated(task.createdAt);
  const [manageTagsOpen, setManageTagsOpen] = useState(false);
  const tagItems = task.tags
    .map((tagId) => allTags.find((t) => t.id === tagId))
    .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));
  const hasTags = tagItems.length > 0;
  const hasComments = (task.commentCount ?? 0) > 0;

  const handleSubmit = (data: TaskDraft) => {
    updateTask(task.id, data);
    setIsOpen(false);
  };

  const handleDelete = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
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
            aria-label={`Editar tarea: ${task.title}${hasComments ? `, ${task.commentCount} comentarios` : ''}`}
            className={`card-base flex-col relative items-start cursor-pointer hover:-translate-y-0.5 hover:shadow-md group focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset card-move-transition drag-handle p-3 md:p-4 rounded-xl md:rounded-2xl ${
              snapshot.isDragging ? 'card-dragging' : ''
            } ${recent ? 'card-recent' : ''} ${task.background ? 'overflow-hidden' : ''} ${
              hasComments ? 'border-l-[3px] border-l-teal-500/60 dark:border-l-teal-400/50' : ''
            }`}
            style={{
              ...provided.draggableProps.style,
              backgroundColor: 'var(--surface)',
            }}
          >
            <button
              onClick={handleDelete}
              onKeyDown={handleDeleteKeyDown}
              tabIndex={0}
              className="absolute top-2 right-2 z-20 btn-remove opacity-0 group-hover:opacity-100 bg-black/50 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:opacity-100"
              aria-label={`Eliminar tarea: ${task.title}`}
            >
              <TrashIcon className="w-4 h-4 text-white" />
            </button>

            {task.background && (
              <img
                src={task.background}
                alt=""
                className="absolute top-0 left-0 w-full h-28 object-cover rounded-t-xl"
                style={{ zIndex: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className={`relative z-10 w-full min-w-0 ${task.background ? 'mt-24 md:mt-28' : ''}`}>
              <div className={`flex items-start gap-2 min-w-0 ${recent ? 'pl-3' : ''}`}>
                <p className="text-sm leading-snug text-left flex-1 min-w-0">{task.title}</p>
              </div>

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
