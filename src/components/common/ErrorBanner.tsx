import { XMarkIcon } from '@heroicons/react/20/solid';
import { useBoardStore } from '../../stores/board.store';

// Muestra el último error del store (p. ej. un fallo de escritura en Supabase).
// Se cierra manualmente o al limpiarse el error en el store.
export const ErrorBanner = () => {
  const error = useBoardStore((state) => state.error);

  if (!error) return null;

  return (
    <div
      role="alert"
      className="mx-4 mb-2 flex items-center justify-between gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200"
    >
      <span>{error}</span>
      <button
        type="button"
        onClick={() => useBoardStore.setState({ error: null })}
        aria-label="Cerrar aviso de error"
        className="flex-shrink-0 rounded p-1 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 dark:hover:bg-red-800/40"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
