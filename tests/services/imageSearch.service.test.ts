import { describe, test, expect, beforeEach, vi } from 'vitest';

const invoke = vi.fn();

vi.mock('../../src/services/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => invoke(...args),
    },
  },
}));

import { imageSearchService } from '../../src/services/imageSearch.service';

beforeEach(() => {
  invoke.mockReset();
});

describe('imageSearchService', () => {
  test('invoca search-images con query y page', async () => {
    invoke.mockResolvedValue({
      data: {
        provider: 'unsplash',
        total: 1,
        page: 1,
        results: [
          {
            id: '1',
            thumbUrl: 'https://t.jpg',
            fullUrl: 'https://f.jpg',
            alt: 'x',
            photographer: 'Ada',
            photographerUrl: 'https://unsplash.com/@ada',
          },
        ],
      },
      error: null,
    });

    const result = await imageSearchService.search('oficina', 2);

    expect(invoke).toHaveBeenCalledWith('search-images', {
      body: { query: 'oficina', page: 2 },
    });
    expect(result.results).toHaveLength(1);
  });

  test('falla con query vacía', async () => {
    await expect(imageSearchService.search('  ')).rejects.toThrow(/término/i);
  });

  test('propaga error de la función', async () => {
    invoke.mockResolvedValue({
      data: { error: 'Buscador de imágenes no configurado (falta UNSPLASH_ACCESS_KEY)' },
      error: null,
    });

    await expect(imageSearchService.search('casa')).rejects.toThrow(/UNSPLASH/i);
  });
});
