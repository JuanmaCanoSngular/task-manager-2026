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

// Cada cuánto se comprueba si un usuario pendiente ya ha sido aprobado.
const POLL_INTERVAL_MS = 8000;

export const useAuth = (): UseAuth => {
  const [state, setState] = useState<AuthState>('loading');
  const [user, setUser] = useState<User | null>(null);
  // Usuario ya procesado, para no lanzar requestAccess más de una vez
  // (getSession + onAuthChange pueden resolver casi a la vez).
  const handledUserId = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    const resolveAccess = async (sessionUser: User | null) => {
      if (!active) return;

      if (!sessionUser) {
        handledUserId.current = null;
        setUser(null);
        setState('signed-out');
        return;
      }

      setUser(sessionUser);

      // Dedupe síncrono: si este usuario ya se está procesando, no repetir.
      if (handledUserId.current === sessionUser.id) return;
      handledUserId.current = sessionUser.id;

      let status = await authService.getAccessStatus(sessionUser.id);

      // Primer acceso: aún no tiene perfil. Se crea la solicitud (perfil
      // pending + email al owner) una sola vez y queda en espera.
      if (status === null) {
        try {
          await authService.requestAccess();
        } catch {
          // Si la Edge Function no está disponible, se muestra pending igual.
        }
        status = 'pending';
      }

      if (!active) return;
      setState(status === 'approved' ? 'approved' : status === 'denied' ? 'denied' : 'pending');
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
