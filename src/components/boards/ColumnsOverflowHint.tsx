import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

interface ColumnsOverflowHintProps {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
}

export const ColumnsOverflowHint = ({
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
}: ColumnsOverflowHintProps) => {
  if (!canScrollLeft && !canScrollRight) return null;

  return (
    <>
      {canScrollLeft ? (
        <div className="board-columns-fade board-columns-fade--left">
          <button
            type="button"
            className="board-columns-fade__btn"
            onClick={onScrollLeft}
            aria-label="Ver columnas anteriores"
            title="Hay más columnas"
          >
            <ChevronLeftIcon className="w-5 h-5" aria-hidden />
          </button>
        </div>
      ) : null}
      {canScrollRight ? (
        <div className="board-columns-fade board-columns-fade--right">
          <button
            type="button"
            className="board-columns-fade__btn"
            onClick={onScrollRight}
            aria-label="Ver más columnas"
            title="Hay más columnas"
          >
            <ChevronRightIcon className="w-5 h-5" aria-hidden />
          </button>
        </div>
      ) : null}
    </>
  );
};
