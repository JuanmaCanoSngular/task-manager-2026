import { Board } from '../interfaces/board.interface';

interface BoardCardProps {
    board: Board;
    fetchBoardDetails: (link: string) => void;
}

export const BoardCard = ({ board, fetchBoardDetails }: BoardCardProps) => {
    return (
        <>
            <button
                key={board.id}
                onClick={() => fetchBoardDetails(board.link)}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-left"
            >
                <h2 className="text-xl font-semibold">{board.name}</h2>
                <p className="text-gray-600 mt-2">Click para ver las tareas</p>
            </button>
        </>
    );
};
