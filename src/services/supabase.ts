import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // No lanzamos para no romper el arranque en tests/CI sin credenciales.
  // Las llamadas reales fallarán y el error se reporta en la UI mediante el store.
  console.warn(
    'Supabase sin configurar: define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env'
  );
}

export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'public-anon-key-placeholder'
);
