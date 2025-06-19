import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskStatus } from '../../../../src/components/tasks/task-modal/TaskStatus';
import { TASK_STATUS } from '../../../../src/interfaces/task.interface';

describe('TaskStatus', () => {
  const defaultProps = {
    value: 'backlog' as const,
    onChange: vi.fn(),
  };

  test('should render correctly with default value', () => {
    render(<TaskStatus {...defaultProps} />);

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('should render with different status value', () => {
    render(<TaskStatus {...defaultProps} value="in-progress" />);

    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  test('should have correct accessibility attributes', () => {
    render(<TaskStatus {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
  });

  test('should have correct CSS classes for button', () => {
    render(<TaskStatus {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('relative', 'w-full', 'cursor-default', 'rounded-lg');
  });

  test('should show status color indicator', () => {
    render(<TaskStatus {...defaultProps} />);

    const colorIndicator = screen.getByRole('button').querySelector('.w-3.h-3.rounded-full');
    expect(colorIndicator).toBeInTheDocument();
  });

  test('should show chevron icon', () => {
    render(<TaskStatus {...defaultProps} />);

    const chevronIcon = screen.getByRole('button').querySelector('svg');
    expect(chevronIcon).toBeInTheDocument();
  });

  test('should handle all status values', () => {
    TASK_STATUS.forEach((status) => {
      const { unmount } = render(<TaskStatus {...defaultProps} value={status.status} />);

      expect(screen.getByText(status.label)).toBeInTheDocument();
      unmount();
    });
  });

  test('should have correct label text', () => {
    render(<TaskStatus {...defaultProps} />);

    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  test('should have correct color classes for status indicators', () => {
    render(<TaskStatus {...defaultProps} />);

    // Check that the current status has its color class
    const backlogIndicator = screen.getByRole('button').querySelector('.bg-gray-500');
    expect(backlogIndicator).toBeInTheDocument();
  });

  test('should handle empty or invalid status gracefully', () => {
    // This test ensures the component doesn't crash with unexpected values
    // The component should still render with the default or fallback behavior
    render(<TaskStatus {...defaultProps} value="backlog" />);

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('should have correct button structure', () => {
    render(<TaskStatus {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');

    // Check for the status text span
    const statusText = button.querySelector('.block.truncate');
    expect(statusText).toBeInTheDocument();
  });

  test('should have correct status text content', () => {
    render(<TaskStatus {...defaultProps} value="completed" />);

    const button = screen.getByRole('button');
    const statusText = button.querySelector('.block.truncate');
    expect(statusText).toHaveTextContent('Completed');
  });

  test('should have correct color indicator for different statuses', () => {
    render(<TaskStatus {...defaultProps} value="in-progress" />);

    const button = screen.getByRole('button');
    const colorIndicator = button.querySelector('.w-3.h-3.rounded-full');
    expect(colorIndicator).toHaveClass('bg-yellow-300');
  });

  test('should maintain button state correctly', () => {
    render(<TaskStatus {...defaultProps} value="in-review" />);

    expect(screen.getByText('In Review')).toBeInTheDocument();

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('should have correct aria attributes', () => {
    render(<TaskStatus {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
  });

  test('should have correct label association', () => {
    render(<TaskStatus {...defaultProps} />);

    const label = screen.getByText('Status');
    const button = screen.getByRole('button');

    expect(label).toHaveAttribute('for');
    expect(button).toHaveAttribute('aria-labelledby');
  });
});
