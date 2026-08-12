import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { TaskForm } from '../../../../src/components/tasks/task-modal/TaskForm';
import { MOCK_COLUMNS } from '../../../utils/mock-columns';

const MOCK_TAGS = [
  { tag: 'tag-urgente', label: 'Urgente' },
  { tag: 'tag-idea', label: 'Idea' },
  { tag: 'tag-importante', label: 'Importante' },
  { tag: 'tag-extra', label: 'Extra' },
];

vi.mock('../../../../src/stores/board.store', () => ({
  useCurrentBoardColumns: () => MOCK_COLUMNS,
}));

vi.mock('../../../../src/components/tasks/task-modal/TaskTitle', () => ({
  TaskTitle: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <div className="space-y-2">
      <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Task Title
      </label>
      <input
        id="title"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter a descriptive title for your task"
        required
        className="block w-full rounded-lg border-0 py-3 px-4"
      />
    </div>
  ),
}));

vi.mock('../../../../src/components/tasks/task-modal/TaskColumnSelect', () => ({
  TaskColumnSelect: ({
    columns,
    value,
  }: {
    columns: { id: number; name: string }[];
    value: number;
    onChange: (value: number) => void;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Columna</label>
      <span>{columns.find((c) => c.id === value)?.name ?? 'Pendiente'}</span>
    </div>
  ),
}));

vi.mock('../../../../src/components/tasks/task-modal/TaskTags', () => ({
  TaskTags: ({
    selectedTags,
    onToggleTag,
  }: {
    selectedTags: string[];
    showWarning: boolean;
    onToggleTag: (tag: string) => void;
    onManage?: () => void;
  }) => (
    <div>
      <div aria-label="Available tags for the task">
        {MOCK_TAGS.map((tagOption) => {
          const isSelected = selectedTags.includes(tagOption.tag);
          return (
            <button
              key={tagOption.tag}
              type="button"
              onClick={() => onToggleTag(tagOption.tag)}
              aria-label={
                isSelected ? `Deselect tag ${tagOption.tag}` : `Select tag ${tagOption.tag}`
              }
            >
              {tagOption.tag}
            </button>
          );
        })}
      </div>
      <span>{selectedTags.length}/4 selected</span>
    </div>
  ),
}));

describe('TaskForm', () => {
  const defaultProps = {
    mode: 'create' as const,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render form with all components', () => {
    render(<TaskForm {...defaultProps} />);

    expect(screen.getByLabelText('Task Title')).toBeInTheDocument();
    expect(screen.getByText('Columna')).toBeInTheDocument();
    expect(screen.getByLabelText('Available tags for the task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Añadir tarea' })).toBeInTheDocument();
  });

  test('should handle title input changes', () => {
    render(<TaskForm {...defaultProps} />);

    const titleInput = screen.getByLabelText('Task Title') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'New Task Title' } });

    expect(titleInput.value).toBe('New Task Title');
  });

  test('should handle tag selection', () => {
    render(<TaskForm {...defaultProps} />);

    const tagButton = screen.getByRole('button', { name: 'Select tag tag-urgente' });
    fireEvent.click(tagButton);

    expect(screen.getByRole('button', { name: 'Deselect tag tag-urgente' })).toBeInTheDocument();
    expect(screen.getByText('1/4 selected')).toBeInTheDocument();
  });

  test('should handle tag deselection', () => {
    const initialData = {
      tags: ['tag-urgente'],
    };

    render(<TaskForm {...defaultProps} initialData={initialData} />);

    const tagButton = screen.getByRole('button', { name: 'Deselect tag tag-urgente' });
    fireEvent.click(tagButton);

    expect(screen.getByRole('button', { name: 'Select tag tag-urgente' })).toBeInTheDocument();
    expect(screen.getByText('0/4 selected')).toBeInTheDocument();
  });

  test('should prevent selecting more than max tags', () => {
    const initialData = {
      tags: ['tag-urgente', 'tag-idea', 'tag-importante', 'tag-extra'],
    };

    render(<TaskForm {...defaultProps} initialData={initialData} />);

    expect(screen.getByText('4/4 selected')).toBeInTheDocument();
  });

  test('should handle form submission with valid data', () => {
    render(<TaskForm {...defaultProps} />);

    const titleInput = screen.getByLabelText('Task Title');
    const submitButton = screen.getByRole('button', { name: 'Añadir tarea' });

    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.click(submitButton);

    expect(defaultProps.onSubmit).toHaveBeenCalledWith({
      title: 'Test Task',
      columnId: 1,
      tags: [],
      background: undefined,
    });
  });

  test('incluye la URL de imagen al enviar', () => {
    render(<TaskForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Task Title'), { target: { value: 'Con foto' } });
    fireEvent.change(screen.getByLabelText(/imagen/i), {
      target: { value: 'https://cdn.example.com/a.jpg' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Añadir tarea' }));

    expect(defaultProps.onSubmit).toHaveBeenCalledWith({
      title: 'Con foto',
      columnId: 1,
      tags: [],
      background: 'https://cdn.example.com/a.jpg',
    });
  });

  test('should not submit form with empty title', () => {
    render(<TaskForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: 'Añadir tarea' });
    fireEvent.click(submitButton);

    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  test('should handle cancel button click', () => {
    render(<TaskForm {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  test('should update form when initialData changes', () => {
    const { rerender } = render(<TaskForm {...defaultProps} />);

    const initialData = {
      title: 'Updated Task',
      columnId: 4,
      tags: ['tag-urgente'],
    };

    rerender(<TaskForm {...defaultProps} initialData={initialData} />);

    const titleInput = screen.getByLabelText('Task Title') as HTMLInputElement;
    expect(titleInput.value).toBe('Updated Task');
    expect(screen.getByRole('button', { name: 'Deselect tag tag-urgente' })).toBeInTheDocument();
  });

  test('should show correct button text for edit mode', () => {
    render(<TaskForm {...defaultProps} mode="edit" />);

    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument();
  });

  test('should have correct form structure', () => {
    render(<TaskForm {...defaultProps} />);

    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveClass('space-y-6');
    expect(form?.parentElement).toHaveClass('mt-6', 'space-y-6');
    expect(screen.getByRole('button', { name: 'Añadir tarea' })).toHaveAttribute('form', 'task-form');
  });
});
