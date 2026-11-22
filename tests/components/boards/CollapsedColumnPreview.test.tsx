import '@testing-library/jest-dom';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CollapsedColumnPreview } from '../../../src/components/boards/CollapsedColumnPreview';

describe('CollapsedColumnPreview', () => {
  test('muestra hasta 3 tareas y el resto como +N', () => {
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);
    vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({
      x: 10,
      y: 20,
      top: 20,
      bottom: 100,
      left: 10,
      right: 60,
      width: 50,
      height: 80,
      toJSON: () => ({}),
    });

    render(
      <CollapsedColumnPreview
        open
        anchorEl={anchor}
        columnName="Bloqueos"
        columnColor="#ef4444"
        tasks={[
          { id: 1, title: 'Uno', columnId: 1, tags: [] },
          { id: 2, title: 'Dos', columnId: 1, tags: [] },
          { id: 3, title: 'Tres', columnId: 1, tags: [] },
          { id: 4, title: 'Cuatro', columnId: 1, tags: [] },
        ]}
      />
    );

    expect(screen.getByRole('tooltip')).toHaveTextContent('Bloqueos');
    expect(screen.getByText('Uno')).toBeInTheDocument();
    expect(screen.getByText('Dos')).toBeInTheDocument();
    expect(screen.getByText('Tres')).toBeInTheDocument();
    expect(screen.getByText('+1 más')).toBeInTheDocument();
    expect(screen.queryByText('Cuatro')).not.toBeInTheDocument();
  });
});
