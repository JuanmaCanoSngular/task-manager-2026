/** Valida URL http(s) sencilla; vacío = sin imagen. */
export const isValidImageUrl = (raw: string): boolean => {
  const value = raw.trim();
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};
