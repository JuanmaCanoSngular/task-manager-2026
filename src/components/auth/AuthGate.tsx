import { useAuth } from '../../hooks/useAuth';
import { Landing } from './Landing';
import { PendingAccess } from './PendingAccess';
import { DeniedAccess } from './DeniedAccess';
import { BrandLockup } from '../brand/BrandLockup';

interface AuthGateProps {
  children: React.ReactNode;
}

export const AuthGate = ({ children }: AuthGateProps) => {
  const { state, user, signInWithGoogle, signOut } = useAuth();

  if (state === 'loading') {
    return (
      <div role="status" aria-label="Cargando" className="auth-shell">
        <div className="flex flex-col items-center gap-6">
          <BrandLockup markSize={48} stacked />
          <div
            className="w-48 h-[2px] overflow-hidden rounded-full"
            style={{ backgroundColor: 'color-mix(in srgb, var(--brand) 20%, transparent)' }}
          >
            <div
              className="top-loader-bar h-full rounded-full"
              style={{ backgroundColor: 'var(--brand)' }}
            />
          </div>
        </div>
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
