import { BrandLockup } from '../brand/BrandLockup';
import { BRAND_DESCRIPTION, BRAND_TAGLINE } from '../../brand';
import { GoogleLogo } from './GoogleLogo';

interface LandingProps {
  onSignIn: () => void;
}

// Pantalla inicial para quien no ha iniciado sesión. El acceso a la app es
// restringido: entrar con Google genera una solicitud que el owner aprueba.
export const Landing = ({ onSignIn }: LandingProps) => (
  <div className="auth-shell">
    <div className="auth-card space-y-8">
      <BrandLockup markSize={56} stacked showTagline tagline={BRAND_TAGLINE} />
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {BRAND_DESCRIPTION}
      </p>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        El acceso es por invitación. Solicítalo con tu cuenta de Google; recibirás un aviso en cuanto
        se apruebe.
      </p>
      <button
        type="button"
        onClick={onSignIn}
        aria-label="Entrar con Google"
        className="group w-full inline-flex items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 dark:focus:ring-offset-[var(--surface)] hover:-translate-y-0.5 active:translate-y-0"
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
