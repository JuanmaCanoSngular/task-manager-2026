import { FormEvent, useEffect, useState } from 'react';
import { Task, TaskDraft, TASK_STATUS } from '../../../interfaces/task.interface';
import { MAX_TAGS_PER_TASK } from '../../../interfaces/tag.interface';
import { TaskTitle } from './TaskTitle';
import { TaskImageUrl } from './TaskImageUrl';
import { isValidImageUrl } from '../../../utils/imageUrl';
import { TaskStatus } from './TaskStatus';
import { TaskTags } from './TaskTags';

type Status = (typeof TASK_STATUS)[number]['status'];

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
  const [title, setTitle] = useState(initialData?.title || '');
  const [status, setStatus] = useState<Status>(initialData?.status || TASK_STATUS[0].status);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [showTagWarning, setShowTagWarning] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState(initialData?.background || '');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setStatus(initialData.status || TASK_STATUS[0].status);
      setSelectedTags(initialData.tags || []);
      setBackgroundUrl(initialData.background || '');
    }
  }, [initialData]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!isValidImageUrl(backgroundUrl)) return;

    const background = backgroundUrl.trim();
    onSubmit({
      title,
      status,
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

      <TaskStatus value={status} onChange={setStatus} />

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
        <button type="submit" className="btn-primary" disabled={!isValidImageUrl(backgroundUrl)}>
          {mode === 'create' ? 'Añadir tarea' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
};
