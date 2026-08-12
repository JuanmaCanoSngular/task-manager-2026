import { FormEvent, useEffect, useState } from 'react';
import { Task, TaskDraft } from '../../../interfaces/task.interface';
import { MAX_TAGS_PER_TASK } from '../../../interfaces/tag.interface';
import { getInboxColumn } from '../../../interfaces/column.interface';
import { useCurrentBoardColumns } from '../../../stores/board.store';
import { TaskTitle } from './TaskTitle';
import { TaskImageUrl } from './TaskImageUrl';
import { isValidImageUrl } from '../../../utils/imageUrl';
import { TaskColumnSelect } from './TaskColumnSelect';
import { TaskTags } from './TaskTags';

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
  const [backgroundUrl, setBackgroundUrl] = useState(initialData?.background || '');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setColumnId(initialData.columnId ?? defaultColumnId);
      setSelectedTags(initialData.tags || []);
      setBackgroundUrl(initialData.background || '');
    }
  }, [initialData, defaultColumnId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !columnId) return;
    if (!isValidImageUrl(backgroundUrl)) return;

    const background = backgroundUrl.trim();
    onSubmit({
      title,
      columnId,
      tags: selectedTags,
      background: background || undefined,
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
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <TaskTitle value={title} onChange={setTitle} />

      <TaskImageUrl value={backgroundUrl} onChange={setBackgroundUrl} />

      {columns.length > 0 && (
        <TaskColumnSelect columns={columns} value={columnId} onChange={setColumnId} />
      )}

      <TaskTags
        selectedTags={selectedTags}
        showWarning={showTagWarning}
        onToggleTag={toggleTag}
        onManage={onManageTags}
      />

      <div className="pt-4 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={!isValidImageUrl(backgroundUrl) || !columnId}
        >
          {mode === 'create' ? 'Añadir tarea' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
};
