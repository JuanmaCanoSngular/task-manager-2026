interface BoardNameProps {
  value: string;
  onChange: (value: string) => void;
}

export const BoardName = ({ value, onChange }: BoardNameProps) => (
  <div>
    <label
      htmlFor="boardName"
      className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
    >
      Board name
    </label>
    <input
      type="text"
      id="boardName"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:bg-gray-700 sm:text-sm sm:leading-6 transition-all duration-200"
      placeholder="Enter board name"
      required
    />
  </div>
);
