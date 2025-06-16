interface TaskTitleProps {
  value: string;
  onChange: (value: string) => void;
}

export const TaskTitle = ({ value, onChange }: TaskTitleProps) => (
  <div className="space-y-2">
    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Task Title
    </label>
    <input
      type="text"
      id="title"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:bg-gray-700 sm:text-sm sm:leading-6"
      placeholder="Enter a descriptive title for your task"
      required
    />
  </div>
);
