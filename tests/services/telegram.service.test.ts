import { describe, test, expect, vi, beforeEach } from 'vitest';

const invoke = vi.fn();

vi.mock('../../src/services/supabase', () => ({
  supabase: {
    functions: { invoke: (...args: unknown[]) => invoke(...args) },
  },
}));

describe('telegramService', () => {
  beforeEach(() => {
    invoke.mockReset();
    vi.resetModules();
  });

  test('getStatus invoca telegram-link con action status', async () => {
    invoke.mockResolvedValue({
      data: { linked: false, linkedAt: null, botUsername: null, botUrl: null },
      error: null,
    });
    const { telegramService } = await import('../../src/services/telegram.service');
    const status = await telegramService.getStatus();
    expect(invoke).toHaveBeenCalledWith('telegram-link', { body: { action: 'status' } });
    expect(status.linked).toBe(false);
  });

  test('lanza si la function responde error', async () => {
    invoke.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const { telegramService } = await import('../../src/services/telegram.service');
    await expect(telegramService.generateCode()).rejects.toThrow(/boom/);
  });
});
