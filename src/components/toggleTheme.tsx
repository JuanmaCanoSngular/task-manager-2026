export const ToggleTheme = () => {
  return (
    <div className="flex bg-gray-800 rounded-lg p-1 w-fit">
      <button className="flex items-center px-4 py-2 rounded-l-lg focus:outline-none bg-gray-900 text-white">
        <span className="mr-2">🌙</span> Dark
      </button>
      <button className="flex items-center px-4 py-2 rounded-r-lg focus:outline-none bg-gray-700 text-white">
        <span className="mr-2">☀️</span> Light
      </button>
    </div>
  );
};
