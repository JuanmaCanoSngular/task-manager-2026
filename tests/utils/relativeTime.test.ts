import { describe, expect, test } from 'vitest';
import {
  formatRelativeCreatedAt,
  isRecentlyCreated,
  RECENT_TASK_MS,
} from '../../src/utils/relativeTime';

describe('formatRelativeCreatedAt', () => {
  const now = new Date('2026-08-06T15:00:00');

  test('hace N minutos', () => {
    const created = new Date(now.getTime() - 23 * 60_000).toISOString();
    expect(formatRelativeCreatedAt(created, now)).toBe('Hace 23 minutos');
  });

  test('ayer a las…', () => {
    const created = new Date('2026-08-05T03:00:00').toISOString();
    expect(formatRelativeCreatedAt(created, now)).toBe('Ayer a las 03:00');
  });

  test('el … de la semana pasada', () => {
    // miércoles 29 jul 2026 (semana anterior a la del 6 ago jueves)
    const created = new Date('2026-07-29T10:00:00').toISOString();
    expect(formatRelativeCreatedAt(created, now)).toBe('El miércoles de la semana pasada');
  });

  test('ahora', () => {
    expect(formatRelativeCreatedAt(now.toISOString(), now)).toBe('Ahora');
  });
});

describe('isRecentlyCreated', () => {
  const now = new Date('2026-08-06T15:00:00');

  test('true si < 30 min', () => {
    const created = new Date(now.getTime() - RECENT_TASK_MS + 1000).toISOString();
    expect(isRecentlyCreated(created, now)).toBe(true);
  });

  test('false si >= 30 min', () => {
    const created = new Date(now.getTime() - RECENT_TASK_MS).toISOString();
    expect(isRecentlyCreated(created, now)).toBe(false);
  });
});
