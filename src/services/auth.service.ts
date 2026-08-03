import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

export type AccessStatus = 'pending' | 'approved' | 'denied';

export const authService = {
  // Inicia el login federado con Google. Al volver, Supabase deja la sesión
  // en el cliente y dispara onAuthChange.
  signInWithGoogle() {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  },

  signOut() {
    return supabase.auth.signOut();
  },

  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  onAuthChange(callback: (session: Session | null) => void) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
    return () => data.subscription.unsubscribe();
  },

  // Lee el estado de acceso del perfil. null = no existe perfil todavía.
  async getAccessStatus(userId: string): Promise<AccessStatus | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data.status as AccessStatus;
  },

  // Crea la solicitud de acceso (perfil pending) y envía el email al owner.
  // Implementado como Edge Function para poder usar service_role y Resend.
  async requestAccess(): Promise<void> {
    await supabase.functions.invoke('request-access');
  },
};
