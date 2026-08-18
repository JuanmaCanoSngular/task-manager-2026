import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BoardsSidebar } from '../../../src/components/boards/BoardsSidebar';

vi.mock('../../../src/components/boards/BoardsList', () => ({
  BoardsList: () => <div>Lista de tableros</div>,
}));

const STORAGE_KEY = 'taskblero-boards-sidebar';

describe('BoardsSidebar', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  afterEach(() => {
    cleanup();
    localStorage.removeItem(STORAGE_KEY);
  });

  test('oculta y vuelve a mostrar los tableros', () => {
    render(<BoardsSidebar />);

    expect(screen.getByText('Lista de tableros')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar tableros' }));

    expect(screen.getByRole('button', { name: 'Mostrar tableros' })).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('1');

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar tableros' }));
    expect(screen.getByRole('button', { name: 'Ocultar tableros' })).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('0');
  });
});
