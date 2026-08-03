interface LandingProps {
  onSignIn: () => void;
}

// Pantalla inicial para quien no ha iniciado sesión. El acceso a la app es
// restringido: entrar con Google genera una solicitud que el owner aprueba.
export const Landing = ({ onSignIn }: LandingProps) => (
  <div className="auth-shell">
    <div className="auth-card space-y-6">
      <div className="brand-badge">✓</div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Gestión de tareas
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          El acceso es por invitación. Solicítalo con tu cuenta de Google; recibirás un aviso en
          cuanto se apruebe.
        </p>
      </div>
      <button type="button" onClick={onSignIn} className="btn-primary w-full" aria-label="Entrar con Google">
        Entrar con Google
      </button>
    </div>
  </div>
);
