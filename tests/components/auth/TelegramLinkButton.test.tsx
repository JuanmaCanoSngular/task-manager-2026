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

describe('TelegramLinkButton', () => {
  test('no se muestra si auth está desactivada', async () => {
    vi.stubEnv('VITE_AUTH_ENABLED', 'false');
    vi.resetModules();
    const { TelegramLinkButton } = await import(
      '../../../src/components/auth/TelegramLinkButton'
    );
    const { container } = render(<TelegramLinkButton />);
    expect(container).toBeEmptyDOMElement();
  });

  test('con auth activa, abre el diálogo y genera código', async () => {
    vi.stubEnv('VITE_AUTH_ENABLED', 'true');
    vi.resetModules();
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

    const { TelegramLinkButton } = await import(
      '../../../src/components/auth/TelegramLinkButton'
    );
    render(<TelegramLinkButton />);

    fireEvent.click(screen.getByRole('button', { name: /vincular telegram/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /vincular telegram/i })).toBeInTheDocument();
    });
    expect(getStatus).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /generar código/i }));

    await waitFor(() => {
      expect(screen.getByText('/start ABC123')).toBeInTheDocument();
    });
    expect(generateCode).toHaveBeenCalled();
  });
});
