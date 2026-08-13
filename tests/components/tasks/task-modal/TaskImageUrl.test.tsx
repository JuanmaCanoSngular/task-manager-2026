import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskImageUrl } from '../../../../src/components/tasks/task-modal/TaskImageUrl';
import { isValidImageUrl } from '../../../../src/utils/imageUrl';

const search = vi.fn();

vi.mock('../../../../src/services/imageSearch.service', () => ({
  imageSearchService: {
    search: (...args: unknown[]) => search(...args),
  },
}));

beforeEach(() => {
  search.mockReset();
});

describe('isValidImageUrl', () => {
  test('vacío es válido', () => {
    expect(isValidImageUrl('')).toBe(true);
    expect(isValidImageUrl('   ')).toBe(true);
  });

  test('acepta http(s)', () => {
    expect(isValidImageUrl('https://cdn.example.com/a.jpg')).toBe(true);
    expect(isValidImageUrl('http://example.com/a.png')).toBe(true);
  });

  test('rechaza basura', () => {
    expect(isValidImageUrl('no-es-url')).toBe(false);
    expect(isValidImageUrl('ftp://x')).toBe(false);
  });
});

describe('TaskImageUrl', () => {
  test('muestra preview con URL válida y permite quitar', () => {
    const onChange = vi.fn();
    render(<TaskImageUrl value="https://example.com/foto.jpg" onChange={onChange} />);
    expect(screen.getByAltText('Vista previa de la imagen')).toHaveAttribute(
      'src',
      'https://example.com/foto.jpg'
    );
    fireEvent.click(screen.getByRole('button', { name: /quitar/i }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  test('busca y abre lightbox al elegir thumbnail', async () => {
    search.mockResolvedValue({
      provider: 'unsplash',
      total: 1,
      page: 1,
      results: [
        {
          id: 'p1',
          thumbUrl: 'https://images.unsplash.com/thumb.jpg',
          fullUrl: 'https://images.unsplash.com/full.jpg',
          alt: 'Oficina',
          photographer: 'Ada',
          photographerUrl: 'https://unsplash.com/@ada',
        },
      ],
    });

    const onChange = vi.fn();
    render(<TaskImageUrl value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/buscar imagen/i), {
      target: { value: 'oficina' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^buscar$/i }));

    await waitFor(() => {
      expect(search).toHaveBeenCalledWith('oficina');
    });

    fireEvent.click(screen.getByRole('button', { name: /ver oficina/i }));
    expect(await screen.findByRole('heading', { name: /vista previa/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /usar esta imagen/i }));
    expect(onChange).toHaveBeenCalledWith('https://images.unsplash.com/full.jpg');
  });

  test('muestra error de búsqueda', async () => {
    search.mockRejectedValue(new Error('Buscador no configurado'));
    render(<TaskImageUrl value="" onChange={() => undefined} />);

    fireEvent.change(screen.getByLabelText(/buscar imagen/i), {
      target: { value: 'gatos' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^buscar$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/no configurado/i);
  });
});
