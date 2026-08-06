import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { telegramService, type TelegramLinkStatus } from '../../services/telegram.service';

const authEnabled = () => import.meta.env.VITE_AUTH_ENABLED === 'true';

/** Vincular Telegram con la cuenta. Solo con auth activa. */
export const TelegramLinkButton = () => {
  const [open, setOpen] = useState(false);

  if (!authEnabled()) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary text-sm px-3 py-1.5"
        aria-label="Vincular Telegram"
      >
        Telegram
      </button>
      <TelegramLinkDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};

type DialogProps = {
  open: boolean;
  onClose: () => void;
};

function TelegramLinkDialog({ open, onClose }: DialogProps) {
  const [status, setStatus] = useState<TelegramLinkStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);
    setLoading(true);
    telegramService
      .getStatus()
      .then((s) => {
        if (!cancelled) setStatus(s);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      setStatus(await telegramService.generateCode());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const unlink = async () => {
    setLoading(true);
    setError(null);
    try {
      setStatus(await telegramService.unlink());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
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
                    Vincular Telegram
                  </Dialog.Title>
                  <button type="button" onClick={onClose} className="modal-close-button" aria-label="Cerrar">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {error && (
                  <p className="mb-3 text-sm text-red-600 dark:text-red-400" role="alert">
                    {error}
                  </p>
                )}

                {loading && !status && <p className="text-sm opacity-70">Cargando…</p>}

                {status?.linked ? (
                  <div className="space-y-4 text-sm">
                    <p>
                      Tu cuenta ya está vinculada
                      {status.linkedAt
                        ? ` (desde ${new Date(status.linkedAt).toLocaleString('es')})`
                        : ''}
                      .
                    </p>
                    <p className="opacity-80">
                      Escribe al bot para crear tareas en Pendiente, o usa /pendientes y /bloqueos.
                    </p>
                    {status.botUrl && (
                      <a
                        href={status.botUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-700 dark:text-teal-400 underline"
                      >
                        Abrir bot
                        {status.botUsername ? ` @${status.botUsername}` : ''}
                      </a>
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        className="btn-secondary text-sm"
                        onClick={() => void unlink()}
                        disabled={loading}
                      >
                        Desvincular
                      </button>
                      <button type="button" className="btn-primary text-sm" onClick={onClose}>
                        Listo
                      </button>
                    </div>
                  </div>
                ) : status ? (
                  <div className="space-y-4 text-sm">
                    <p>Genera un código, ábrelo en Telegram y confirma. Caduca en 15 minutos.</p>
                    {status.code ? (
                      <div className="space-y-2 rounded-xl bg-black/5 dark:bg-white/5 p-3">
                        <p className="font-mono text-lg tracking-wider text-center select-all">
                          {status.startCommand ?? `/start ${status.code}`}
                        </p>
                        {status.deepLink && (
                          <a
                            href={status.deepLink}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-center text-teal-700 dark:text-teal-400 underline"
                          >
                            Abrir en Telegram con el código
                          </a>
                        )}
                      </div>
                    ) : null}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        className="btn-primary text-sm"
                        onClick={() => void generate()}
                        disabled={loading}
                      >
                        {status.code ? 'Generar otro código' : 'Generar código'}
                      </button>
                      <button type="button" className="btn-secondary text-sm" onClick={onClose}>
                        Cerrar
                      </button>
                    </div>
                  </div>
                ) : null}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
