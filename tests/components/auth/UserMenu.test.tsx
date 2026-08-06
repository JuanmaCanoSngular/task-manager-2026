import '@testing-library/jest-dom';
import { describe, test, expect, vi, afterEach, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { setupWindowMocks } from '../../utils/component-test-utils';

const signOut = vi.fn();
const deleteAccount = vi.fn();

vi.mock('../../../src/services/auth.service', () => ({
  authService: {
    signOut: () => signOut(),
    deleteAccount: () => deleteAccount(),
  },
}));

vi.mock('../../../src/stores/board.store', () => ({
  useBoardStore: Object.assign(vi.fn(), { setState: vi.fn() }),
}));

vi.mock('../../../src/stores/tag.store', () => ({
  useTagStore: Object.assign(vi.fn(), { setState: vi.fn() }),
}));

beforeAll(() => {
  setupWindowMocks();
});

beforeEach(() => {
  signOut.mockClear();
  deleteAccount.mockReset();
  deleteAccount.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('UserMenu', () => {
  test('no se muestra si auth está desactivada', async () => {
    vi.stubEnv('VITE_AUTH_ENABLED', 'false');
    vi.resetModules();
    const { UserMenu } = await import('../../../src/components/auth/UserMenu');
    const { container } = render(<UserMenu />);
    expect(container).toBeEmptyDOMElement();
  });

  test('abre menú y cierra sesión', async () => {
    vi.stubEnv('VITE_AUTH_ENABLED', 'true');
    vi.resetModules();
    const { UserMenu } = await import('../../../src/components/auth/UserMenu');
    render(<UserMenu />);

    fireEvent.click(screen.getByRole('button', { name: /menú de cuenta/i }));
    fireEvent.click(await screen.findByRole('menuitem', { name: /cerrar sesión/i }));
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  test('elimina cuenta tras confirmar', async () => {
    vi.stubEnv('VITE_AUTH_ENABLED', 'true');
    vi.resetModules();
    const { UserMenu } = await import('../../../src/components/auth/UserMenu');
    render(<UserMenu />);

    fireEvent.click(screen.getByRole('button', { name: /menú de cuenta/i }));
    fireEvent.click(await screen.findByRole('menuitem', { name: /eliminar cuenta/i }));

    expect(screen.getByRole('heading', { name: /eliminar tu cuenta/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^eliminar cuenta$/i }));

    await waitFor(() => {
      expect(deleteAccount).toHaveBeenCalledTimes(1);
    });
  });
});
