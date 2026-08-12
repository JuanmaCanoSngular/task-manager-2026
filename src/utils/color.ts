/** Normaliza a #rrggbb en minúsculas. Valores inválidos → #808080. */
export const normalizeHex = (color: string): string => {
  let hex = color.trim().toLowerCase();
  if (!hex.startsWith('#')) hex = `#${hex}`;
  if (/^#[0-9a-f]{3}$/.test(hex)) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  if (!/^#[0-9a-f]{6}$/.test(hex)) return '#808080';
  return hex;
};

export const colorsEqual = (a: string, b: string): boolean =>
  normalizeHex(a) === normalizeHex(b);

export const isPresetColor = (color: string, presets: readonly string[]): boolean =>
  presets.some((preset) => colorsEqual(preset, color));
