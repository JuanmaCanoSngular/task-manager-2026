/** Días en En progreso o Bloqueos antes de mostrar aviso suave. */
export const STALE_ACTIVE_DAYS = 3;

export const STALE_WATCH_SLUGS = new Set(['in-progress', 'in-review']);

export const daysSince = (iso: string | undefined, now = Date.now()): number | null => {
  if (!iso) return null;
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return null;
  const diff = now - at;
  if (diff < 0) return 0;
  return Math.floor(diff / (24 * 60 * 60 * 1000));
};

/**
 * True si la tarea lleva ≥ N días en En progreso o Bloqueos.
 * Usa `columnChangedAt` si existe; si no, `createdAt`.
 */
export const getStaleDaysInActiveColumn = (
  columnSlug: string | null | undefined,
  columnChangedAt: string | undefined,
  createdAt: string | undefined,
  now = Date.now(),
  threshold = STALE_ACTIVE_DAYS
): number | null => {
  if (!columnSlug || !STALE_WATCH_SLUGS.has(columnSlug)) return null;
  const days = daysSince(columnChangedAt ?? createdAt, now);
  if (days == null || days < threshold) return null;
  return days;
};
