import { TASK_TAGS } from '../../../interfaces/task.interface';

type TaskTag = (typeof TASK_TAGS)[number]['tag'];

interface TaskTagsProps {
  selectedTags: TaskTag[];
  maxTags: number;
  showWarning: boolean;
  onToggleTag: (tag: TaskTag) => void;
}

export const TaskTags = ({ selectedTags, maxTags, showWarning, onToggleTag }: TaskTagsProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Etiquetas</label>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {`${selectedTags.length}/${maxTags} seleccionadas`}
      </span>
    </div>
    {showWarning && (
      <p className="text-sm text-red-600 dark:text-red-400" role="alert">
        {`Puedes seleccionar un máximo de ${maxTags} etiquetas por tarea`}
      </p>
    )}
    <div
      className="flex flex-wrap gap-2 pt-1"
      role="group"
      aria-label="Etiquetas disponibles para la tarea"
    >
      {TASK_TAGS.map((tag) => (
        <button
          key={tag.tag}
          type="button"
          onClick={() => onToggleTag(tag.tag)}
          className={`tag-base ${
            selectedTags.includes(tag.tag)
              ? `${tag.bgColor} ${tag.textColor}`
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          aria-label={`${selectedTags.includes(tag.tag) ? 'Deseleccionar' : 'Seleccionar'} etiqueta ${tag.label}`}
          aria-pressed={selectedTags.includes(tag.tag)}
        >
          {tag.label}
        </button>
      ))}
    </div>
  </div>
);
