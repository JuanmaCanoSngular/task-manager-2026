interface BoardActionsProps {
  isSubmitting: boolean;
  isValid: boolean;
  onCancel: () => void;
  submitLabel?: string;
}

export const BoardActions = ({
  isSubmitting,
  isValid,
  onCancel,
  submitLabel = 'Crear tablero',
}: BoardActionsProps) => (
  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
    <button type="button" onClick={onCancel} className="btn-secondary">
      Cancelar
    </button>
    <button type="submit" disabled={!isValid || isSubmitting} className="btn-primary">
      {isSubmitting ? 'Guardando…' : submitLabel}
    </button>
  </div>
);
