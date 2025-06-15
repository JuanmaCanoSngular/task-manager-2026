import { useBoardStore } from '../stores/board.store';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

export const RemoveBoardButton = () => {
  const removeBoard = useBoardStore((state) => state.removeBoard);
  const [isOpen, setIsOpen] = useState(false);

  const handleRemove = () => {
    removeBoard();
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="bg-red-200 my-2 w-full flex items-center justify-between rounded-lg p-4 hover:bg-red-400 transition-colors duration-300"
        onClick={() => setIsOpen(true)}
      >
        <span className="text-sm font-semibold text-red-800">Remove board</span>
        <span className="text-2xl font-bold text-red-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-trash-2"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </span>
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 dark:bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-card-dark p-6 shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-light dark:text-dark"
                  >
                    Remove Board?
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This action cannot be undone. All tasks associated with this board will be
                      deleted.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-md bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-light dark:text-dark hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="rounded-md bg-red-200 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-400 transition-colors duration-300"
                    >
                      Remove
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
