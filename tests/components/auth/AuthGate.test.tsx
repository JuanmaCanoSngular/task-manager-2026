import '@testing-library/jest-dom';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

const useAuthMock = vi.fn();
vi.mock('../../../src/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

import { AuthGate } from '../../../src/components/auth/AuthGate';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const base = {
  user: null,
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
};

describe('AuthGate', () => {
  test('loading: muestra el spinner de carga', () => {
    useAuthMock.mockReturnValue({ ...base, state: 'loading' });
    render(
      <AuthGate>
        <div data-testid="app">app</div>
      </AuthGate>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('app')).not.toBeInTheDocument();
  });

  test('signed-out: muestra la landing con botón de Google', () => {
    useAuthMock.mockReturnValue({ ...base, state: 'signed-out' });
    render(
      <AuthGate>
        <div data-testid="app">app</div>
      </AuthGate>
    );
    expect(screen.getByRole('button', { name: /entrar con google/i })).toBeInTheDocument();
    expect(screen.queryByTestId('app')).not.toBeInTheDocument();
  });

  test('pending: muestra la pantalla de acceso pendiente', () => {
    useAuthMock.mockReturnValue({
      ...base,
      state: 'pending',
      user: { email: 'test@example.com' },
    });
    render(
      <AuthGate>
        <div data-testid="app">app</div>
      </AuthGate>
    );
    expect(screen.getByText(/pendiente de aprobación/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    expect(screen.queryByTestId('app')).not.toBeInTheDocument();
  });

  test('approved: renderiza la app', () => {
    useAuthMock.mockReturnValue({ ...base, state: 'approved' });
    render(
      <AuthGate>
        <div data-testid="app">app</div>
      </AuthGate>
    );
    expect(screen.getByTestId('app')).toBeInTheDocument();
  });
});
