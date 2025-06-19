import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskModal } from '../../../../src/components/tasks/task-modal/TaskModal';
import { Task } from '../../../../src/interfaces/task.interface';

// Mock the TaskForm component
vi.mock('../../../../src/components/tasks/task-modal/TaskForm', () => ({
  TaskForm: ({
    mode,
    initialData,
    onSubmit,
    onCancel,
  }: {
    mode: 'create' | 'edit';
    initialData?: Partial<Task>;
    onSubmit: (data: Omit<Task, 'id'>) => void;
    onCancel: () => void;
  }) => (
    <div>
      <div>{mode}</div>
      {initialData && <div>{JSON.stringify(initialData)}</div>}
      <button onClick={() => onSubmit({ title: 'Test Task', status: 'backlog', tags: [] })}>
        Submit
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('TaskModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    mode: 'create' as const,
    onSubmit: vi.fn(),
  };

  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    status: 'in-progress',
    tags: ['technical'],
    background: 'https://example.com/image.jpg',
  };

  test('should render correctly when open in create mode', () => {
    render(<TaskModal {...defaultProps} />);
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByText('create')).toBeInTheDocument();
  });

  test('should render correctly when open in edit mode', () => {
    render(<TaskModal {...defaultProps} mode="edit" task={mockTask} />);
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByText('edit')).toBeInTheDocument();
    expect(screen.getByText(JSON.stringify(mockTask))).toBeInTheDocument();
  });

  test('should not render when closed', () => {
    render(<TaskModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Add New Task')).not.toBeInTheDocument();
    expect(screen.queryByText('create')).not.toBeInTheDocument();
  });

  test('should call onClose when close button is clicked', () => {
    render(<TaskModal {...defaultProps} isOpen={true} />);

    // Find close button by class
    const closeButton = document.querySelector('.modal-close-button') as HTMLElement;
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('should call onSubmit when form is submitted', () => {
    const onSubmit = vi.fn();
    render(<TaskModal {...defaultProps} onSubmit={onSubmit} />);
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Test Task',
      status: 'backlog',
      tags: [],
    });
  });

  test('should call onClose when form cancel is clicked', () => {
    const onClose = vi.fn();
    render(<TaskModal {...defaultProps} onClose={onClose} />);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(onClose).toHaveBeenCalled();
  });

  test('should have correct accessibility attributes', () => {
    render(<TaskModal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveTextContent('Add New Task');
  });

  test('should have correct CSS classes', () => {
    render(<TaskModal {...defaultProps} isOpen={true} />);

    // Find container and wrapper by class
    const container = document.querySelector('.modal-container') as HTMLElement;
    const wrapper = document.querySelector('.modal-wrapper') as HTMLElement;

    expect(container).toBeInTheDocument();
    expect(wrapper).toBeInTheDocument();
  });

  test('should pass correct props to TaskForm in create mode', () => {
    render(<TaskModal {...defaultProps} />);
    expect(screen.getByText('create')).toBeInTheDocument();
    expect(screen.queryByText(JSON.stringify(mockTask))).not.toBeInTheDocument();
  });

  test('should pass correct props to TaskForm in edit mode', () => {
    render(<TaskModal {...defaultProps} mode="edit" task={mockTask} />);
    expect(screen.getByText('edit')).toBeInTheDocument();
    expect(screen.getByText(JSON.stringify(mockTask))).toBeInTheDocument();
  });

  test('should have correct close button structure', () => {
    render(<TaskModal {...defaultProps} />);
    const closeButton = document.querySelector('.modal-close-button');
    expect(closeButton).toBeInTheDocument();
    const icon = closeButton?.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  test('should have correct modal structure', () => {
    render(<TaskModal {...defaultProps} isOpen={true} />);

    // Find panel by class
    const panel = document.querySelector('.modal-panel') as HTMLElement;
    expect(panel).toBeInTheDocument();
  });

  test('should handle multiple close attempts', () => {
    const onClose = vi.fn();
    render(<TaskModal {...defaultProps} onClose={onClose} />);
    const closeButton = document.querySelector('.modal-close-button');
    expect(closeButton).toBeInTheDocument();
    if (closeButton) {
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
    }
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test('should handle form submission with task data', () => {
    const onSubmit = vi.fn();
    render(<TaskModal {...defaultProps} mode="edit" task={mockTask} onSubmit={onSubmit} />);
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Test Task',
      status: 'backlog',
      tags: [],
    });
  });

  test('should maintain focus management', () => {
    render(<TaskModal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('tabIndex', '-1');
  });

  test('should render with different task data', () => {
    const differentTask: Task = {
      id: 2,
      title: 'Different Task',
      status: 'completed',
      tags: ['front-end', 'design'],
      background: 'https://example.com/different-image.jpg',
    };
    render(<TaskModal {...defaultProps} mode="edit" task={differentTask} />);
    expect(screen.getByText(JSON.stringify(differentTask))).toBeInTheDocument();
  });

  test('should handle undefined task in edit mode', () => {
    render(<TaskModal {...defaultProps} mode="edit" isOpen={true} />);

    // There should be no initial data
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  test('should have correct z-index for modal', () => {
    render(<TaskModal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('z-50');
  });

  test('should handle rapid open/close cycles', () => {
    const onClose = vi.fn();
    const { rerender } = render(<TaskModal {...defaultProps} onClose={onClose} />);
    rerender(<TaskModal {...defaultProps} onClose={onClose} isOpen={false} />);
    rerender(<TaskModal {...defaultProps} onClose={onClose} isOpen={true} />);
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
  });

  test('should call onClose when backdrop is clicked', () => {
    render(<TaskModal {...defaultProps} isOpen={true} />);

    // Find backdrop by class
    const backdrop = document.querySelector('.modal-backdrop') as HTMLElement;
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
