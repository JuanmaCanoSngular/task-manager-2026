import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardForm } from '../../../../src/components/boards/board-modal/BoardForm';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
    })),
  });
});

describe('BoardForm', () => {
  test('should render', () => {
    render(<BoardForm onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByLabelText(/nombre del tablero/i)).toBeInTheDocument();
  });

  test('al crear pregunta si es lista de la compra', () => {
    const onSubmit = vi.fn();
    render(<BoardForm onSubmit={onSubmit} onCancel={() => {}} showKindPicker />);

    fireEvent.change(screen.getByLabelText(/nombre del tablero/i), {
      target: { value: 'Mercadona' },
    });
    fireEvent.click(screen.getByRole('radio', { name: /lista de la compra/i }));
    fireEvent.click(screen.getByRole('button', { name: /crear tablero/i }));

    expect(onSubmit).toHaveBeenCalledWith('Mercadona', expect.any(String), 'shopping');
  });

  test('en edición no muestra el tipo de tablero', () => {
    render(
      <BoardForm
        onSubmit={() => {}}
        onCancel={() => {}}
        initialName="Productividad"
        submitLabel="Guardar cambios"
      />
    );
    expect(screen.queryByRole('radio', { name: /lista de la compra/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/tipo de tablero/i)).not.toBeInTheDocument();
  });
});
