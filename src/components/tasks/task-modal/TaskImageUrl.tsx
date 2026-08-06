import { isValidImageUrl } from '../../../utils/imageUrl';

interface TaskImageUrlProps {
  value: string;
  onChange: (value: string) => void;
}

export const TaskImageUrl = ({ value, onChange }: TaskImageUrlProps) => {
  const trimmed = value.trim();
  const valid = isValidImageUrl(value);
  const showPreview = Boolean(trimmed) && valid;

  return (
    <div className="space-y-2">
      <label htmlFor="background-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Imagen (URL opcional)
      </label>
      <input
        type="url"
        id="background-url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-base"
        placeholder="https://ejemplo.com/imagen.jpg"
        inputMode="url"
        autoComplete="off"
        aria-invalid={trimmed ? !valid : undefined}
        aria-describedby="background-url-hint"
      />
      <p id="background-url-hint" className="text-xs text-[var(--text-muted)]">
        Enlace externo; no subimos archivos. Déjalo vacío para quitar la imagen.
      </p>
      {trimmed && !valid && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          Usa una URL que empiece por http:// o https://
        </p>
      )}
      {showPreview && (
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <img
            src={trimmed}
            alt="Vista previa de la imagen"
            className="h-28 w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};
