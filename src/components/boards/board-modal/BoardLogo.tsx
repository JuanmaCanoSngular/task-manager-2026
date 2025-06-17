import { ArrowPathIcon } from '@heroicons/react/20/solid';

interface LogoOption {
  emoji: string;
  color: string;
}

interface BoardLogoProps {
  logoOptions: LogoOption[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onGenerateNew: () => void;
}

export const BoardLogo = ({
  logoOptions,
  selectedIndex,
  onSelect,
  onGenerateNew,
}: BoardLogoProps) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        Board logo
      </label>
      <button
        type="button"
        onClick={onGenerateNew}
        className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 hover:scale-105"
        title="Generate new logos"
      >
        <ArrowPathIcon className="w-4 h-4" />
      </button>
    </div>

    <div className="flex justify-center">
      <div className="grid grid-cols-5 gap-3 w-full">
        {logoOptions.map((logo, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            className={`relative w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200 shadow-sm hover:shadow-md ${
              selectedIndex === index
                ? 'ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800 scale-110 shadow-lg'
                : 'hover:scale-105'
            }`}
            style={{ backgroundColor: logo.color }}
            title={`Select logo ${index + 1}`}
          >
            {logo.emoji}
          </button>
        ))}
      </div>
    </div>
  </div>
);
