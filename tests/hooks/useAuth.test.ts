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

describe('useAuth', () => {
  test('sin sesión: estado signed-out', async () => {
    authService.getSession.mockResolvedValue(null);
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.state).toBe('signed-out'));
  });

  test('sesión con perfil aprobado: estado approved', async () => {
    authService.getSession.mockResolvedValue({ user: { id: 'u1', email: 'a@b.com' } });
    authService.getAccessStatus.mockResolvedValue('approved');
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.state).toBe('approved'));
    expect(authService.requestAccess).not.toHaveBeenCalled();
  });

  test('sesión sin perfil: solicita acceso y queda pending', async () => {
    authService.getSession.mockResolvedValue({ user: { id: 'u2', email: 'c@d.com' } });
    authService.getAccessStatus.mockResolvedValue(null);
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.state).toBe('pending'));
    expect(authService.requestAccess).toHaveBeenCalled();
  });

  test('sesión con perfil pending: estado pending sin volver a solicitar', async () => {
    authService.getSession.mockResolvedValue({ user: { id: 'u3', email: 'e@f.com' } });
    authService.getAccessStatus.mockResolvedValue('pending');
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.state).toBe('pending'));
    expect(authService.requestAccess).not.toHaveBeenCalled();
  });
});
