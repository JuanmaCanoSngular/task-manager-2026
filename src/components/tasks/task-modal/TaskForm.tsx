import { FormEvent, useEffect, useState } from 'react';
import { Task, TaskDraft, TASK_STATUS } from '../../../interfaces/task.interface';
import { MAX_TAGS_PER_TASK } from '../../../interfaces/tag.interface';
import { imageService } from '../../../services/image.service';
import { TaskTitle } from './TaskTitle';
import { TaskBackground } from './TaskBackground';
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
  const [backgroundImage, setBackgroundImage] = useState<string>(initialData?.background || '');
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setStatus(initialData.status || TASK_STATUS[0].status);
      setSelectedTags(initialData.tags || []);
      setBackgroundImage(initialData.background || '');
    }
  }, [initialData]);

  const generateBackground = async () => {
    setIsLoadingImage(true);
    try {
      const imageUrl = await imageService.getTaskBackground(status);
      setBackgroundImage(imageUrl);
    } catch (error) {
      console.error('Error al generar imagen de fondo:', error);
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title,
      status,
      tags: selectedTags,
      background: backgroundImage,
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

      <TaskBackground
        backgroundImage={backgroundImage}
        isLoading={isLoadingImage}
        onGenerate={generateBackground}
        onRemove={() => setBackgroundImage('')}
      />

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
        <button type="submit" className="btn-primary">
          {mode === 'create' ? 'Añadir tarea' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
};
