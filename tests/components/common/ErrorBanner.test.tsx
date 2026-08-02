import '@testing-library/jest-dom';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.resetModules();
});

const mockStore = (error: string | null, setState = vi.fn()) => {
  vi.doMock('../../../src/stores/board.store', () => ({
    useBoardStore: Object.assign(
      (selector: (state: { error: string | null }) => unknown) => selector({ error }),
      { setState }
    ),
  }));
};

describe('ErrorBanner', () => {
  test('muestra el mensaje de error cuando existe', async () => {
    mockStore('Fallo al guardar');
    const { ErrorBanner } = await import('../../../src/components/common/ErrorBanner');

    render(<ErrorBanner />);

    expect(screen.getByRole('alert')).toHaveTextContent('Fallo al guardar');
  });

  test('no renderiza nada cuando no hay error', async () => {
    mockStore(null);
    const { ErrorBanner } = await import('../../../src/components/common/ErrorBanner');

    render(<ErrorBanner />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('al cerrar limpia el error en el store', async () => {
    const setState = vi.fn();
    mockStore('Fallo al guardar', setState);
    const { ErrorBanner } = await import('../../../src/components/common/ErrorBanner');

    render(<ErrorBanner />);
    fireEvent.click(screen.getByRole('button', { name: /cerrar aviso de error/i }));

    expect(setState).toHaveBeenCalledWith({ error: null });
  });
});
