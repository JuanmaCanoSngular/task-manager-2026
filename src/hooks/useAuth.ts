import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';

// Estados del gate de acceso:
//  - loading:    resolviendo sesión / estado de acceso
//  - signed-out: sin sesión (mostrar landing)
//  - pending:    logueado pero acceso no aprobado (mostrar pantalla de espera)
//  - approved:   acceso concedido (mostrar la app)
export type AuthState = 'loading' | 'signed-out' | 'pending' | 'approved';

interface UseAuth {
  state: AuthState;
  user: User | null;
  signInWithGoogle: () => void;
  signOut: () => void;
}

export const useAuth = (): UseAuth => {
  const [state, setState] = useState<AuthState>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let active = true;

    const resolveAccess = async (sessionUser: User | null) => {
      if (!active) return;

      if (!sessionUser) {
        setUser(null);
        setState('signed-out');
        return;
      }

      setUser(sessionUser);
      let status = await authService.getAccessStatus(sessionUser.id);

      // Primer acceso de este usuario: aún no tiene perfil. Se crea la
      // solicitud (perfil pending + email al owner) y queda en espera.
      if (status === null) {
        try {
          await authService.requestAccess();
        } catch {
          // Si la Edge Function no está disponible todavía, se muestra
          // igualmente la pantalla de pendiente.
        }
        status = 'pending';
      }

      if (!active) return;
      setState(status === 'approved' ? 'approved' : 'pending');
    };

    authService.getSession().then((session) => resolveAccess(session?.user ?? null));
    const unsubscribe = authService.onAuthChange((session) =>
      resolveAccess(session?.user ?? null)
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return {
    state,
    user,
    signInWithGoogle: () => authService.signInWithGoogle(),
    signOut: () => authService.signOut(),
  };
};
