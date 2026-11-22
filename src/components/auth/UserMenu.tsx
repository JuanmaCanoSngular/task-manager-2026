import { useEffect, useRef, useState } from 'react';
import { UserIcon } from '@heroicons/react/24/solid';
import { authService } from '../../services/auth.service';
import { nicknameAvatarUrl } from '../../utils/auth-nickname';
import { TelegramLinkDialog, useTelegramLink } from './TelegramLinkButton';

const authEnabled = () => import.meta.env.VITE_AUTH_ENABLED === 'true';

const avatarFromUser = (
  user: { email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined
) => {
  const meta = user?.user_metadata ?? {};
  if (typeof meta.avatar_url === 'string' && meta.avatar_url) return meta.avatar_url;
  if (typeof meta.picture === 'string' && meta.picture) return meta.picture;
  return nicknameAvatarUrl(user?.email ?? undefined);
};

/** Avatar redondo + menú (Telegram / cerrar sesión). */
export const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const [telegramOpen, setTelegramOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { linked, refreshLinked, onStatusChange } = useTelegramLink();

  useEffect(() => {
    if (!authEnabled()) return;
    const apply = (
      user: { email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined
    ) => {
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
              onError={() => setAvatarUrl(null)}
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
          </div>
        )}
      </div>

      <TelegramLinkDialog
        open={telegramOpen}
        onClose={() => {
          setTelegramOpen(false);
          void refreshLinked();
        }}
        onStatusChange={onStatusChange}
      />
    </>
  );
};
