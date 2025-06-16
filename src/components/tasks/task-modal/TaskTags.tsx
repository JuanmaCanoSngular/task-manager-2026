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
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {selectedTags.length}/{maxTags} selected
      </span>
    </div>
    {showWarning && (
      <p className="text-sm text-red-600 dark:text-red-400">
        You can select a maximum of {maxTags} tags per task
      </p>
    )}
    <div className="flex flex-wrap gap-2 pt-1">
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
        >
          {tag.label}
        </button>
      ))}
    </div>
  </div>
);
