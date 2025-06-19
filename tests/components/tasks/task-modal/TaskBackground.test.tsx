import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskBackground } from '../../../../src/components/tasks/task-modal/TaskBackground';

describe('TaskBackground', () => {
  const defaultProps = {
    backgroundImage: '',
    isLoading: false,
    onGenerate: vi.fn(),
    onRemove: vi.fn(),
  };

  test('should render correctly without background image', () => {
    render(<TaskBackground {...defaultProps} />);

    expect(screen.getByText('Background Image')).toBeInTheDocument();
    expect(screen.getByLabelText('Generate new background image')).toBeInTheDocument();
    expect(screen.queryByLabelText('Remove background image')).not.toBeInTheDocument();
    expect(screen.queryByAltText('Task background')).not.toBeInTheDocument();
  });

  test('should render with background image', () => {
    const backgroundImage = 'https://example.com/image.jpg';
    render(<TaskBackground {...defaultProps} backgroundImage={backgroundImage} />);

    expect(screen.getByAltText('Task background')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove background image')).toBeInTheDocument();
    expect(screen.getByLabelText('Generate new background image')).toBeInTheDocument();

    const img = screen.getByAltText('Task background') as HTMLImageElement;
    expect(img.src).toBe(backgroundImage);
  });

  test('should call onGenerate when generate button is clicked', () => {
    const onGenerate = vi.fn();
    render(<TaskBackground {...defaultProps} onGenerate={onGenerate} />);

    const generateButton = screen.getByLabelText('Generate new background image');
    fireEvent.click(generateButton);

    expect(onGenerate).toHaveBeenCalled();
  });

  test('should call onRemove when remove button is clicked', () => {
    const onRemove = vi.fn();
    const backgroundImage = 'https://example.com/image.jpg';
    render(
      <TaskBackground {...defaultProps} backgroundImage={backgroundImage} onRemove={onRemove} />
    );

    const removeButton = screen.getByLabelText('Remove background image');
    fireEvent.click(removeButton);

    expect(onRemove).toHaveBeenCalled();
  });

  test('should show loading state when isLoading is true', () => {
    render(<TaskBackground {...defaultProps} isLoading={true} />);

    expect(screen.getByLabelText('Generating background image...')).toBeInTheDocument();
    expect(screen.queryByLabelText('Generate new background image')).not.toBeInTheDocument();
  });

  test('should disable generate button when loading', () => {
    render(<TaskBackground {...defaultProps} isLoading={true} />);

    const generateButton = screen.getByLabelText('Generating background image...');
    expect(generateButton).toBeDisabled();
  });

  test('should show spinner icon when loading', () => {
    render(<TaskBackground {...defaultProps} isLoading={true} />);

    const generateButton = screen.getByLabelText('Generating background image...');
    const spinnerIcon = generateButton.querySelector('.animate-spin');
    expect(spinnerIcon).toBeInTheDocument();
  });

  test('should show photo icon when not loading', () => {
    render(<TaskBackground {...defaultProps} isLoading={false} />);

    const generateButton = screen.getByLabelText('Generate new background image');
    const photoIcon = generateButton.querySelector('svg');
    expect(photoIcon).toBeInTheDocument();
  });

  test('should have correct CSS classes for background image container', () => {
    const backgroundImage = 'https://example.com/image.jpg';
    render(<TaskBackground {...defaultProps} backgroundImage={backgroundImage} />);

    const container = screen.getByAltText('Task background').parentElement;
    expect(container).toHaveClass('relative', 'h-24', 'w-full', 'overflow-hidden', 'rounded-lg');
  });

  test('should have correct CSS classes for background image', () => {
    const backgroundImage = 'https://example.com/image.jpg';
    render(<TaskBackground {...defaultProps} backgroundImage={backgroundImage} />);

    const img = screen.getByAltText('Task background');
    expect(img).toHaveClass('w-full', 'h-full', 'object-cover');
  });

  test('should have gradient overlay on background image', () => {
    const backgroundImage = 'https://example.com/image.jpg';
    render(<TaskBackground {...defaultProps} backgroundImage={backgroundImage} />);

    const overlay = screen.getByAltText('Task background').nextElementSibling;
    expect(overlay).toHaveClass(
      'absolute',
      'inset-0',
      'bg-gradient-to-t',
      'from-black/50',
      'to-transparent'
    );
  });

  test('should not show remove button when no background image', () => {
    render(<TaskBackground {...defaultProps} backgroundImage="" />);

    expect(screen.queryByLabelText('Remove background image')).not.toBeInTheDocument();
  });

  test('should handle generate button click when not loading', () => {
    const onGenerate = vi.fn();
    render(<TaskBackground {...defaultProps} onGenerate={onGenerate} isLoading={false} />);

    const generateButton = screen.getByLabelText('Generate new background image');
    fireEvent.click(generateButton);

    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  test('should not call onGenerate when button is disabled during loading', () => {
    const onGenerate = vi.fn();
    render(<TaskBackground {...defaultProps} onGenerate={onGenerate} isLoading={true} />);

    const generateButton = screen.getByLabelText('Generating background image...');
    fireEvent.click(generateButton);

    expect(onGenerate).not.toHaveBeenCalled();
  });

  test('should have correct button types', () => {
    const backgroundImage = 'https://example.com/image.jpg';
    render(<TaskBackground {...defaultProps} backgroundImage={backgroundImage} />);

    const generateButton = screen.getByLabelText('Generate new background image');
    const removeButton = screen.getByLabelText('Remove background image');

    expect(generateButton).toHaveAttribute('type', 'button');
    expect(removeButton).toHaveAttribute('type', 'button');
  });

  test('should have correct label text', () => {
    render(<TaskBackground {...defaultProps} />);

    expect(screen.getByText('Background Image')).toBeInTheDocument();
  });

  test('should handle multiple generate clicks', () => {
    const onGenerate = vi.fn();
    render(<TaskBackground {...defaultProps} onGenerate={onGenerate} />);

    const generateButton = screen.getByLabelText('Generate new background image');
    fireEvent.click(generateButton);
    fireEvent.click(generateButton);

    expect(onGenerate).toHaveBeenCalledTimes(2);
  });

  test('should handle multiple remove clicks', () => {
    const onRemove = vi.fn();
    const backgroundImage = 'https://example.com/image.jpg';
    render(
      <TaskBackground {...defaultProps} backgroundImage={backgroundImage} onRemove={onRemove} />
    );

    const removeButton = screen.getByLabelText('Remove background image');
    fireEvent.click(removeButton);
    fireEvent.click(removeButton);

    expect(onRemove).toHaveBeenCalledTimes(2);
  });
});
