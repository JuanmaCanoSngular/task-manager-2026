import { useBoardStore } from '../../stores/board.store';

export const NoBoardSelected = () => {
  const boards = useBoardStore((state) => state.boards);
  const fetchBoards = useBoardStore((state) => state.fetchBoards);
  const hasBoards = boards.length > 0;

  const handleReset = () => {
    fetchBoards();
  };

  return (
    <div className="w-full h-full shadow-xl dark:bg-card-dark rounded-lg p-4">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          {hasBoards ? (
            <>
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                Por favor, selecciona un tablero
              </h3>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                <span className="hidden md:inline">
                  Elige un tablero en la barra lateral para ver sus tareas
                </span>
                <span className="md:hidden">
                  Elige un tablero en el menú desplegable para ver sus tareas
                </span>
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                No hay tableros disponibles
              </h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                No hay tableros que mostrar. Añade uno nuevo o restaura los tableros iniciales.
              </p>
              <div className="flex justify-center">
                <button onClick={handleReset} className="btn-add">
                  Restaurar tableros iniciales
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
