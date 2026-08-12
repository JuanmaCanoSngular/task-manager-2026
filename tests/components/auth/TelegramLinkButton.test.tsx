import '@testing-library/jest-dom';
import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';

const getStatus = vi.fn();
const generateCode = vi.fn();
const unlink = vi.fn();

vi.mock('../../../src/services/telegram.service', () => ({
  telegramService: {
    getStatus: (...args: unknown[]) => getStatus(...args),
    generateCode: (...args: unknown[]) => generateCode(...args),
    unlink: (...args: unknown[]) => unlink(...args),
  },
}));

beforeEach(() => {
  getStatus.mockReset();
  generateCode.mockReset();
  unlink.mockReset();
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('TelegramLinkDialog', () => {
  test('sin vincular: genera código', async () => {
    getStatus.mockResolvedValue({
      linked: false,
      linkedAt: null,
      botUsername: 'DemoBot',
      botUrl: 'https://t.me/DemoBot',
    });
    generateCode.mockResolvedValue({
      linked: false,
      linkedAt: null,
      botUsername: 'DemoBot',
      botUrl: 'https://t.me/DemoBot',
      code: 'ABC123',
      startCommand: '/start ABC123',
      deepLink: 'https://t.me/DemoBot?start=ABC123',
      expiresAt: new Date(Date.now() + 900000).toISOString(),
    });

    const { TelegramLinkDialog } = await import(
      '../../../src/components/auth/TelegramLinkButton'
    );
    render(<TelegramLinkDialog open onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /vincular telegram/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /generar código/i }));

    await waitFor(() => {
      expect(screen.getByText('/start ABC123')).toBeInTheDocument();
    });
    expect(generateCode).toHaveBeenCalled();
  });

  test('vinculado: muestra estado y opción de desvincular', async () => {
    getStatus.mockResolvedValue({
      linked: true,
      linkedAt: '2026-08-06T12:00:00.000Z',
      botUsername: 'DemoBot',
      botUrl: 'https://t.me/DemoBot',
    });

    const { TelegramLinkDialog } = await import(
      '../../../src/components/auth/TelegramLinkButton'
    );
    render(<TelegramLinkDialog open onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /telegram vinculado/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /desvincular/i })).toBeInTheDocument();
  });
});

describe('useTelegramLink', () => {
  test('consulta el estado al montar con auth activa', async () => {
    vi.stubEnv('VITE_AUTH_ENABLED', 'true');
    vi.resetModules();
    getStatus.mockResolvedValue({
      linked: true,
      linkedAt: null,
      botUsername: 'DemoBot',
      botUrl: 'https://t.me/DemoBot',
    });

    const { useTelegramLink } = await import('../../../src/components/auth/TelegramLinkButton');

    const Probe = () => {
      const { linked } = useTelegramLink();
      return <span data-testid="linked">{linked === null ? 'loading' : String(linked)}</span>;
    };

    render(<Probe />);

    await waitFor(() => {
      expect(screen.getByTestId('linked')).toHaveTextContent('true');
    });
    expect(getStatus).toHaveBeenCalled();
  });
});
