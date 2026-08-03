interface TaskTitleProps {
  value: string;
  onChange: (value: string) => void;
}

export const TaskTitle = ({ value, onChange }: TaskTitleProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Título de la tarea
      </label>
      <input
        type="text"
        id="title"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-base"
        placeholder="Escribe un título descriptivo para tu tarea"
        required
      />
    </div>
  );
};
