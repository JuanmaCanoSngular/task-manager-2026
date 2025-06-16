import { FormEvent, useEffect, useState } from 'react';
import { Task } from '../../../interfaces/task.interface';
import { TASK_STATUS, TASK_TAGS } from '../../../interfaces/task.interface';
import { imageService } from '../../../services/image.service';
import { TaskTitle } from './TaskTitle';
import { TaskBackground } from './TaskBackground';
import { TaskStatus } from './TaskStatus';
import { TaskTags } from './TaskTags';

type TaskStatus = (typeof TASK_STATUS)[number]['status'];
type TaskTag = (typeof TASK_TAGS)[number]['tag'];

const MAX_TAGS = 4;

interface TaskFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Task>;
  onSubmit: (data: Omit<Task, 'id'>) => void;
  onCancel: () => void;
}

export const TaskForm = ({ mode, initialData, onSubmit, onCancel }: TaskFormProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || TASK_STATUS[0].status);
  const [selectedTags, setSelectedTags] = useState<TaskTag[]>(initialData?.tags || []);
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

  const toggleTag = (tag: TaskTag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
      setShowTagWarning(false);
    } else {
      if (selectedTags.length >= MAX_TAGS) {
        setShowTagWarning(true);
        return;
      }
      setSelectedTags((prev) => [...prev, tag]);
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
        maxTags={MAX_TAGS}
        showWarning={showTagWarning}
        onToggleTag={toggleTag}
      />

      <div className="pt-4 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-add">
          {mode === 'create' ? 'Add Task' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};
