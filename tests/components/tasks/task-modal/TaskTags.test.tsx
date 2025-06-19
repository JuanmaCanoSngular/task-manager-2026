import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskTags } from '../../../../src/components/tasks/task-modal/TaskTags';
import { TASK_TAGS, TaskTag } from '../../../../src/interfaces/task.interface';

describe('TaskTags', () => {
  const defaultProps = {
    selectedTags: [] as TaskTag[],
    maxTags: 3,
    showWarning: false,
    onToggleTag: vi.fn(),
  };

  test('should render correctly with no selected tags', () => {
    render(<TaskTags {...defaultProps} />);

    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('0/3 selected')).toBeInTheDocument();
    expect(screen.getByRole('group')).toBeInTheDocument();

    // Check that all tags are rendered
    TASK_TAGS.forEach((tag) => {
      expect(screen.getByText(tag.label)).toBeInTheDocument();
    });
  });

  test('should render with selected tags', () => {
    const selectedTags: TaskTag[] = ['technical', 'front-end'];
    render(<TaskTags {...defaultProps} selectedTags={selectedTags} />);

    expect(screen.getByText('2/3 selected')).toBeInTheDocument();

    // Check that selected tags have correct styling
    const technicalButton = screen.getByLabelText('Deselect tag Technical');
    const frontEndButton = screen.getByLabelText('Deselect tag Front End');

    expect(technicalButton).toHaveAttribute('aria-pressed', 'true');
    expect(frontEndButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should call onToggleTag when a tag is clicked', () => {
    const onToggleTag = vi.fn();
    render(<TaskTags {...defaultProps} onToggleTag={onToggleTag} />);

    const technicalButton = screen.getByLabelText('Select tag Technical');
    fireEvent.click(technicalButton);

    expect(onToggleTag).toHaveBeenCalledWith('technical');
  });

  test('should show warning when showWarning is true', () => {
    render(<TaskTags {...defaultProps} showWarning={true} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('You can select a maximum of 3 tags per task')).toBeInTheDocument();
  });

  test('should not show warning when showWarning is false', () => {
    render(<TaskTags {...defaultProps} showWarning={false} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.queryByText('You can select a maximum of 3 tags per task')
    ).not.toBeInTheDocument();
  });

  test('should have correct accessibility attributes for unselected tags', () => {
    render(<TaskTags {...defaultProps} />);

    const technicalButton = screen.getByLabelText('Select tag Technical');
    expect(technicalButton).toHaveAttribute('aria-pressed', 'false');
    expect(technicalButton).toHaveAttribute('type', 'button');
  });

  test('should have correct accessibility attributes for selected tags', () => {
    const selectedTags: TaskTag[] = ['technical'];
    render(<TaskTags {...defaultProps} selectedTags={selectedTags} />);

    const technicalButton = screen.getByLabelText('Deselect tag Technical');
    expect(technicalButton).toHaveAttribute('aria-pressed', 'true');
    expect(technicalButton).toHaveAttribute('type', 'button');
  });

  test('should have correct CSS classes for unselected tags', () => {
    render(<TaskTags {...defaultProps} />);

    const technicalButton = screen.getByLabelText('Select tag Technical');
    expect(technicalButton).toHaveClass('tag-base', 'bg-gray-100', 'text-gray-600');
  });

  test('should have correct CSS classes for selected tags', () => {
    const selectedTags: TaskTag[] = ['technical'];
    render(<TaskTags {...defaultProps} selectedTags={selectedTags} />);

    const technicalButton = screen.getByLabelText('Deselect tag Technical');
    expect(technicalButton).toHaveClass('tag-base', 'bg-red-100', 'text-red-800');
  });

  test('should handle multiple tag selections', () => {
    const onToggleTag = vi.fn();
    render(<TaskTags {...defaultProps} onToggleTag={onToggleTag} />);

    const technicalButton = screen.getByLabelText('Select tag Technical');
    const frontEndButton = screen.getByLabelText('Select tag Front End');

    fireEvent.click(technicalButton);
    fireEvent.click(frontEndButton);

    expect(onToggleTag).toHaveBeenCalledWith('technical');
    expect(onToggleTag).toHaveBeenCalledWith('front-end');
    expect(onToggleTag).toHaveBeenCalledTimes(2);
  });

  test('should handle tag deselection', () => {
    const selectedTags: TaskTag[] = ['technical'];
    const onToggleTag = vi.fn();
    render(<TaskTags {...defaultProps} selectedTags={selectedTags} onToggleTag={onToggleTag} />);

    const technicalButton = screen.getByLabelText('Deselect tag Technical');
    fireEvent.click(technicalButton);

    expect(onToggleTag).toHaveBeenCalledWith('technical');
  });

  test('should display correct count when maxTags changes', () => {
    render(<TaskTags {...defaultProps} maxTags={5} />);

    expect(screen.getByText('0/5 selected')).toBeInTheDocument();
  });

  test('should display correct count with selected tags', () => {
    const selectedTags: TaskTag[] = ['technical', 'front-end', 'design'];
    render(<TaskTags {...defaultProps} selectedTags={selectedTags} maxTags={5} />);

    expect(screen.getByText('3/5 selected')).toBeInTheDocument();
  });

  test('should render all available tags', () => {
    render(<TaskTags {...defaultProps} />);

    const expectedTags = [
      'Technical',
      'Front End',
      'Interactivity',
      'Styling',
      'Filtering',
      'Design',
      'Responsive',
      'New Concept',
    ];

    expectedTags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  test('should have correct group aria-label', () => {
    render(<TaskTags {...defaultProps} />);

    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('aria-label', 'Available tags for the task');
  });

  test('should handle empty selectedTags array', () => {
    render(<TaskTags {...defaultProps} selectedTags={[]} />);

    expect(screen.getByText('0/3 selected')).toBeInTheDocument();

    // All tags should be unselected
    TASK_TAGS.forEach((tag) => {
      const button = screen.getByLabelText(`Select tag ${tag.label}`);
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });

  test('should handle all tags selected', () => {
    const selectedTags: TaskTag[] = TASK_TAGS.map((tag) => tag.tag);
    render(<TaskTags {...defaultProps} selectedTags={selectedTags} />);

    expect(screen.getByText('8/3 selected')).toBeInTheDocument();

    // All tags should be selected
    TASK_TAGS.forEach((tag) => {
      const button = screen.getByLabelText(`Deselect tag ${tag.label}`);
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  test('should have correct button structure', () => {
    render(<TaskTags {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(TASK_TAGS.length);

    buttons.forEach((button) => {
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  test('should handle rapid tag toggling', () => {
    const onToggleTag = vi.fn();
    render(<TaskTags {...defaultProps} onToggleTag={onToggleTag} />);

    const technicalButton = screen.getByLabelText('Select tag Technical');

    fireEvent.click(technicalButton);
    fireEvent.click(technicalButton);
    fireEvent.click(technicalButton);

    expect(onToggleTag).toHaveBeenCalledTimes(3);
    expect(onToggleTag).toHaveBeenCalledWith('technical');
  });
});
