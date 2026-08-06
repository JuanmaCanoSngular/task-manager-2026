import { useId } from 'react';

interface BrandMarkProps {
  size?: number;
  className?: string;
}

/**
 * Marca: tres columnas en una tarjeta — Kanban esencial.
 * El acento en la tercera columna anticipa «Bloqueos».
 */
export const BrandMark = ({ size = 32, className }: BrandMarkProps) => {
  const gid = useId().replace(/:/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`anota-bg-${gid}`} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand)" />
          <stop offset="1" stopColor="var(--brand-2)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#anota-bg-${gid})`} />
      <rect x="7" y="9" width="4.5" height="14" rx="1.75" fill="#fff" fillOpacity="0.92" />
      <rect x="13.75" y="7" width="4.5" height="16" rx="1.75" fill="#fff" fillOpacity="0.92" />
      <rect x="20.5" y="11" width="4.5" height="12" rx="1.75" fill="#fff" fillOpacity="0.55" />
      <circle cx="22.75" cy="9" r="2.25" fill="#f43f5e" />
    </svg>
  );
};
