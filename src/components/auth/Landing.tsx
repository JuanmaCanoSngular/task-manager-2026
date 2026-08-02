interface LandingProps {
  onSignIn: () => void;
}

// Pantalla inicial para quien no ha iniciado sesión. El acceso a la app es
// restringido: entrar con Google genera una solicitud que el owner aprueba.
export const Landing = ({ onSignIn }: LandingProps) => (
  <div className="min-h-screen w-full flex items-center justify-center bg-background text-light dark:bg-background-dark dark:text-dark px-4">
    <div className="max-w-md w-full text-center space-y-6">
      <h1 className="text-3xl font-bold">Gestión de tareas</h1>
      <p className="text-gray-500 dark:text-gray-400">
        El acceso a la aplicación es restringido. Solicita acceso con tu cuenta de Google; recibirás
        entrada cuando se apruebe tu solicitud.
      </p>
      <button
        type="button"
        onClick={onSignIn}
        className="btn-add w-full justify-center"
        aria-label="Entrar con Google"
      >
        Entrar con Google
      </button>
    </div>
  </div>
);
