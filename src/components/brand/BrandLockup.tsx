import { BRAND_NAME } from '../../brand';
import { BrandMark } from './BrandMark';

interface BrandLockupProps {
  /** Tamaño del icono en px */
  markSize?: number;
  /** Logo encima del nombre (landing / hero) */
  stacked?: boolean;
  /** Mostrar tagline bajo el nombre */
  showTagline?: boolean;
  tagline?: string;
  className?: string;
  /** Clases del wordmark */
  wordmarkClassName?: string;
}

export const BrandLockup = ({
  markSize = 32,
  stacked = false,
  showTagline = false,
  tagline,
  className = '',
  wordmarkClassName = '',
}: BrandLockupProps) => (
  <span
    className={`inline-flex ${stacked ? 'flex-col items-center gap-3 text-center' : 'items-center gap-2.5'} ${className}`}
  >
    <BrandMark size={markSize} className={stacked ? 'shadow-[var(--shadow-brand)] rounded-[14px]' : undefined} />
    <span className={`flex flex-col leading-none ${stacked ? 'items-center' : 'items-start text-left'}`}>
      <span
        className={`font-sans font-bold tracking-tight ${stacked ? 'text-2xl sm:text-3xl' : 'text-[1.25rem]'} ${wordmarkClassName}`}
        style={{ color: 'var(--text)' }}
      >
        {BRAND_NAME}
      </span>
      {showTagline && tagline ? (
        <span
          className={`mt-1.5 font-medium ${stacked ? 'text-sm' : 'text-xs'}`}
          style={{ color: 'var(--text-muted)' }}
        >
          {tagline}
        </span>
      ) : null}
    </span>
  </span>
);
