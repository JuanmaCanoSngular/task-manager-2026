/** Días que un artículo puede quedarse en Comprado o Descartado. */
export const SHOPPING_PURGE_AFTER_DAYS = 7;

export const SHOPPING_PURGE_AFTER_MS = SHOPPING_PURGE_AFTER_DAYS * 24 * 60 * 60 * 1000;

export const isShoppingSettledSlug = (slug: string | null | undefined): boolean =>
  slug === 'completed' || slug === 'discarded';

/** True si el artículo lleva más de 7 días en comprado/descartado. */
export const isStaleSettledShoppingTask = (
  columnChangedAt: string | undefined,
  now = Date.now()
): boolean => {
  if (!columnChangedAt) return false;
  const at = Date.parse(columnChangedAt);
  if (Number.isNaN(at)) return false;
  return now - at >= SHOPPING_PURGE_AFTER_MS;
};
