import { BOARD_COLORS } from '../../../interfaces/board.interface';

interface BoardColorProps {
  value: string;
  onChange: (color: string) => void;
}

// Selección del color principal del tablero desde una paleta curada.
export const BoardColor = ({ value, onChange }: BoardColorProps) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
      Color del tablero
    </label>
    <div role="radiogroup" aria-label="Color del tablero" className="flex flex-wrap gap-3">
      {BOARD_COLORS.map((color) => {
        const selected = value.toLowerCase() === color.toLowerCase();
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`Color ${color}`}
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded-full transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
              selected
                ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110 dark:ring-offset-gray-800'
                : 'hover:scale-105'
            }`}
            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  </div>
);
