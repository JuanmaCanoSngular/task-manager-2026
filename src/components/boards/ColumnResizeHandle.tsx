import { useEffect, useRef, useState } from 'react';
import { clampColumnWidth } from '../../hooks/useColumnLayout';

interface ColumnResizeHandleProps {
  columnId: number;
  disabled?: boolean;
  /** Ancho actual visible (medido o guardado). */
  getStartWidth: () => number;
  onResize: (columnId: number, width: number) => void;
}

/** Barra invisible en el borde derecho; al hover muestra hint de redimensionar. */
export const ColumnResizeHandle = ({
  columnId,
  disabled = false,
  getStartWidth,
  onResize,
}: ColumnResizeHandleProps) => {
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startW = useRef(0);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - startX.current;
      onResize(columnId, clampColumnWidth(startW.current + dx));
    };
    const onUp = () => setDragging(false);

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragging, columnId, onResize]);

  if (disabled) return null;

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Redimensionar columna"
      aria-valuenow={Math.round(getStartWidth())}
      tabIndex={0}
      className={`board-column-resize ${dragging ? 'board-column-resize--active' : ''}`}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startX.current = e.clientX;
        startW.current = getStartWidth();
        setDragging(true);
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
      onKeyDown={(e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        e.stopPropagation();
        const delta = e.key === 'ArrowRight' ? 16 : -16;
        onResize(columnId, clampColumnWidth(getStartWidth() + delta));
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    />
  );
};
