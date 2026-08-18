import '@testing-library/jest-dom';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { resolveShoppingSwipe } from '../../../../src/components/boards/shopping/shopping-swipe';
import { ShoppingItemRow } from '../../../../src/components/boards/shopping/ShoppingItemRow';

describe('resolveShoppingSwipe', () => {
  test('derecha es comprado y izquierda es descartado', () => {
    expect(resolveShoppingSwipe(80)).toBe('bought');
    expect(resolveShoppingSwipe(-80)).toBe('discarded');
    expect(resolveShoppingSwipe(20)).toBeNull();
    expect(resolveShoppingSwipe(0)).toBeNull();
  });
});

describe('ShoppingItemRow', () => {
  test('los botones marcan comprado y descartado', () => {
    const onBought = vi.fn();
    const onDiscarded = vi.fn();
    render(
      <ShoppingItemRow title="Leche" mode="buy" onBought={onBought} onDiscarded={onDiscarded} />
    );

    fireEvent.click(screen.getByRole('checkbox', { name: /marcar leche como comprado/i }));
    expect(onBought).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /descartar leche/i }));
    expect(onDiscarded).toHaveBeenCalledTimes(1);
  });

  test('en comprado se puede devolver a la lista', () => {
    const onRestore = vi.fn();
    render(<ShoppingItemRow title="Huevos" mode="bought" onRestore={onRestore} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /devolver huevos a la lista/i }));
    expect(onRestore).toHaveBeenCalledTimes(1);
  });
});
