import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';

// Estados del gate de acceso:
//  - loading:    resolviendo sesión / estado de acceso
//  - signed-out: sin sesión (mostrar landing)
//  - pending:    logueado pero acceso no aprobado (mostrar pantalla de espera)
//  - approved:   acceso concedido (mostrar la app)
export type AuthState = 'loading' | 'signed-out' | 'pending' | 'approved' | 'denied';

interface UseAuth {
  state: AuthState;
  user: User | null;
  signInWithGoogle: () => void;
  signOut: () => void;
}

const POLL_INTERVAL_MS = 8000;

export const useAuth = (): UseAuth => {
  const [state, setState] = useState<AuthState>('loading');
  const [user, setUser] = useState<User | null>(null);
  // Dedupe getSession + INITIAL_SESSION (mismo usuario, casi a la vez).
  const inFlightUserId = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    const resolveAccess = async (sessionUser: User | null) => {
      if (!active) return;

      if (!sessionUser) {
        inFlightUserId.current = null;
        setUser(null);
        setState('signed-out');
        return;
      }

      if (inFlightUserId.current === sessionUser.id) return;
      inFlightUserId.current = sessionUser.id;
      setUser(sessionUser);

      try {
        let status = await authService.getAccessStatus(sessionUser.id);

        if (!active) return;

        if (status === null) {
          try {
            await authService.requestAccess();
          } catch {
            // Edge Function no disponible → pending igual.
          }
          status = 'pending';
        }

        if (!active) return;
        setState(status === 'approved' ? 'approved' : status === 'denied' ? 'denied' : 'pending');
      } catch {
        if (!active) return;
        inFlightUserId.current = null;
        setState('signed-out');
      }
    };

    void authService.getSession().then(
      (session) => resolveAccess(session?.user ?? null),
      () => {
        if (active) setState('signed-out');
      }
    );

    const unsubscribe = authService.onAuthChange((session) => {
      void resolveAccess(session?.user ?? null);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // Mientras el acceso está pendiente, sondear si el owner ya ha aprobado.
  useEffect(() => {
    if (state !== 'pending' || !user) return;

    const interval = setInterval(async () => {
      const status = await authService.getAccessStatus(user.id);
      if (status === 'approved') setState('approved');
      else if (status === 'denied') setState('denied');
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [state, user]);

  return {
    state,
    user,
    signInWithGoogle: () => authService.signInWithGoogle(),
    signOut: () => authService.signOut(),
  };
};
