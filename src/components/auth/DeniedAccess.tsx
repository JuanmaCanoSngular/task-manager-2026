interface DeniedAccessProps {
  onSignOut: () => void;
}

// Se muestra cuando el owner ha denegado la solicitud de acceso del usuario.
export const DeniedAccess = ({ onSignOut }: DeniedAccessProps) => (
  <div className="min-h-screen w-full flex items-center justify-center bg-background text-light dark:bg-background-dark dark:text-dark px-4">
    <div className="max-w-md w-full text-center space-y-6">
      <h1 className="text-2xl font-bold">Acceso denegado</h1>
      <p className="text-gray-500 dark:text-gray-400">
        Tu solicitud de acceso no ha sido aprobada. Si crees que es un error, contacta con el
        administrador.
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
