import { describe, test, expect } from 'vitest';
import { colorsEqual, isPresetColor, normalizeHex } from '../../src/utils/color';
import { APP_COLOR_PRESETS } from '../../src/constants/color-presets';

describe('color utils', () => {
  test('normalizeHex expands 3-digit hex', () => {
    expect(normalizeHex('#abc')).toBe('#aabbcc');
  });

  test('colorsEqual compares case-insensitively', () => {
    expect(colorsEqual('#0D9488', '#0d9488')).toBe(true);
  });

  test('isPresetColor detects preset membership', () => {
    expect(isPresetColor('#0d9488', APP_COLOR_PRESETS)).toBe(true);
    expect(isPresetColor('#aabbcc', APP_COLOR_PRESETS)).toBe(false);
  });
});
