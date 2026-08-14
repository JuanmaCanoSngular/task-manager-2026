import { useEffect, useRef, useState } from 'react';
import { UserIcon } from '@heroicons/react/24/solid';
import { authService } from '../../services/auth.service';
import { useBoardStore } from '../../stores/board.store';
import { useTagStore } from '../../stores/tag.store';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { TelegramLinkDialog, useTelegramLink } from './TelegramLinkButton';

const authEnabled = () => import.meta.env.VITE_AUTH_ENABLED === 'true';

const avatarFromUser = (user: { user_metadata?: Record<string, unknown> } | null | undefined) => {
  const meta = user?.user_metadata ?? {};
  if (typeof meta.avatar_url === 'string' && meta.avatar_url) return meta.avatar_url;
  if (typeof meta.picture === 'string' && meta.picture) return meta.picture;
  return null;
};

/** Avatar redondo + menú (cerrar sesión / eliminar cuenta). */
export const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const [telegramOpen, setTelegramOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { linked, refreshLinked, onStatusChange } = useTelegramLink();

  useEffect(() => {
    if (!authEnabled()) return;
    const apply = (user: { user_metadata?: Record<string, unknown> } | null | undefined) => {
      setAvatarUrl(avatarFromUser(user));
    };
    void authService.getSession().then((session) => apply(session?.user));
    return authService.onAuthChange((session) => apply(session?.user));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  if (!authEnabled()) return null;

  const handleSignOut = () => {
    setOpen(false);
    void authService.signOut();
  };

  const handleDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      await authService.deleteAccount();
      useBoardStore.setState({ boards: [], currentBoardId: null, error: null });
      useTagStore.setState({ tags: [], boardId: null, loaded: false, error: null });
      setConfirmDelete(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar la cuenta');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="relative" ref={rootRef}>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 dark:focus:ring-offset-[var(--app-bg)]"
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: 'var(--border)',
            color: 'var(--text-muted)',
          }}
          aria-label="Menú de cuenta"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((v) => !v)}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <UserIcon className="h-5 w-5" aria-hidden />
          )}
        </button>

        {open && (
          <div
            role="menu"
            aria-label="Opciones de cuenta"
            className="absolute right-0 z-50 mt-2 w-52 origin-top-right rounded-xl border p-1 shadow-lg"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <button
              type="button"
              role="menuitem"
              className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => {
                setOpen(false);
                setTelegramOpen(true);
              }}
            >
              {linked ? 'Telegram vinculado' : 'Vincular Telegram'}
            </button>
            <button
              type="button"
              role="menuitem"
              className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
              onClick={handleSignOut}
            >
              Cerrar sesión
            </button>
            <button
              type="button"
              role="menuitem"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10"
              onClick={() => {
                setOpen(false);
                setConfirmDelete(true);
              }}
            >
              Eliminar cuenta
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="sr-only" role="alert">
          {error}
        </p>
      )}

      <TelegramLinkDialog
        open={telegramOpen}
        onClose={() => {
          setTelegramOpen(false);
          void refreshLinked();
        }}
        onStatusChange={onStatusChange}
      />

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => !busy && setConfirmDelete(false)}
        onConfirm={() => void handleDelete()}
        title="¿Eliminar tu cuenta?"
        description={
          error
            ? error
            : 'Se borrarán tu cuenta, tableros, tareas, etiquetas y el vínculo de Telegram. Esta acción no se puede deshacer.'
        }
        confirmText={busy ? 'Eliminando…' : 'Eliminar cuenta'}
        cancelText="Cancelar"
      />
    </>
  );
};
