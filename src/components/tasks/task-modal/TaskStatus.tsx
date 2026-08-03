import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { TASK_STATUS } from '../../../interfaces/task.interface';

type TaskStatus = (typeof TASK_STATUS)[number]['status'];

interface TaskStatusProps {
  value: TaskStatus;
  onChange: (value: TaskStatus) => void;
}

export const TaskStatus = ({ value, onChange }: TaskStatusProps) => (
  <div className="space-y-2">
    <Listbox value={value} onChange={onChange}>
      <Listbox.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Estado
      </Listbox.Label>
      <div className="relative mt-1">
        <Listbox.Button className="input-base relative cursor-default text-left">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${TASK_STATUS.find((s) => s.status === value)?.color}`}
            />
            <span className="block truncate text-gray-900 dark:text-white">
              {TASK_STATUS.find((s) => s.status === value)?.label ?? 'Selecciona un estado'}
            </span>
          </div>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
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
            {TASK_STATUS.map((statusOption) => (
              <Listbox.Option
                key={statusOption.status}
                className={({ active }) =>
                  `relative cursor-default select-none py-3 pl-10 pr-4 ${
                    active
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100'
                      : 'text-gray-900 dark:text-white'
                  }`
                }
                value={statusOption.status}
              >
                {({ selected }) => (
                  <div className="flex items-center">
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-indigo-600 dark:text-indigo-400">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${statusOption.color}`} />
                      <span
                        className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                      >
                        {statusOption.label}
                      </span>
                    </div>
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  </div>
);
