interface BoardActionsProps {
  isSubmitting: boolean;
  isValid: boolean;
  onCancel: () => void;
}

export const BoardActions = ({ isSubmitting, isValid, onCancel }: BoardActionsProps) => (
  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
    <button
      type="button"
      onClick={onCancel}
      className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105"
    >
      Cancel
    </button>
    <button type="submit" disabled={!isValid || isSubmitting} className="btn-add">
      {isSubmitting ? 'Creating...' : 'Create board'}
    </button>
  </div>
);
