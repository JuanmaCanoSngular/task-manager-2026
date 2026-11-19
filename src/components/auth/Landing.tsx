import { FormEvent, useState } from 'react';
import { BrandLockup } from '../brand/BrandLockup';
import { BRAND_DESCRIPTION, BRAND_TAGLINE } from '../../brand';
import { GoogleLogo } from './GoogleLogo';

interface LandingProps {
  onSignInGoogle: () => void;
  onSignInNickname: (nickname: string, password: string) => Promise<void>;
}

export const Landing = ({ onSignInGoogle, onSignInNickname }: LandingProps) => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSignInNickname(nickname, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card space-y-8">
        <BrandLockup markSize={56} stacked showTagline tagline={BRAND_TAGLINE} />
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {BRAND_DESCRIPTION}
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-3"
          aria-label="Entrar con usuario y contraseña"
        >
          <div className="space-y-1.5">
            <label htmlFor="auth-nickname" className="block text-xs font-semibold text-[var(--text)]">
              Usuario
            </label>
            <input
              id="auth-nickname"
              name="nickname"
              type="text"
              autoComplete="username"
              inputMode="text"
              spellCheck={false}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={busy}
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-600"
              style={{
                backgroundColor: 'var(--surface)',
                color: 'var(--text)',
                borderColor: 'var(--border)',
              }}
              placeholder="tu usuario"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="auth-password" className="block text-xs font-semibold text-[var(--text)]">
              Contraseña
            </label>
            <input
              id="auth-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-600"
              style={{
                backgroundColor: 'var(--surface)',
                color: 'var(--text)',
                borderColor: 'var(--border)',
              }}
              required
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: 'var(--brand)' }}
          >
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="flex items-center gap-3" aria-hidden>
          <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            o
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
        </div>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          También puedes solicitar acceso con Google; recibirás un aviso en cuanto se apruebe.
        </p>
        <button
          type="button"
          onClick={onSignInGoogle}
          aria-label="Entrar con Google"
          disabled={busy}
          className="group w-full inline-flex items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 dark:focus:ring-offset-[var(--surface)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
          style={{
            backgroundColor: 'var(--surface)',
            color: 'var(--text)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/5">
            <GoogleLogo className="h-4 w-4" />
          </span>
          Entrar con Google
        </button>
      </div>
    </div>
  );
};
