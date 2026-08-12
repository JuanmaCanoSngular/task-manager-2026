import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { BoardColumn } from '../../../interfaces/column.interface';

interface TaskColumnSelectProps {
  columns: BoardColumn[];
  value: number;
  onChange: (columnId: number) => void;
}

export const TaskColumnSelect = ({ columns, value, onChange }: TaskColumnSelectProps) => {
  const selected = columns.find((c) => c.id === value) ?? columns[0];

  return (
    <Listbox value={value} onChange={onChange}>
      <Listbox.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Columna
      </Listbox.Label>
      <div className="relative mt-1">
        <Listbox.Button className="relative w-full cursor-default rounded-lg border-0 py-3 pl-4 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-teal-500 dark:bg-gray-800 sm:text-sm sm:leading-6">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: selected?.color ?? '#64748b' }}
              aria-hidden
            />
            <span className="block truncate text-gray-900 dark:text-white">
              {selected?.name ?? 'Selecciona una columna'}
            </span>
          </div>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {columns.map((col) => (
              <Listbox.Option
                key={col.id}
                value={col.id}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active
                      ? 'bg-teal-100 dark:bg-teal-900 text-teal-900 dark:text-teal-100'
                      : 'text-gray-900 dark:text-white'
                  }`
                }
              >
                {({ selected: isSelected }) => (
                  <>
                    <span
                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                        isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-transparent'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: col.color }}
                        aria-hidden
                      />
                    </span>
                    <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
                      {col.name}
                    </span>
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};
