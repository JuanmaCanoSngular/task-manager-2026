interface PendingAccessProps {
  email?: string;
  onSignOut: () => void;
}

// Se muestra cuando el usuario está autenticado pero su acceso aún no ha sido
// aprobado por el owner.
export const PendingAccess = ({ email, onSignOut }: PendingAccessProps) => (
  <div className="min-h-screen w-full flex items-center justify-center bg-background text-light dark:bg-background-dark dark:text-dark px-4">
    <div className="max-w-md w-full text-center space-y-6">
      <h1 className="text-2xl font-bold">Solicitud enviada</h1>
      <p className="text-gray-500 dark:text-gray-400">
        Tu solicitud de acceso {email ? `para ${email} ` : ''}está pendiente de aprobación. Esta
        pantalla se actualizará automáticamente en cuanto se autorice.
      </p>
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
