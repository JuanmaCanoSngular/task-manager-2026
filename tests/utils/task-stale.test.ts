import { describe, expect, test } from 'vitest';
import { getStaleDaysInActiveColumn, STALE_ACTIVE_DAYS } from '../../src/utils/task-stale';

describe('task-stale', () => {
  const now = Date.parse('2026-11-22T12:00:00.000Z');

  test('no avisa fuera de en progreso / bloqueos', () => {
    expect(
      getStaleDaysInActiveColumn(
        'backlog',
        '2026-11-01T00:00:00.000Z',
        undefined,
        now
      )
    ).toBeNull();
  });

  test('avisa a partir del umbral en bloqueos', () => {
    const old = new Date(now - STALE_ACTIVE_DAYS * 24 * 60 * 60 * 1000).toISOString();
    expect(getStaleDaysInActiveColumn('in-review', old, undefined, now)).toBe(STALE_ACTIVE_DAYS);
  });

  test('no avisa si aún no llega al umbral', () => {
    const recent = new Date(now - (STALE_ACTIVE_DAYS - 1) * 24 * 60 * 60 * 1000).toISOString();
    expect(getStaleDaysInActiveColumn('in-progress', recent, undefined, now)).toBeNull();
  });

  test('usa createdAt si no hay columnChangedAt', () => {
    const old = new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString();
    expect(getStaleDaysInActiveColumn('in-progress', undefined, old, now)).toBe(5);
  });
});
