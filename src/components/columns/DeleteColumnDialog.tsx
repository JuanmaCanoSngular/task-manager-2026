import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { BoardColumn } from '../../interfaces/column.interface';
import { TaskColumnSelect } from '../tasks/task-modal/TaskColumnSelect';

interface DeleteColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  column: BoardColumn | null;
  columns: BoardColumn[];
  taskCount: number;
  onConfirm: (options: { moveTasksToColumnId?: number }) => void;
}

type TaskAction = 'move' | 'delete';

export const DeleteColumnDialog = ({
  isOpen,
  onClose,
  column,
  columns,
  taskCount,
  onConfirm,
}: DeleteColumnDialogProps) => {
  const [action, setAction] = useState<TaskAction>('move');
  const [targetColumnId, setTargetColumnId] = useState<number>(0);

  const otherColumns = columns.filter((c) => c.id !== column?.id);
  const defaultTarget =
    otherColumns.find((c) => c.isInbox)?.id ?? otherColumns[0]?.id ?? 0;

  useEffect(() => {
    if (!isOpen) return;
    setAction('move');
    setTargetColumnId(defaultTarget);
  }, [isOpen, defaultTarget]);

  if (!column) return null;

  const hasTasks = taskCount > 0;
  const canConfirmMove = action === 'move' && targetColumnId > 0 && otherColumns.length > 0;
  const confirmDisabled = hasTasks && action === 'move' && !canConfirmMove;

  const handleConfirm = () => {
    if (hasTasks && action === 'move') {
      onConfirm({ moveTasksToColumnId: targetColumnId });
    } else {
      onConfirm({});
    }
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
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
                <Dialog.Title className="text-lg font-medium leading-6 text-light dark:text-dark">
                  ¿Eliminar columna «{column.name}»?
                </Dialog.Title>

                <div className="mt-2 space-y-4">
                  {hasTasks ? (
                    <>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Esta columna tiene {taskCount}{' '}
                        {taskCount === 1 ? 'tarea' : 'tareas'}. ¿Qué quieres hacer con ellas?
                      </p>

                      <fieldset className="space-y-3">
                        <legend className="sr-only">Acción sobre las tareas</legend>

                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="task-action"
                            value="move"
                            checked={action === 'move'}
                            onChange={() => setAction('move')}
                            className="mt-1"
                          />
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-medium text-light dark:text-dark">
                              Mover tareas a otra columna
                            </span>
                            {action === 'move' && otherColumns.length > 0 && (
                              <div className="mt-2">
                                <TaskColumnSelect
                                  columns={otherColumns}
                                  value={targetColumnId}
                                  onChange={setTargetColumnId}
                                />
                              </div>
                            )}
                          </span>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="task-action"
                            value="delete"
                            checked={action === 'delete'}
                            onChange={() => setAction('delete')}
                            className="mt-1"
                          />
                          <span className="text-sm font-medium text-light dark:text-dark">
                            Eliminar tareas definitivamente
                          </span>
                        </label>
                      </fieldset>

                      {action === 'delete' && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Las tareas se borrarán de forma permanente. Esta acción no se puede
                          deshacer.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      La columna está vacía. Esta acción no se puede deshacer.
                    </p>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="btn-secondary">
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={confirmDisabled}
                    className="btn-remove disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Eliminar columna
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
