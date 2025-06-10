import { useEffect } from 'react';
import { useBoardStore } from './stores/board.store';

const App = () => {
    const { boards, isLoading, error, fetchBoards } = useBoardStore();

    useEffect(() => {
        fetchBoards();
    }, [fetchBoards]);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-600">Cargando boards...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-100">
                <p className="text-xl text-red-600">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-100">
            <div className="p-4">
                <h1 className="text-3xl font-bold text-blue-600 mb-4">Task Manager</h1>
                {boards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {boards.map((board) => (
                            <div key={board.id} className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-xl font-semibold">{board.name}</h2>
                                {/* Aquí irá el contenido de cada board */}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No hay boards disponibles</p>
                )}
            </div>
        </div>
    );
};

export default App;
