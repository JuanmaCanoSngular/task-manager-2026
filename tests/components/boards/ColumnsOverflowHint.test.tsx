import '@testing-library/jest-dom';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColumnsOverflowHint } from '../../../src/components/boards/ColumnsOverflowHint';

describe('ColumnsOverflowHint', () => {
  test('no renderiza nada si no hay overflow', () => {
    const { container } = render(
      <ColumnsOverflowHint
        canScrollLeft={false}
        canScrollRight={false}
        onScrollLeft={() => {}}
        onScrollRight={() => {}}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  test('indica que hay más columnas a la derecha', () => {
    const onScrollRight = vi.fn();
    render(
      <ColumnsOverflowHint
        canScrollLeft={false}
        canScrollRight={true}
        onScrollLeft={() => {}}
        onScrollRight={onScrollRight}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ver más columnas' }));
    expect(onScrollRight).toHaveBeenCalledTimes(1);
  });
});
