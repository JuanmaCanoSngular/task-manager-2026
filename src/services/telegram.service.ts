import { supabase } from './supabase';

export type TelegramLinkStatus = {
  linked: boolean;
  linkedAt: string | null;
  botUsername: string | null;
  botUrl: string | null;
  code?: string;
  expiresAt?: string;
  deepLink?: string | null;
  startCommand?: string;
};

type Action = 'status' | 'generate' | 'unlink';

async function invoke(action: Action): Promise<TelegramLinkStatus> {
  const { data, error } = await supabase.functions.invoke('telegram-link', {
    body: { action },
  });

  if (error) {
    throw new Error(error.message || 'No se pudo contactar con Telegram link');
  }
  if (data?.error) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Error');
  }
  return data as TelegramLinkStatus;
}

export const telegramService = {
  getStatus: () => invoke('status'),
  generateCode: () => invoke('generate'),
  unlink: () => invoke('unlink'),
};
