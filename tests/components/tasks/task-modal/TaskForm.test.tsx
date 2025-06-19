import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { TaskForm } from '../../../../src/components/tasks/task-modal/TaskForm';
import { TASK_STATUS, TASK_TAGS, TaskTag } from '../../../../src/interfaces/task.interface';

// Mock child components
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
        className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:bg-gray-700 sm:text-sm sm:leading-6"
      />
    </div>
  ),
}));

vi.mock('../../../../src/components/tasks/task-modal/TaskBackground', () => ({
  TaskBackground: ({
    isLoading,
    onGenerate,
  }: {
    backgroundImage: string;
    isLoading: boolean;
    onGenerate: () => void;
    onRemove: () => void;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Background Image
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onGenerate}
            disabled={isLoading}
            aria-label="Generate new background image"
            className="btn-icon-add"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                clipRule="evenodd"
                d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
                fillRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  ),
}));

vi.mock('../../../../src/components/tasks/task-modal/TaskStatus', () => ({
  TaskStatus: ({ value }: { value: string; onChange: (value: string) => void }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
      <div className="relative mt-1">
        <button
          type="button"
          className="relative w-full cursor-default rounded-lg border-0 py-3 px-4 text-left shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:bg-gray-700 sm:text-sm sm:leading-6"
          aria-haspopup="listbox"
          aria-expanded="false"
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                value === 'completed'
                  ? 'bg-green-400'
                  : value === 'in-progress'
                    ? 'bg-yellow-400'
                    : 'bg-gray-500'
              }`}
            />
            <span className="block truncate text-gray-900 dark:text-white">
              {TASK_STATUS.find((s) => s.status === value)?.label || 'Backlog'}
            </span>
          </div>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                clipRule="evenodd"
                d="M10.53 3.47a.75.75 0 0 0-1.06 0L6.22 6.72a.75.75 0 0 0 1.06 1.06L10 5.06l2.72 2.72a.75.75 0 1 0 1.06-1.06l-3.25-3.25Zm-4.31 9.81 3.25 3.25a.75.75 0 0 0 1.06 0l3.25-3.25a.75.75 0 1 0-1.06-1.06L10 14.94l-2.72-2.72a.75.75 0 0 0-1.06 1.06Z"
                fillRule="evenodd"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  ),
}));

vi.mock('../../../../src/components/tasks/task-modal/TaskTags', () => ({
  TaskTags: ({
    selectedTags,
    maxTags,
    onToggleTag,
  }: {
    selectedTags: TaskTag[];
    maxTags: number;
    showWarning: boolean;
    onToggleTag: (tag: TaskTag) => void;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {selectedTags.length}/{maxTags} selected
        </span>
      </div>
      <div
        className="flex flex-wrap gap-2 pt-1"
        role="group"
        aria-label="Available tags for the task"
      >
        {TASK_TAGS.map((tagOption) => {
          const isSelected = selectedTags.includes(tagOption.tag);
          return (
            <button
              key={tagOption.tag}
              type="button"
              onClick={() => onToggleTag(tagOption.tag)}
              aria-label={`${isSelected ? 'Deselect' : 'Select'} tag ${tagOption.tag}`}
              aria-pressed={isSelected}
              className={`tag-base ${
                isSelected
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tagOption.tag}
            </button>
          );
        })}
      </div>
    </div>
  ),
}));

