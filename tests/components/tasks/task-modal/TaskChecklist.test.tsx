import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { TaskChecklistDraft } from '../../../../src/components/tasks/task-modal/TaskChecklist';

describe('TaskChecklistDraft', () => {
  test('añade y quita ítems', () => {
    const onChange = vi.fn();
    const { rerender } = render(<TaskChecklistDraft items={[]} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Nuevo ítem del checklist'), {
      target: { value: 'Leche' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }));
    expect(onChange).toHaveBeenCalledWith(['Leche']);

    rerender(<TaskChecklistDraft items={['Leche']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Quitar Leche' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
