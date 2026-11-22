import { describe, test, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  clampColumnWidth,
  COLUMN_COLLAPSED_WIDTH,
  COLUMN_MAX_WIDTH,
  COLUMN_MIN_WIDTH,
  useColumnLayout,
} from '../../src/hooks/useColumnLayout';

describe('useColumnLayout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('clamp limita el ancho', () => {
    expect(clampColumnWidth(10)).toBe(COLUMN_MIN_WIDTH);
    expect(clampColumnWidth(9999)).toBe(COLUMN_MAX_WIDTH);
    expect(clampColumnWidth(300)).toBe(300);
  });

  test('guarda ancho y colapso en localStorage', () => {
    const { result } = renderHook(() => useColumnLayout(7));

    act(() => {
      result.current.setWidth(11, 320);
      result.current.toggleCollapsed(12);
    });

    expect(result.current.getWidth(11)).toBe(320);
    expect(result.current.isCollapsed(12)).toBe(true);
    expect(result.current.shellWidth(12)).toBe(COLUMN_COLLAPSED_WIDTH);
    expect(result.current.shellWidth(11)).toBe(320);

    const stored = JSON.parse(localStorage.getItem('taskblero-column-layout:7')!);
    expect(stored.widths['11']).toBe(320);
    expect(stored.collapsed).toContain(12);
  });

  test('toggleCollapsed expande de nuevo', () => {
    const { result } = renderHook(() => useColumnLayout(3));
    act(() => result.current.toggleCollapsed(1));
    expect(result.current.isCollapsed(1)).toBe(true);
    act(() => result.current.toggleCollapsed(1));
    expect(result.current.isCollapsed(1)).toBe(false);
  });
});
