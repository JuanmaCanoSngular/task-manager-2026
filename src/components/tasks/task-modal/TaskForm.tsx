import { FormEvent, useState } from 'react';
import { Task, TaskDraft } from '../../../interfaces/task.interface';
import { MAX_TAGS_PER_TASK } from '../../../interfaces/tag.interface';
import { getInboxColumn } from '../../../interfaces/column.interface';
import { useCurrentBoardColumns } from '../../../stores/board.store';
import { TaskTitle } from './TaskTitle';
import { TaskColumnSelect } from './TaskColumnSelect';
import { TaskTags } from './TaskTags';
import { TaskComments } from './TaskComments';

interface TaskFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Task>;
  onSubmit: (data: TaskDraft) => void;
  onCancel: () => void;
  onManageTags?: () => void;
}

export const TaskForm = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  onManageTags,
}: TaskFormProps) => {
  const columns = useCurrentBoardColumns();
  const inboxColumn = getInboxColumn(columns);
  const defaultColumnId = inboxColumn?.id ?? columns[0]?.id ?? 0;

  const [title, setTitle] = useState(initialData?.title || '');
  const [columnId, setColumnId] = useState(initialData?.columnId ?? defaultColumnId);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [showTagWarning, setShowTagWarning] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !columnId) return;

    onSubmit({
      title: title.trim(),
      columnId,
      tags: selectedTags,
    });
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
      <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
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
      </form>

      {mode === 'edit' && initialData?.id != null && <TaskComments taskId={initialData.id} />}

      <div className="pt-4 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" form="task-form" className="btn-primary" disabled={!title.trim() || !columnId}>
          {mode === 'create' ? 'Añadir tarea' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
};
