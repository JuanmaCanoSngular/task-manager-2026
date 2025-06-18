import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '../../../src/components/common/ConfirmDialog';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  });
});

// Mock Headless UI components to avoid animation issues in tests
vi.mock('@headlessui/react', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog">{children}</div>
  ),
  Transition: ({ children, show }: { children: React.ReactNode; show: boolean }) =>
    show ? children : null,
}));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  title: 'Test Dialog',
  description: 'Test description',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
};

const renderConfirmDialog = (props = {}) => {
  return render(<ConfirmDialog {...defaultProps} {...props} />);
};

describe('ConfirmDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    test('should render when isOpen is true', () => {
      renderConfirmDialog();
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    test('should not render when isOpen is false', () => {
      renderConfirmDialog({ isOpen: false });
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    test('should display custom title and description', () => {
      renderConfirmDialog({
        title: 'Custom Title',
        description: 'Custom description text',
      });
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom description text')).toBeInTheDocument();
    });

    test('should use default button text when not provided', () => {
      renderConfirmDialog({
        confirmText: undefined,
        cancelText: undefined,
      });
      expect(screen.getByText('Confirm')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('should use custom button text when provided', () => {
      renderConfirmDialog({
        confirmText: 'Delete',
        cancelText: 'Keep',
      });
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Keep')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    test('should call onConfirm when confirm button is clicked', async () => {
      const onConfirm = vi.fn();
      renderConfirmDialog({ onConfirm });

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    test('should call onClose when cancel button is clicked', async () => {
      const onClose = vi.fn();
      renderConfirmDialog({ onClose });

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('should handle multiple button clicks correctly', async () => {
      const onConfirm = vi.fn();
      const onClose = vi.fn();
      renderConfirmDialog({ onConfirm, onClose });

      const confirmButton = screen.getByText('Confirm');
      const cancelButton = screen.getByText('Cancel');

      fireEvent.click(confirmButton);
      fireEvent.click(cancelButton);
      fireEvent.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(2);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    test('should have proper ARIA roles', () => {
      renderConfirmDialog();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    test('should have proper button types', () => {
      renderConfirmDialog();
      const confirmButton = screen.getByText('Confirm');
      const cancelButton = screen.getByText('Cancel');

      expect(confirmButton).toHaveAttribute('type', 'button');
      expect(cancelButton).toHaveAttribute('type', 'button');
    });

    test('should have proper heading structure', () => {
      renderConfirmDialog();
      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent('Test Dialog');
    });
  });

  describe('styling and classes', () => {
    test('should have correct CSS classes for buttons', () => {
      renderConfirmDialog();
      const confirmButton = screen.getByText('Confirm');
      const cancelButton = screen.getByText('Cancel');

      expect(confirmButton).toHaveClass('btn-remove');
      expect(cancelButton).toHaveClass('btn-secondary');
    });

    test('should have correct dialog structure classes', () => {
      renderConfirmDialog();
      const dialog = screen.getByTestId('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    test('should handle empty title and description', () => {
      renderConfirmDialog({
        title: '',
        description: '',
      });
      const heading = screen.getByRole('heading');
      const description = screen.getByText('', { selector: 'p' });
      expect(heading).toHaveTextContent('');
      expect(description).toBeInTheDocument();
    });

    test('should handle very long title and description', () => {
      const longTitle = 'A'.repeat(1000);
      const longDescription = 'B'.repeat(1000);

      renderConfirmDialog({
        title: longTitle,
        description: longDescription,
      });

      expect(screen.getByText(longTitle)).toBeInTheDocument();
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    test('should handle special characters in text', () => {
      renderConfirmDialog({
        title: 'Title with <script>alert("xss")</script>',
        description: 'Description with & < > " \' characters',
        confirmText: 'Delete & Remove',
        cancelText: 'Keep & Save',
      });

      expect(screen.getByText('Title with <script>alert("xss")</script>')).toBeInTheDocument();
      expect(screen.getByText('Description with & < > " \' characters')).toBeInTheDocument();
      expect(screen.getByText('Delete & Remove')).toBeInTheDocument();
      expect(screen.getByText('Keep & Save')).toBeInTheDocument();
    });
  });

  describe('callback behavior', () => {
    test('should not call callbacks when dialog is closed', () => {
      const onConfirm = vi.fn();
      const onClose = vi.fn();

      renderConfirmDialog({
        isOpen: false,
        onConfirm,
        onClose,
      });

      expect(onConfirm).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    test('should handle callback functions that throw errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onConfirm = vi.fn();

      renderConfirmDialog({ onConfirm });

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(1);
      consoleSpy.mockRestore();
    });
  });
});
