import { MAX_TAGS_PER_TASK, tagChipStyle } from '../../../interfaces/tag.interface';
import { useTagStore } from '../../../stores/tag.store';

interface TaskTagsProps {
  selectedTags: string[];
  showWarning: boolean;
  onToggleTag: (tagId: string) => void;
  onManage?: () => void;
}

export const TaskTags = ({ selectedTags, showWarning, onToggleTag, onManage }: TaskTagsProps) => {
  const tags = useTagStore((s) => s.tags);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Etiquetas
        </label>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedTags.length === 0
              ? `Máx. ${MAX_TAGS_PER_TASK}`
              : `${selectedTags.length}/${MAX_TAGS_PER_TASK}`}
          </span>
          {onManage && (
            <button
              type="button"
              onClick={onManage}
              className="text-sm font-medium text-teal-700 dark:text-teal-400 hover:underline"
            >
              Gestionar
            </button>
          )}
        </div>
      </div>
      {showWarning && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {`Puedes seleccionar un máximo de ${MAX_TAGS_PER_TASK} etiquetas por tarea`}
        </p>
      )}
      {tags.length === 0 ? (
        <p className="text-sm opacity-70">
          No hay etiquetas.{' '}
          {onManage ? (
            <button type="button" onClick={onManage} className="underline text-teal-700 dark:text-teal-400">
              Crear una
            </button>
          ) : null}
        </p>
      ) : (
        <div
          className="flex flex-wrap gap-2 pt-1"
          role="group"
          aria-label="Etiquetas disponibles para la tarea"
        >
          {tags.map((tag) => {
            const selected = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onToggleTag(tag.id)}
                className={`tag-base ${
                  selected
                    ? ''
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                style={tagChipStyle(tag.color, selected)}
                aria-label={`${selected ? 'Deseleccionar' : 'Seleccionar'} etiqueta ${tag.name}`}
                aria-pressed={selected}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                  style={{ backgroundColor: tag.color }}
                  aria-hidden
                />
                {tag.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
