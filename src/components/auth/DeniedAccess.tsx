interface DeniedAccessProps {
  onSignOut: () => void;
}

// Se muestra cuando el owner ha denegado la solicitud de acceso del usuario.
export const DeniedAccess = ({ onSignOut }: DeniedAccessProps) => (
  <div className="auth-shell">
    <div className="auth-card space-y-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-600 dark:bg-red-500/15 dark:text-red-400">
        ✕
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Acceso denegado
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Tu solicitud de acceso no ha sido aprobada. Si crees que es un error, contacta con el
          administrador.
        </p>
      </div>
      <button type="button" onClick={onSignOut} className="btn-secondary w-full justify-center" aria-label="Cerrar sesión">
        Cerrar sesión
      </button>
    </div>
  </div>
);
