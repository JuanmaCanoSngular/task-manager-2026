import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { TrashIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { COLUMN_COLOR_PRESETS } from '../../interfaces/column.interface';
import { useBoardStore } from '../../stores/board.store';
import { DeleteColumnDialog } from './DeleteColumnDialog';
import { ColorPicker } from '../common/ColorPicker';

interface ColumnsManagerDialogProps {
  boardId: number;
  open: boolean;
  onClose: () => void;
  onColumnDeleted?: (columnName: string) => void;
  onColumnCreated?: (columnName: string) => void;
}

export const ColumnsManagerDialog = ({
  boardId,
  open,
  onClose,
  onColumnDeleted,
  onColumnCreated,
}: ColumnsManagerDialogProps) => {
  const board = useBoardStore((s) => s.boards.find((b) => b.id === boardId));
  const error = useBoardStore((s) => s.error);
  const addColumn = useBoardStore((s) => s.addColumn);
  const updateColumn = useBoardStore((s) => s.updateColumn);
  const removeColumn = useBoardStore((s) => s.removeColumn);

  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(COLUMN_COLOR_PRESETS[0]);
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const columns = board?.columns ?? [];
  const columnToDelete = deleteId !== null ? columns.find((c) => c.id === deleteId) : null;
  const taskCount =
    deleteId !== null ? (board?.tasks.filter((t) => t.columnId === deleteId).length ?? 0) : 0;

  const handleCreate = async () => {
    if (!name.trim()) return;
    const createdName = name.trim();
    setBusy(true);
    const column = await addColumn(boardId, { name: createdName, color });
    setBusy(false);
    if (column) {
      setName('');
      onColumnCreated?.(createdName);
    }
  };

  const handleDeleteConfirm = (options: { moveTasksToColumnId?: number }) => {
    if (deleteId === null || !columnToDelete) return;

    const deletedName = columnToDelete.name;
    const columnId = deleteId;
    setDeleteId(null);
    removeColumn(boardId, columnId, options);
    onColumnDeleted?.(deletedName);
  };

  return (
    <>
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="modal-backdrop-transition-enter"
            enterFrom="modal-backdrop-transition-enter-from"
            enterTo="modal-backdrop-transition-enter-to"
            leave="modal-backdrop-transition-leave"
            leaveFrom="modal-backdrop-transition-leave-from"
            leaveTo="modal-backdrop-transition-leave-to"
          >
            <div className="modal-backdrop" />
          </Transition.Child>

          <div className="modal-container">
            <div className="modal-wrapper">
              <Transition.Child
                as={Fragment}
                enter="modal-transition-enter"
                enterFrom="modal-transition-enter-from"
                enterTo="modal-transition-enter-to"
                leave="modal-transition-leave"
                leaveFrom="modal-transition-leave-from"
                leaveTo="modal-transition-leave-to"
              >
                <Dialog.Panel className="modal-panel max-w-md w-full">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title as="h3" className="modal-title">
                      Columnas
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={onClose}
                      className="modal-close-button"
                      aria-label="Cerrar"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {error && (
                    <p className="mb-3 text-sm text-red-600 dark:text-red-400" role="alert">
                      {error}
                    </p>
                  )}

                  <ul className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {columns.map((col) => (
                      <li
                        key={col.id}
                        className="flex flex-col gap-2 rounded-xl border border-[var(--border)] p-3"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="text"
                            value={col.name}
                            onChange={(e) =>
                              updateColumn(boardId, col.id, { name: e.target.value })
                            }
                            className="input-base flex-1 min-w-0 py-2 text-sm"
                            aria-label={`Nombre de columna ${col.name}`}
                          />
                          {!col.isInbox && (
                            <button
                              type="button"
                              onClick={() => setDeleteId(col.id)}
                              className="p-1.5 flex-shrink-0 text-red-500 hover:bg-red-500/10 rounded-lg"
                              aria-label={`Eliminar columna ${col.name}`}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <ColorPicker
                          value={col.color}
                          onChange={(c) => updateColumn(boardId, col.id, { color: c })}
                          presets={COLUMN_COLOR_PRESETS}
                          size="sm"
                          ariaLabel={`Color de ${col.name}`}
                        />
                      </li>
                    ))}
                  </ul>

                  <div
                    className="space-y-3 rounded-xl p-3"
                    style={{ backgroundColor: 'var(--surface-2)' }}
                  >
                    <p className="text-sm font-medium">Nueva columna</p>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nombre de la columna"
                      className="input-base w-full"
                    />
                    <ColorPicker
                      value={color}
                      onChange={setColor}
                      presets={COLUMN_COLOR_PRESETS}
                      size="sm"
                      ariaLabel="Color de la nueva columna"
                    />
                    <button
                      type="button"
                      onClick={() => void handleCreate()}
                      disabled={busy || !name.trim()}
                      className="btn-primary w-full"
                    >
                      Añadir columna
                    </button>
                  </div>

                  <p className="mt-4 text-xs text-[var(--text-muted)]">
                    La columna inbox (Pendiente) no se puede eliminar. Al borrar una columna con
                    tareas puedes moverlas o eliminarlas.
                  </p>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <DeleteColumnDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        column={columnToDelete ?? null}
        columns={columns}
        taskCount={taskCount}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};
