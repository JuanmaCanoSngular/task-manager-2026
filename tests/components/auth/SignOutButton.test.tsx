import '@testing-library/jest-dom';
import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

const signOut = vi.fn();

vi.mock('../../../src/services/auth.service', () => ({
  authService: {
    signOut: () => signOut(),
  },
}));

beforeEach(() => {
  signOut.mockClear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('SignOutButton', () => {
  test('no se muestra si auth está desactivada', async () => {
    vi.stubEnv('VITE_AUTH_ENABLED', 'false');
    vi.resetModules();
    const { SignOutButton } = await import('../../../src/components/auth/SignOutButton');
    const { container } = render(<SignOutButton />);
    expect(container).toBeEmptyDOMElement();
  });

  test('con auth activa, cierra sesión al pulsar', async () => {
    vi.stubEnv('VITE_AUTH_ENABLED', 'true');
    vi.resetModules();
    const { SignOutButton } = await import('../../../src/components/auth/SignOutButton');
    render(<SignOutButton />);
    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
