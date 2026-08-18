import { ShoppingCartIcon, ViewColumnsIcon } from '@heroicons/react/24/outline';
import { BoardKind } from '../../../interfaces/board.interface';

interface BoardKindPickerProps {
  value: BoardKind;
  onChange: (kind: BoardKind) => void;
}

const OPTIONS: {
  kind: BoardKind;
  title: string;
  description: string;
  Icon: typeof ViewColumnsIcon;
}[] = [
  {
    kind: 'kanban',
    title: 'Kanban',
    description: 'Columnas tipo pendiente, en progreso y completada.',
    Icon: ViewColumnsIcon,
  },
  {
    kind: 'shopping',
    title: 'Lista de la compra',
    description: 'Artículos con deslizar: comprado o descartado.',
    Icon: ShoppingCartIcon,
  },
];

export const BoardKindPicker = ({ value, onChange }: BoardKindPickerProps) => (
  <fieldset>
    <legend className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
      Tipo de tablero
    </legend>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {OPTIONS.map(({ kind, title, description, Icon }) => {
        const selected = value === kind;
        return (
          <label
            key={kind}
            className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors ${
              selected
                ? 'border-teal-500 bg-teal-50 dark:border-teal-400 dark:bg-teal-950/40'
                : 'border-gray-200 hover:border-teal-300 dark:border-gray-700 dark:hover:border-teal-700'
            }`}
          >
            <input
              type="radio"
              name="boardKind"
              value={kind}
              checked={selected}
              onChange={() => onChange(kind)}
              className="sr-only"
            />
            <Icon
              className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                selected ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'
              }`}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
                {title}
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                {description}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  </fieldset>
);
