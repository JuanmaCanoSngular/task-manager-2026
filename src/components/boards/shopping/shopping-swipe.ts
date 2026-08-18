export const SHOPPING_SWIPE_THRESHOLD = 72;
export const SHOPPING_SWIPE_MAX = 132;

export const resolveShoppingSwipe = (
  dx: number,
  threshold = SHOPPING_SWIPE_THRESHOLD
): 'bought' | 'discarded' | null => {
  if (dx >= threshold) return 'bought';
  if (dx <= -threshold) return 'discarded';
  return null;
};
