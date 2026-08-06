import { useAuth } from '../../hooks/useAuth';
import { Landing } from './Landing';
import { PendingAccess } from './PendingAccess';
import { DeniedAccess } from './DeniedAccess';

interface AuthGateProps {
  children: React.ReactNode;
}

// Controla el acceso a la app según el estado de autenticación/aprobación.
// Solo un usuario aprobado ve `children`.
export const AuthGate = ({ children }: AuthGateProps) => {
  const { state, user, signInWithGoogle, signOut } = useAuth();

  if (state === 'loading') {
    return (
      <div role="status" aria-label="Cargando" className="auth-shell">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--brand)]" />
      </div>
    );
  }

  if (state === 'signed-out') {
    return <Landing onSignIn={signInWithGoogle} />;
  }

  if (state === 'pending') {
    return <PendingAccess email={user?.email} onSignOut={signOut} />;
  }

  if (state === 'denied') {
    return <DeniedAccess onSignOut={signOut} />;
  }

  return <>{children}</>;
};
