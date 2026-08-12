import { useRef } from 'react';
import { PlusIcon } from '@heroicons/react/20/solid';
import { APP_COLOR_PRESETS } from '../../constants/color-presets';
import { colorsEqual, isPresetColor, normalizeHex } from '../../utils/color';

type ColorPickerSize = 'xs' | 'sm' | 'md';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presets?: readonly string[];
  size?: ColorPickerSize;
  /** Etiqueta visible encima del selector */
  label?: string;
  /** Para radiogroup / group sin label visible */
  ariaLabel?: string;
}

const swatchSize: Record<ColorPickerSize, string> = {
  xs: 'w-5 h-5',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
};

const iconSize: Record<ColorPickerSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
};

export const ColorPicker = ({
  value,
  onChange,
  presets = APP_COLOR_PRESETS,
  size = 'md',
  label,
  ariaLabel,
}: ColorPickerProps) => {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const normalizedValue = normalizeHex(value);
  const customSelected = !isPresetColor(normalizedValue, presets);

  const selectedRing =
    'ring-2 ring-offset-2 ring-teal-500 scale-110 dark:ring-offset-gray-800';
  const baseSwatch = `${swatchSize[size]} rounded-full transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800`;

  const handleCustomPick = () => {
    colorInputRef.current?.click();
  };

  const group = (
    <div
      role={label ? undefined : 'group'}
      aria-label={label ? undefined : ariaLabel}
      className="flex flex-wrap gap-2"
    >
      {presets.map((preset) => {
        const selected = colorsEqual(normalizedValue, preset);
        return (
          <button
            key={preset}
            type="button"
            role={label ? 'radio' : undefined}
            aria-checked={label ? selected : undefined}
            aria-label={`Color ${preset}`}
            aria-pressed={!label ? selected : undefined}
            onClick={() => onChange(preset)}
            className={`${baseSwatch} ${selected ? selectedRing : 'hover:scale-105'}`}
            style={{ backgroundColor: preset }}
          />
        );
      })}

      <button
        type="button"
        onClick={handleCustomPick}
        aria-label="Elegir color personalizado"
        aria-pressed={customSelected}
        className={`${baseSwatch} relative flex items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-500 ${
          customSelected ? selectedRing : 'hover:scale-105 hover:border-teal-500'
        }`}
        style={customSelected ? { backgroundColor: normalizedValue } : undefined}
      >
        {!customSelected && (
          <PlusIcon className={`${iconSize[size]} text-gray-500 dark:text-gray-400`} aria-hidden />
        )}
      </button>

      <input
        ref={colorInputRef}
        type="color"
        value={normalizedValue}
        onChange={(e) => onChange(normalizeHex(e.target.value))}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />
    </div>
  );

  if (!label) return group;

  return (
    <div>
      <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        {label}
      </span>
      <div role="radiogroup" aria-label={label}>
        {group}
      </div>
    </div>
  );
};
