interface PushPinIconProps {
  className?: string;
}

/** Chincheta inclinada (thumbtack). */
export const PushPinIcon = ({ className = 'w-4 h-4' }: PushPinIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M14.72 2.18a2.2 2.2 0 0 1 3.1.08l.92.92a2.2 2.2 0 0 1 .08 3.1l-.7.78 2.12 2.12a1.15 1.15 0 0 1-1.63 1.63l-.62-.62-4.74 4.74.9 3.14a1 1 0 0 1-1.57 1.08L8.7 15.27 4.4 19.56a1 1 0 0 1-1.41-1.41l4.29-4.3-3.88-3.88a1 1 0 0 1 1.08-1.57l3.14.9 4.74-4.74-.62-.62a1.15 1.15 0 1 1 1.63-1.63l2.12 2.12.78-.7Z" />
  </svg>
);
