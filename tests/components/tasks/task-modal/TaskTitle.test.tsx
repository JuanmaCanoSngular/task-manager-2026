import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskTitle } from '../../../../src/components/tasks/task-modal/TaskTitle';

describe('TaskTitle', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
  };

  test('should render correctly with empty value', () => {
    render(<TaskTitle {...defaultProps} />);

    expect(screen.getByLabelText('Task Title')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter a descriptive title for your task')
    ).toBeInTheDocument();
  });

  test('should render with provided value', () => {
    const value = 'Test Task Title';
    render(<TaskTitle {...defaultProps} value={value} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe(value);
  });

  test('should call onChange when input value changes', () => {
    const onChange = vi.fn();
    render(<TaskTitle {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Task Title' } });

    expect(onChange).toHaveBeenCalledWith('New Task Title');
  });

  test('should have correct accessibility attributes', () => {
    render(<TaskTitle {...defaultProps} />);

    const input = screen.getByRole('textbox');
    const label = screen.getByText('Task Title');

    expect(input).toHaveAttribute('id', 'title');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('required');
    expect(label).toHaveAttribute('for', 'title');
  });

  test('should have correct CSS classes', () => {
    render(<TaskTitle {...defaultProps} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('block', 'w-full', 'rounded-lg', 'border-0');
  });

  test('should handle special characters in input', () => {
    const onChange = vi.fn();
    render(<TaskTitle {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    const specialText = 'Task with @#$%^&*() characters';
    fireEvent.change(input, { target: { value: specialText } });

    expect(onChange).toHaveBeenCalledWith(specialText);
  });

  test('should handle long text input', () => {
    const onChange = vi.fn();
    render(<TaskTitle {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    const longText = 'A'.repeat(100);
    fireEvent.change(input, { target: { value: longText } });

    expect(onChange).toHaveBeenCalledWith(longText);
  });

  test('should have correct label text', () => {
    render(<TaskTitle {...defaultProps} />);

    expect(screen.getByText('Task Title')).toBeInTheDocument();
  });

  test('should have correct placeholder text', () => {
    render(<TaskTitle {...defaultProps} />);

    expect(
      screen.getByPlaceholderText('Enter a descriptive title for your task')
    ).toBeInTheDocument();
  });

  test('should handle multiple input changes', () => {
    const onChange = vi.fn();
    render(<TaskTitle {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'First' } });
    fireEvent.change(input, { target: { value: 'Second' } });
    fireEvent.change(input, { target: { value: 'Third' } });

    expect(onChange).toHaveBeenCalledWith('First');
    expect(onChange).toHaveBeenCalledWith('Second');
    expect(onChange).toHaveBeenCalledWith('Third');
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  test('should handle input with numbers', () => {
    const onChange = vi.fn();
    render(<TaskTitle {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Task 123' } });

    expect(onChange).toHaveBeenCalledWith('Task 123');
  });

  test('should handle input with emojis', () => {
    const onChange = vi.fn();
    render(<TaskTitle {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Task with 🚀 emoji' } });

    expect(onChange).toHaveBeenCalledWith('Task with 🚀 emoji');
  });
});
