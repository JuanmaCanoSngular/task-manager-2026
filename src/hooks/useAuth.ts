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
  // Evita que resolveAccess (costoso: query a profiles + posible requestAccess)
  // se ejecute en paralelo. getSession + onAuthStateChange INITIAL_SESSION
  // pueden disparar casi a la vez con el mismo usuario.
  const pendingRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    const resolveAccess = async (sessionUser: User | null) => {
      if (!active) return;

      if (!sessionUser) {
        pendingRef.current = null;
        setUser(null);
        setState('signed-out');
        return;
      }

      // Si ya estamos resolviendo este mismo usuario, ignorar la llamada
      // duplicada. Pero si el estado actual ya es terminal (approved, etc.)
      // y llega el mismo user de nuevo (token refresh), no hay nada que hacer.
      if (pendingRef.current === sessionUser.id) return;
      pendingRef.current = sessionUser.id;

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
        // Query fallida (red, Supabase reiniciando, etc.): no quedarse en
        // loading para siempre. El usuario puede reintentar con F5.
        if (!active) return;
        setState('signed-out');
      } finally {
        // Permitir reintentos futuros (p.ej. si onAuthChange dispara
        // de nuevo tras un token refresh exitoso).
        if (pendingRef.current === sessionUser.id) {
          pendingRef.current = null;
        }
      }
    };

    // onAuthStateChange dispara INITIAL_SESSION síncronamente al suscribirse
    // (con la sesión del localStorage, posiblemente con JWT expirado que
    // Supabase refresca en background). Eso basta para arrancar; no
    // necesitamos llamar a getSession() por separado.
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
