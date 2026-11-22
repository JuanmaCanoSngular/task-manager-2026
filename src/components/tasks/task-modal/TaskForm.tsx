import { FormEvent, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Task, TaskDraft } from '../../../interfaces/task.interface';
import { MAX_TAGS_PER_TASK } from '../../../interfaces/tag.interface';
import { getInboxColumn } from '../../../interfaces/column.interface';
import { useCurrentBoardColumns } from '../../../stores/board.store';
import { TaskTitle } from './TaskTitle';
import { TaskColumnSelect } from './TaskColumnSelect';
import { TaskTags } from './TaskTags';
import { TaskComments, TaskCommentsHandle } from './TaskComments';
import { TaskChecklist, TaskChecklistDraft } from './TaskChecklist';

interface TaskFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Task>;
  onSubmit: (data: TaskDraft) => void;
  onCancel: () => void;
  onManageTags?: () => void;
}

export type TaskFormHandle = {
  /** `true` si se puede cerrar (o el usuario confirma descartar el borrador). */
  confirmClose: () => boolean;
};

const UNSAVED_COMMENT_MSG =
  'Tienes un comentario sin guardar. Si sales ahora, se perderá. ¿Salir de todas formas?';

export const TaskForm = forwardRef<TaskFormHandle, TaskFormProps>(
  ({ mode, initialData, onSubmit, onCancel, onManageTags }, ref) => {
    const columns = useCurrentBoardColumns();
    const inboxColumn = getInboxColumn(columns);
    const defaultColumnId = inboxColumn?.id ?? columns[0]?.id ?? 0;

    const [title, setTitle] = useState(initialData?.title || '');
    const [columnId, setColumnId] = useState(initialData?.columnId ?? defaultColumnId);
    const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
    const [showTagWarning, setShowTagWarning] = useState(false);
    const [checklistItems, setChecklistItems] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const commentsRef = useRef<TaskCommentsHandle>(null);

    useImperativeHandle(ref, () => ({
      confirmClose: () => {
        if (!commentsRef.current?.hasPendingDraft()) return true;
        return window.confirm(UNSAVED_COMMENT_MSG);
      },
    }));

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !columnId || submitting) return;

      setSubmitting(true);
      try {
        if (mode === 'edit') {
          const flushed = await commentsRef.current?.flushPendingDraft();
          if (flushed === false) return;
        }

        onSubmit({
          title: title.trim(),
          columnId,
          tags: selectedTags,
          ...(mode === 'create' && checklistItems.length > 0 ? { checklistItems } : {}),
        });
      } finally {
        setSubmitting(false);
      }
    };

    const handleCancel = () => {
      if (commentsRef.current?.hasPendingDraft()) {
        if (!window.confirm(UNSAVED_COMMENT_MSG)) return;
      }
      onCancel();
    };

    const toggleTag = (tagId: string) => {
      if (selectedTags.includes(tagId)) {
        setSelectedTags((prev) => prev.filter((t) => t !== tagId));
        setShowTagWarning(false);
      } else {
        if (selectedTags.length >= MAX_TAGS_PER_TASK) {
          setShowTagWarning(true);
          return;
        }
        setSelectedTags((prev) => [...prev, tagId]);
      }
    };

    return (
      <div className="mt-6 space-y-6">
        <form id="task-form" onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
          <TaskTitle value={title} onChange={setTitle} />

          {columns.length > 0 && (
            <TaskColumnSelect columns={columns} value={columnId} onChange={setColumnId} />
          )}

          <TaskTags
            selectedTags={selectedTags}
            showWarning={showTagWarning}
            onToggleTag={toggleTag}
            onManage={onManageTags}
          />

          {mode === 'create' ? (
            <TaskChecklistDraft items={checklistItems} onChange={setChecklistItems} />
          ) : null}
        </form>

        {mode === 'edit' && initialData?.id != null ? (
          <>
            <TaskChecklist taskId={initialData.id} />
            <TaskComments ref={commentsRef} taskId={initialData.id} />
          </>
        ) : null}

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={handleCancel} className="btn-secondary" disabled={submitting}>
            Cancelar
          </button>
          <button
            type="submit"
            form="task-form"
            className="btn-primary"
            disabled={!title.trim() || !columnId || submitting}
          >
            {submitting ? 'Guardando…' : mode === 'create' ? 'Añadir tarea' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    );
  }
);

TaskForm.displayName = 'TaskForm';
