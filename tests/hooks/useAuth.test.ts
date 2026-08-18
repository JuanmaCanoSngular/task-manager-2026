import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const authService = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthChange: vi.fn(() => () => {}),
  getAccessStatus: vi.fn(),
  requestAccess: vi.fn(() => Promise.resolve()),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../../src/services/auth.service', () => ({ authService }));

import { useAuth } from '../../src/hooks/useAuth';

beforeEach(() => {
  vi.clearAllMocks();
});

/** Simula onAuthStateChange INITIAL_SESSION: el callback se dispara síncronamente al suscribirse. */
const mockInitialSession = (session: { user: { id: string; email: string } } | null) => {
  authService.onAuthChange.mockImplementation((cb: (s: typeof session) => void) => {
    cb(session);
    return () => {};
  });
};

describe('useAuth', () => {
  test('sin sesión: estado signed-out', async () => {
    mockInitialSession(null);
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.state).toBe('signed-out'));
  });

  test('sesión con perfil aprobado: estado approved', async () => {
    mockInitialSession({ user: { id: 'u1', email: 'a@b.com' } });
    authService.getAccessStatus.mockResolvedValue('approved');
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.state).toBe('approved'));
    expect(authService.requestAccess).not.toHaveBeenCalled();
  });

  test('sesión sin perfil: solicita acceso y queda pending', async () => {
    mockInitialSession({ user: { id: 'u2', email: 'c@d.com' } });
    authService.getAccessStatus.mockResolvedValue(null);
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.state).toBe('pending'));
    expect(authService.requestAccess).toHaveBeenCalled();
  });

  test('sesión con perfil pending: estado pending sin volver a solicitar', async () => {
    mockInitialSession({ user: { id: 'u3', email: 'e@f.com' } });
    authService.getAccessStatus.mockResolvedValue('pending');
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.state).toBe('pending'));
    expect(authService.requestAccess).not.toHaveBeenCalled();
  });

  test('error en getAccessStatus: no queda en loading', async () => {
    mockInitialSession({ user: { id: 'u4', email: 'g@h.com' } });
    authService.getAccessStatus.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.state).toBe('signed-out'));
  });
});
