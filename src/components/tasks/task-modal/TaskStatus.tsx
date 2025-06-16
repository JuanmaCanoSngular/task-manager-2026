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
        Status
      </Listbox.Label>
      <div className="relative mt-1">
        <Listbox.Button className="relative w-full cursor-default rounded-lg border-0 py-3 px-4 text-left shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:bg-gray-700 sm:text-sm sm:leading-6">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${TASK_STATUS.find((s) => s.status === value)?.color}`}
            />
            <span className="block truncate text-gray-900 dark:text-white">
              {TASK_STATUS.find((s) => s.status === value)?.label}
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
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'text-gray-900 dark:text-white'
                  }`
                }
                value={statusOption.status}
              >
                {({ selected }) => (
                  <div className="flex items-center">
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-blue-600 dark:text-blue-400">
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
