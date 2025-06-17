export const NoBoardSelected = () => {
  return (
    <div className="w-full h-full shadow-xl dark:bg-card-dark rounded-lg p-4">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
            Please, select a board
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            <span className="hidden md:inline">
              Choose a board from the sidebar to view its tasks
            </span>
            <span className="md:hidden">Choose a board from the select menu to view its tasks</span>
          </p>
        </div>
      </div>
    </div>
  );
};
