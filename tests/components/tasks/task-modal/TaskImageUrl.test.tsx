import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskImageUrl } from '../../../../src/components/tasks/task-modal/TaskImageUrl';
import { isValidImageUrl } from '../../../../src/utils/imageUrl';

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
  test('muestra preview con URL válida', () => {
    render(<TaskImageUrl value="https://example.com/foto.jpg" onChange={() => undefined} />);
    expect(screen.getByAltText('Vista previa de la imagen')).toHaveAttribute(
      'src',
      'https://example.com/foto.jpg'
    );
  });

  test('avisa si la URL no es válida', () => {
    render(<TaskImageUrl value="hola" onChange={() => undefined} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/http/i);
  });

  test('propaga onChange', () => {
    const onChange = vi.fn();
    render(<TaskImageUrl value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/imagen/i), {
      target: { value: 'https://x.test/a.jpg' },
    });
    expect(onChange).toHaveBeenCalledWith('https://x.test/a.jpg');
  });
});
