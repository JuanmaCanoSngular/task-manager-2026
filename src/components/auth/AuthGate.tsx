import { useAuth } from '../../hooks/useAuth';
import { Landing } from './Landing';
import { PendingAccess } from './PendingAccess';

interface AuthGateProps {
  children: React.ReactNode;
}

// Controla el acceso a la app según el estado de autenticación/aprobación.
// Solo un usuario aprobado ve `children`.
export const AuthGate = ({ children }: AuthGateProps) => {
  const { state, user, signInWithGoogle, signOut } = useAuth();

  if (state === 'loading') {
    return (
      <div
        role="status"
        aria-label="Cargando"
        className="min-h-screen w-full flex items-center justify-center bg-background text-light dark:bg-background-dark dark:text-dark"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
      </div>
    );
  }

  if (state === 'signed-out') {
    return <Landing onSignIn={signInWithGoogle} />;
  }

  if (state === 'pending') {
    return <PendingAccess email={user?.email} onSignOut={signOut} />;
  }

  return <>{children}</>;
};
