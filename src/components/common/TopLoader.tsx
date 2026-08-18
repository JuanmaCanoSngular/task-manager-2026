import { useBoardStore } from '../../stores/board.store';

/**
 * Barra horizontal fina (2 px) anclada arriba de la ventana.
 * Visible mientras el store está cargando datos.
 */
export const TopLoader = () => {
  const loading = useBoardStore((s) => s.loading);
  if (!loading) return null;

  return (
    <div
      role="progressbar"
      aria-label="Cargando"
      className="fixed inset-x-0 top-0 z-[100] h-[2px] overflow-hidden"
      style={{ backgroundColor: 'color-mix(in srgb, var(--brand) 20%, transparent)' }}
    >
      <div className="top-loader-bar h-full" style={{ backgroundColor: 'var(--brand)' }} />
    </div>
  );
};