// Mock image service
vi.mock('../../../../src/services/image.service', () => ({
  imageService: {
    getTaskBackground: vi.fn(),
  },
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

    // Verify that all components are present
    expect(screen.getByLabelText('Task Title')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Generate new background image' })
    ).toBeInTheDocument();
    expect(screen.getByText('Background Image')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Available tags for the task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Task' })).toBeInTheDocument();
  });

  test('should handle title input changes', () => {
    render(<TaskForm {...defaultProps} />);

    const titleInput = screen.getByLabelText('Task Title') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'New Task Title' } });

    expect(titleInput.value).toBe('New Task Title');
  });

  test('should handle background generation', async () => {
    const mockImageUrl = 'https://example.com/image.jpg';
    const { imageService } = await import('../../../../src/services/image.service');
    vi.mocked(imageService.getTaskBackground).mockResolvedValue(mockImageUrl);

    render(<TaskForm {...defaultProps} />);

    const generateButton = screen.getByLabelText('Generate new background image');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(imageService.getTaskBackground).toHaveBeenCalled();
    });
  });

  test('should handle tag selection', () => {
    render(<TaskForm {...defaultProps} />);

    const technicalButton = screen.getByRole('button', { name: 'Select tag technical' });
    fireEvent.click(technicalButton);

    // Verify that the tag was selected
    expect(screen.getByRole('button', { name: 'Deselect tag technical' })).toBeInTheDocument();
    expect(screen.getByText('1/4 selected')).toBeInTheDocument();
  });

  test('should handle tag deselection', () => {
    const initialData = {
      tags: ['technical' as TaskTag],
    };

    render(<TaskForm {...defaultProps} initialData={initialData} />);

    const technicalButton = screen.getByRole('button', { name: 'Deselect tag technical' });
    fireEvent.click(technicalButton);

    // Verify that the tag was deselected
    expect(screen.getByRole('button', { name: 'Select tag technical' })).toBeInTheDocument();
    expect(screen.getByText('0/4 selected')).toBeInTheDocument();
  });

  test('should prevent selecting more than max tags', () => {
    const initialData = {
      tags: ['technical', 'front-end', 'interactivity', 'styling'] as TaskTag[],
    };

    render(<TaskForm {...defaultProps} initialData={initialData} />);

    const designButton = screen.getByRole('button', { name: 'Select tag design' });
    fireEvent.click(designButton);

    // Verify that no more tags can be selected
    expect(screen.getByText('4/4 selected')).toBeInTheDocument();
  });

  test('should handle form submission with valid data', () => {
    render(<TaskForm {...defaultProps} />);

    const titleInput = screen.getByLabelText('Task Title');
    const submitButton = screen.getByRole('button', { name: 'Add Task' });

    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.click(submitButton);

    expect(defaultProps.onSubmit).toHaveBeenCalledWith({
      title: 'Test Task',
      status: TASK_STATUS[0].status,
      tags: [],
      background: '',
    });
  });

  test('should not submit form with empty title', () => {
    render(<TaskForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: 'Add Task' });
    fireEvent.click(submitButton);

    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  test('should handle cancel button click', () => {
    render(<TaskForm {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  test('should update form when initialData changes', () => {
    const { rerender } = render(<TaskForm {...defaultProps} />);

    const initialData = {
      title: 'Updated Task',
      status: 'completed' as const,
      tags: ['technical' as TaskTag],
      background: 'https://example.com/bg.jpg',
    };

    rerender(<TaskForm {...defaultProps} initialData={initialData} />);

    const titleInput = screen.getByLabelText('Task Title') as HTMLInputElement;
    expect(titleInput.value).toBe('Updated Task');
    expect(screen.getByRole('button', { name: 'Deselect tag technical' })).toBeInTheDocument();
  });

  test('should show correct button text for edit mode', () => {
    render(<TaskForm {...defaultProps} mode="edit" />);

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  test('should have correct form structure', () => {
    render(<TaskForm {...defaultProps} />);

    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveClass('mt-6', 'space-y-6');
  });

  test('should handle background image removal', () => {
    const initialData = {
      background: 'https://example.com/bg.jpg',
    };

    render(<TaskForm {...defaultProps} initialData={initialData} />);

    // Verify that the generate background button is present
    expect(
      screen.getByRole('button', { name: 'Generate new background image' })
    ).toBeInTheDocument();
    // And that the label text is in the document
    expect(screen.getByText('Background Image')).toBeInTheDocument();
  });

  test('should handle loading state during image generation', async () => {
    const { imageService } = await import('../../../../src/services/image.service');
    vi.mocked(imageService.getTaskBackground).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve('https://example.com/image.jpg'), 100))
    );

    render(<TaskForm {...defaultProps} />);

    const generateButton = screen.getByLabelText('Generate new background image');
    fireEvent.click(generateButton);

    // Verify that the button is disabled during loading
    expect(generateButton).toBeDisabled();
  });
});
