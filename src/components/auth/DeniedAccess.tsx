import { BrandLockup } from '../brand/BrandLockup';

interface DeniedAccessProps {
  onSignOut: () => void;
}

// Se muestra cuando el owner ha denegado la solicitud de acceso del usuario.
export const DeniedAccess = ({ onSignOut }: DeniedAccessProps) => (
  <div className="auth-shell">
    <div className="auth-card space-y-6">
      <BrandLockup markSize={40} stacked />
      <div className="space-y-2">
        <h1 className="font-display text-xl font-semibold" style={{ color: 'var(--text)' }}>
          Acceso denegado
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Tu solicitud de acceso no ha sido aprobada. Si crees que es un error, contacta con el
          administrador.
        </p>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="btn-secondary w-full justify-center"
        aria-label="Cerrar sesión"
      >
        Cerrar sesión
      </button>
    </div>
  </div>
);
