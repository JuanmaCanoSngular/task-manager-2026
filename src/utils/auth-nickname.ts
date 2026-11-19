/** Dominio sintético: el usuario escribe nickname; Auth guarda email. */
export const NICKNAME_EMAIL_DOMAIN = 'users.taskblero.local';

const NICKNAME_RE = /^[a-z0-9]([a-z0-9._-]{0,30}[a-z0-9])?$/i;

export const normalizeNickname = (raw: string): string => raw.trim().toLowerCase();

export const isValidNickname = (raw: string): boolean => {
  const nick = normalizeNickname(raw);
  return nick.length >= 2 && NICKNAME_RE.test(nick);
};

export const nicknameToEmail = (raw: string): string => {
  const nick = normalizeNickname(raw);
  if (!isValidNickname(nick)) {
    throw new Error('Usuario no válido');
  }
  return `${nick}@${NICKNAME_EMAIL_DOMAIN}`;
};

/** Si el email es sintético, devuelve el nickname; si no, el email tal cual. */
export const displayIdentity = (email: string | null | undefined): string | undefined => {
  if (!email) return undefined;
  const suffix = `@${NICKNAME_EMAIL_DOMAIN}`;
  if (email.toLowerCase().endsWith(suffix)) {
    return email.slice(0, -suffix.length);
  }
  return email;
};

/** Avatar estático en `/public/avatars/{nickname}.png` para logins por nickname. */
export const nicknameAvatarUrl = (email: string | null | undefined): string | null => {
  const nick = displayIdentity(email);
  if (!email || !nick) return null;
  if (!email.toLowerCase().endsWith(`@${NICKNAME_EMAIL_DOMAIN}`)) return null;
  return `/avatars/${nick}.png`;
};
