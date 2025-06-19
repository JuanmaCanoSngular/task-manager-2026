import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { TaskStatus } from '../../../../src/components/tasks/task-modal/TaskStatus';
import { TASK_STATUS } from '../../../../src/interfaces/task.interface';

describe('TaskStatus', () => {
  const defaultProps = {
    value: TASK_STATUS[0].status,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render correctly with default status', () => {
    render(<TaskStatus {...defaultProps} />);
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText(TASK_STATUS[0].label)).toBeInTheDocument();
  });

  test('should render with different status values', () => {
    TASK_STATUS.forEach((status) => {
      const { unmount } = render(<TaskStatus {...defaultProps} value={status.status} />);
      expect(screen.getByText(status.label)).toBeInTheDocument();
      unmount();
    });
  });

  test('should display correct status color', () => {
    TASK_STATUS.forEach((status) => {
      const { unmount } = render(<TaskStatus {...defaultProps} value={status.status} />);
      const colorElement = document.querySelector('.w-3.h-3.rounded-full');
      expect(colorElement).toHaveClass(status.color);
      unmount();
    });
  });

  test('should render with an invalid status gracefully', () => {
    render(
      <TaskStatus
        {...defaultProps}
        value={'invalid-status' as (typeof TASK_STATUS)[number]['status']}
      />
    );
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  test('should have correct accessibility attributes', () => {
    render(<TaskStatus {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
  });

  test('should handle button structure correctly', () => {
    render(<TaskStatus {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('relative', 'w-full', 'cursor-default', 'rounded-lg');
    expect(button.querySelector('.flex.items-center.gap-2')).toBeInTheDocument();
    expect(
      button.querySelector('.pointer-events-none.absolute.inset-y-0.right-0')
    ).toBeInTheDocument();
  });
});
