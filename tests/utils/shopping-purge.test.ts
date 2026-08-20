import { describe, expect, test } from 'vitest';
import {
  SHOPPING_PURGE_AFTER_MS,
  isShoppingSettledSlug,
  isStaleSettledShoppingTask,
} from '../../src/utils/shopping-purge';

describe('shopping-purge', () => {
  test('solo comprado y descartado cuentan como resueltos', () => {
    expect(isShoppingSettledSlug('completed')).toBe(true);
    expect(isShoppingSettledSlug('discarded')).toBe(true);
    expect(isShoppingSettledSlug('backlog')).toBe(false);
  });

  test('no purga sin fecha de cambio de columna', () => {
    expect(isStaleSettledShoppingTask(undefined)).toBe(false);
  });

  test('purga a los 7 días o más', () => {
    const now = Date.parse('2026-08-20T10:00:00.000Z');
    const sevenDaysAgo = new Date(now - SHOPPING_PURGE_AFTER_MS).toISOString();
    const sixDaysAgo = new Date(now - SHOPPING_PURGE_AFTER_MS + 60_000).toISOString();
    expect(isStaleSettledShoppingTask(sevenDaysAgo, now)).toBe(true);
    expect(isStaleSettledShoppingTask(sixDaysAgo, now)).toBe(false);
  });
});
