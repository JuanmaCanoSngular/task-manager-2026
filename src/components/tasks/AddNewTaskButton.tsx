import { Dialog, Transition, Listbox } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useBoardStore } from '../../stores/board.store';
import { TASK_STATUS, TASK_TAGS } from '../../interfaces/task.interface';
import { ChevronUpDownIcon, CheckIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import { imageService } from '../../services/image.service';

type TaskStatus = (typeof TASK_STATUS)[number]['status'];
type TaskTag = (typeof TASK_TAGS)[number]['tag'];

const MAX_TAGS = 4;

export const AddNewTaskButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TASK_STATUS[0].status);
  const [selectedTags, setSelectedTags] = useState<TaskTag[]>([]);
  const [showTagWarning, setShowTagWarning] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const addNewTask = useBoardStore((state) => state.addNewTask);

  const generateBackground = async () => {
    setIsLoadingImage(true);
    try {
      const imageUrl = await imageService.getTaskBackground(status);
      setBackgroundImage(imageUrl);
    } catch (error) {
      console.error('Error al generar imagen de fondo:', error);
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addNewTask({
      title,
      status,
      tags: selectedTags,
      background: backgroundImage,
    });

    // Reset form
    setTitle('');
    setStatus(TASK_STATUS[0].status);
    setSelectedTags([]);
    setShowTagWarning(false);
    setBackgroundImage('');
    setIsOpen(false);
  };

  const toggleTag = (tag: TaskTag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
      setShowTagWarning(false);
    } else {
      if (selectedTags.length >= MAX_TAGS) {
        setShowTagWarning(true);
        return;
      }
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-add w-full">
        <span>Add new task</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-background/80 dark:bg-background-dark/80" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-card dark:bg-card-dark p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Add New Task
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Task Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:bg-gray-700 sm:text-sm sm:leading-6"
                        placeholder="Enter a descriptive title for your task"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Background Image
                        </label>
                        <button
                          type="button"
                          onClick={generateBackground}
                          disabled={isLoadingImage}
                          className="btn-icon-add"
                          title="Generate new background"
                        >
                          {isLoadingImage ? (
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                          ) : (
                            <PhotoIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {backgroundImage && (
                        <div className="relative h-24 w-full overflow-hidden rounded-lg">
                          <img
                            src={backgroundImage}
                            alt="Task background"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Listbox value={status} onChange={setStatus}>
                        <Listbox.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Status
                        </Listbox.Label>
                        <div className="relative mt-1">
                          <Listbox.Button className="relative w-full cursor-default rounded-lg border-0 py-3 px-4 text-left shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:bg-gray-700 sm:text-sm sm:leading-6">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${TASK_STATUS.find((s) => s.status === status)?.color}`}
                              />
                              <span className="block truncate text-gray-900 dark:text-white">
                                {TASK_STATUS.find((s) => s.status === status)?.label}
                              </span>
                            </div>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                              <ChevronUpDownIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
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
                                        <div
                                          className={`w-3 h-3 rounded-full ${statusOption.color}`}
                                        />
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

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tags
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedTags.length}/{MAX_TAGS} selected
                        </span>
                      </div>
                      {showTagWarning && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          You can select a maximum of {MAX_TAGS} tags per task
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {TASK_TAGS.map((tag) => (
                          <button
                            key={tag.tag}
                            type="button"
                            onClick={() => toggleTag(tag.tag)}
                            className={`tag-base ${
                              selectedTags.includes(tag.tag)
                                ? `${tag.bgColor} ${tag.textColor}`
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {tag.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-add">
                        Add Task
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
