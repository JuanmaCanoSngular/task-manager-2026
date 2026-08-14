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
  const [colorOpenId, setColorOpenId] = useState<string | 'new' | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setBusy(true);
    await addTag(name.trim(), color);
    setName('');
    setColorOpenId(null);
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
                <Dialog.Panel className="modal-panel max-w-sm w-full">
                  <div className="flex items-center justify-between mb-2">
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

                  <p className="mb-4 text-xs leading-relaxed text-[var(--text-muted)]">
                    Solo este tablero. Pulsa el nombre para editarlo y el color para
                    cambiar el diseño.
                  </p>

                  {error && (
                    <p className="mb-3 text-sm text-red-600 dark:text-red-400" role="alert">
                      {error}
                    </p>
                  )}

                  <ul className="mb-3 max-h-64 overflow-y-auto divide-y divide-[var(--border)]">
                    {tags.map((tag) => (
                      <li key={tag.id} className="py-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            type="button"
                            className="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-1 ring-black/10 dark:ring-white/15"
                            style={{ backgroundColor: tag.color }}
                            aria-label={`Color de ${tag.name}`}
                            aria-expanded={colorOpenId === tag.id}
                            onClick={() =>
                              setColorOpenId((id) => (id === tag.id ? null : tag.id))
                            }
                          />
                          <input
                            className="flex-1 min-w-0 bg-transparent border-0 py-1 px-0 text-sm focus:ring-0 focus:outline-none"
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
                            className="p-1 flex-shrink-0 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                            aria-label={`Eliminar ${tag.name}`}
                            onClick={() => setDeleteId(tag.id)}
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {colorOpenId === tag.id ? (
                          <div className="pt-2 pl-6">
                            <ColorPicker
                              value={tag.color}
                              onChange={(c) => void updateTag(tag.id, { color: c })}
                              presets={TAG_COLOR_PRESETS}
                              size="xs"
                              ariaLabel={`Color de ${tag.name}`}
                            />
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>

                  <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-1 ring-black/10 dark:ring-white/15"
                        style={{ backgroundColor: color }}
                        aria-label="Color de la nueva etiqueta"
                        aria-expanded={colorOpenId === 'new'}
                        onClick={() => setColorOpenId((id) => (id === 'new' ? null : 'new'))}
                      />
                      <input
                        className="flex-1 min-w-0 bg-transparent border-0 py-1 px-0 text-sm focus:ring-0 focus:outline-none"
                        placeholder="Nueva etiqueta"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            void handleCreate();
                          }
                        }}
                        maxLength={32}
                      />
                      <button
                        type="button"
                        className="text-sm font-medium text-teal-700 dark:text-teal-400 disabled:opacity-40"
                        disabled={busy || !name.trim()}
                        onClick={() => void handleCreate()}
                      >
                        Añadir
                      </button>
                    </div>
                    {colorOpenId === 'new' ? (
                      <div className="pt-2 pl-6">
                        <ColorPicker
                          value={color}
                          onChange={setColor}
                          presets={TAG_COLOR_PRESETS}
                          size="xs"
                          ariaLabel="Color de la nueva etiqueta"
                        />
                      </div>
                    ) : null}
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
