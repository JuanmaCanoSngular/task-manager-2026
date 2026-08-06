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
      Nombre del tablero
    </label>
    <input
      type="text"
      id="boardName"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-base"
      placeholder="Escribe el nombre del tablero"
      required
    />
  </div>
);
