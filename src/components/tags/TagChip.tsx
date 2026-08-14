import type { CSSProperties } from 'react';

interface TagChipProps {
  name: string;
  color: string;
  /** sm = card / cabecera; md = selector del modal */
  size?: 'sm' | 'md';
  /** false = no seleccionada en el picker / atenuada */
  active?: boolean;
  /** Filtro activo: más color y anillo */
  selected?: boolean;
  className?: string;
}

/** Chip de etiqueta: punto de color + nombre, sin relleno chillón. */
export const TagChip = ({
  name,
  color,
  size = 'sm',
  active = true,
  selected = false,
  className = '',
}: TagChipProps) => {
  const fill = selected ? 32 : active ? 16 : 0;
  const style = {
    backgroundColor:
      fill > 0 ? `color-mix(in srgb, ${color} ${fill}%, var(--surface))` : 'var(--surface-2)',
    boxShadow: selected
      ? `inset 0 0 0 1.5px ${color}`
      : active
        ? `inset 0 0 0 1px color-mix(in srgb, ${color} 30%, var(--border))`
        : 'inset 0 0 0 1px var(--border)',
    color: selected || active ? 'var(--text)' : 'var(--text-muted)',
  } satisfies CSSProperties;

  return (
    <span
      className={`tag-chip ${size === 'md' ? 'tag-chip--md' : 'tag-chip--sm'} ${selected ? 'font-semibold' : ''} ${className}`}
      style={style}
    >
      <span className="tag-chip__dot" style={{ backgroundColor: color }} aria-hidden />
      <span className="truncate">{name}</span>
    </span>
  );
};
