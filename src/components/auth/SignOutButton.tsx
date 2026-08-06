import { authService } from '../../services/auth.service';

const authEnabled = () => import.meta.env.VITE_AUTH_ENABLED === 'true';

/** Cerrar sesión. Solo visible con auth activada. */
export const SignOutButton = () => {
  if (!authEnabled()) return null;

  return (
    <button
      type="button"
      onClick={() => {
        void authService.signOut();
      }}
      className="btn-secondary text-sm px-3 py-1.5"
      aria-label="Cerrar sesión"
    >
      Cerrar sesión
    </button>
  );
};
