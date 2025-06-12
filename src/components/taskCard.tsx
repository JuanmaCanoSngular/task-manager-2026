import { Task } from '../interfaces/task.interface';

export const TaskCard = ({ task }: { task: Task }) => {
    return (
        <>
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
        </>
    );
};
