import { useEffect } from 'react';
import { useBoardStore } from './stores/board.store';
import { useTaskStore } from './stores/task.store';

const App = () => {
    const { boards, isLoading: boardsLoading, error: boardsError, fetchBoards } = useBoardStore();
    const {
        currentBoard,
        isLoading: tasksLoading,
        error: tasksError,
        fetchBoardDetails,
    } = useTaskStore();

    useEffect(() => {
        fetchBoards();
    }, [fetchBoards]);

    const handleBoardClick = (url: string) => {
        fetchBoardDetails(url);
    };

    if (boardsLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-600">Cargando boards...</p>
            </div>
        );
    }

    if (boardsError) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-100">
                <p className="text-xl text-red-600">Error: {boardsError}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <h1 className="text-3xl font-bold text-blue-600 mb-6">Task Manager</h1>

            {currentBoard ? (
                <div className="mb-6">
                    <button
                        onClick={() => useTaskStore.getState().setCurrentBoard(null)}
                        className="mb-4 text-blue-600 hover:text-blue-800"
                    >
                        ← Volver a los boards
                    </button>

                    {tasksLoading ? (
                        <p className="text-xl text-gray-600">Cargando tareas...</p>
                    ) : tasksError ? (
                        <p className="text-xl text-red-600">Error: {tasksError}</p>
                    ) : (
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">{currentBoard.name}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {currentBoard.tasks?.map((task) => (
                                    <div key={task.id} className="bg-white p-4 rounded-lg shadow">
                                        <h3 className="font-semibold">{task.title}</h3>
                                        <p className="text-gray-600 text-sm mt-2">{task.title}</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {task.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {boards.map((board) => (
                        <button
                            key={board.id}
                            onClick={() => handleBoardClick(board.link)}
                            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-left"
                        >
                            <h2 className="text-xl font-semibold">{board.name}</h2>
                            <p className="text-gray-600 mt-2">Click para ver las tareas</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default App;
