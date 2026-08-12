import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { TrashIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { TAG_COLOR_PRESETS } from '../../interfaces/tag.interface';
import { useTagStore } from '../../stores/tag.store';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ColorPicker } from '../common/ColorPicker';

interface TagsManagerDialogProps {
  open: boolean;
  onClose: () => void;
}

export const TagsManagerDialog = ({ open, onClose }: TagsManagerDialogProps) => {
  const tags = useTagStore((s) => s.tags);
  const error = useTagStore((s) => s.error);
  const addTag = useTagStore((s) => s.addTag);
  const updateTag = useTagStore((s) => s.updateTag);
  const removeTag = useTagStore((s) => s.removeTag);

  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(TAG_COLOR_PRESETS[0]);
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setBusy(true);
    await addTag(name.trim(), color);
    setName('');
    setBusy(false);
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
                      Etiquetas
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

                  <ul className="space-y-3 mb-6 max-h-56 overflow-y-auto">
                    {tags.map((tag) => (
                      <li
                        key={tag.id}
                        className="flex flex-col gap-2 rounded-xl border px-3 py-2.5"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tag.color }}
                            aria-hidden
                          />
                          <input
                            className="input-base flex-1 min-w-0 py-1.5 text-sm"
                            defaultValue={tag.name}
                            key={`${tag.id}-${tag.name}`}
                            onBlur={(e) => {
                              const next = e.target.value.trim();
                              if (next && next !== tag.name) {
                                void updateTag(tag.id, { name: next });
                              } else {
                                e.target.value = tag.name;
                              }
                            }}
                            aria-label={`Nombre de ${tag.name}`}
                          />
                          <button
                            type="button"
                            className="btn-remove p-1.5 flex-shrink-0"
                            aria-label={`Eliminar ${tag.name}`}
                            onClick={() => setDeleteId(tag.id)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <ColorPicker
                          value={tag.color}
                          onChange={(c) => void updateTag(tag.id, { color: c })}
                          presets={TAG_COLOR_PRESETS}
                          size="xs"
                          ariaLabel={`Color de ${tag.name}`}
                        />
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3 rounded-xl p-3" style={{ backgroundColor: 'var(--surface-2)' }}>
                    <p className="text-sm font-medium">Nueva etiqueta</p>
                    <input
                      className="input-base"
                      placeholder="Nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={32}
                    />
                    <ColorPicker
                      value={color}
                      onChange={setColor}
                      presets={TAG_COLOR_PRESETS}
                      size="sm"
                      ariaLabel="Color de la nueva etiqueta"
                    />
                    <button
                      type="button"
                      className="btn-primary text-sm w-full justify-center"
                      disabled={busy || !name.trim()}
                      onClick={() => void handleCreate()}
                    >
                      Crear etiqueta
                    </button>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button type="button" className="btn-secondary text-sm" onClick={onClose}>
                      Listo
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) void removeTag(deleteId);
          setDeleteId(null);
        }}
        title="¿Eliminar etiqueta?"
        description="Se quitará de todas las tareas que la usen. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
};
