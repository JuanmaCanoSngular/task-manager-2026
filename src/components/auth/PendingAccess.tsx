import { BrandLockup } from '../brand/BrandLockup';

interface PendingAccessProps {
  email?: string;
  onSignOut: () => void;
}

// Se muestra cuando el usuario está autenticado pero su acceso aún no ha sido
// aprobado por el owner.
export const PendingAccess = ({ email, onSignOut }: PendingAccessProps) => (
  <div className="auth-shell">
    <div className="auth-card space-y-6">
      <BrandLockup markSize={40} stacked />
      <div className="space-y-2">
        <h1 className="font-display text-xl font-semibold" style={{ color: 'var(--text)' }}>
          Solicitud enviada
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Tu solicitud de acceso {email ? `para ${email} ` : ''}está pendiente de aprobación. Esta
          pantalla se actualizará automáticamente en cuanto se autorice.
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
