import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { telegramService, type TelegramLinkStatus } from '../../services/telegram.service';

const authEnabled = () => import.meta.env.VITE_AUTH_ENABLED === 'true';

/** Azul oficial de Telegram */
const TG_BLUE = '#229ED9';

const TelegramLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

/** Estado de vínculo Telegram (para menú de usuario). */
export const useTelegramLink = () => {
  const [linked, setLinked] = useState<boolean | null>(null);

  const refreshLinked = useCallback(async () => {
    try {
      const s = await telegramService.getStatus();
      setLinked(s.linked);
    } catch {
      setLinked(false);
    }
  }, []);

  useEffect(() => {
    if (!authEnabled()) return;
    void refreshLinked();
  }, [refreshLinked]);

  return {
    linked,
    refreshLinked,
    onStatusChange: (s: TelegramLinkStatus) => setLinked(s.linked),
  };
};

export const TelegramLinkDialog = TelegramLinkDialogInner;

type DialogProps = {
  open: boolean;
  onClose: () => void;
  onStatusChange?: (status: TelegramLinkStatus) => void;
};

function TelegramLinkDialogInner({ open, onClose, onStatusChange }: DialogProps) {
  const [status, setStatus] = useState<TelegramLinkStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAndNotify = (s: TelegramLinkStatus) => {
    setStatus(s);
    onStatusChange?.(s);
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);
    setLoading(true);
    telegramService
      .getStatus()
      .then((s) => {
        if (!cancelled) setAndNotify(s);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al abrir
  }, [open]);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      setAndNotify(await telegramService.generateCode());
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
      setAndNotify(await telegramService.unlink());
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
                  <Dialog.Title as="h3" className="modal-title flex items-center gap-2">
                    <TelegramLogo className="w-6 h-6 text-[#229ED9]" />
                    {status?.linked ? 'Telegram vinculado' : 'Vincular Telegram'}
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
                      Escribe o envía una nota de voz; si dices el tablero («en Personal») va ahí. /pendientes y /bloqueos para listar.
                    </p>
                    {status.botUrl && (
                      <a
                        href={status.botUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium"
                        style={{ color: TG_BLUE }}
                      >
                        <TelegramLogo className="w-4 h-4" />
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
                            className="flex items-center justify-center gap-1.5 font-medium"
                            style={{ color: TG_BLUE }}
                          >
                            <TelegramLogo className="w-4 h-4" />
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
