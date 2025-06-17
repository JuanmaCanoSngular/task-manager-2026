import { PhotoIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/20/solid';

interface TaskBackgroundProps {
  backgroundImage: string;
  isLoading: boolean;
  onGenerate: () => Promise<void>;
  onRemove: () => void;
}

export const TaskBackground = ({
  backgroundImage,
  isLoading,
  onGenerate,
  onRemove,
}: TaskBackgroundProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Background Image
      </label>
      <div className="flex gap-2">
        {backgroundImage && (
          <button
            type="button"
            onClick={onRemove}
            className="btn-icon-remove"
            aria-label="Remove background image"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading}
          className="btn-icon-add"
          aria-label={
            isLoading ? 'Generating background image...' : 'Generate new background image'
          }
        >
          {isLoading ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
          ) : (
            <PhotoIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
    {backgroundImage && (
      <div className="relative h-24 w-full overflow-hidden rounded-lg">
        <img src={backgroundImage} alt="Task background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
    )}
  </div>
);
