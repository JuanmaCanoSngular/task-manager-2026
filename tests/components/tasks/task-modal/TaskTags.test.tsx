import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskTags } from '../../../../src/components/tasks/task-modal/TaskTags';
import { MAX_TAGS_PER_TASK } from '../../../../src/interfaces/tag.interface';

const mockTags = [
  { id: 'id-urgente', name: 'Urgente', color: '#ef4444' },
  { id: 'id-importante', name: 'Importante', color: '#f59e0b' },
  { id: 'id-idea', name: 'Idea', color: '#06b6d4' },
];

vi.mock('../../../../src/stores/tag.store', () => ({
  useTagStore: (selector: (s: { tags: typeof mockTags }) => unknown) =>
    selector({ tags: mockTags }),
}));

describe('TaskTags', () => {
  const defaultProps = {
    selectedTags: [] as string[],
    showWarning: false,
    onToggleTag: vi.fn(),
  };

  beforeEach(() => {
    defaultProps.onToggleTag = vi.fn();
  });

  test('renderiza las etiquetas del store', () => {
    render(<TaskTags {...defaultProps} />);

    expect(screen.getByText('Etiquetas')).toBeInTheDocument();
    expect(screen.getByText(`Máx. ${MAX_TAGS_PER_TASK}`)).toBeInTheDocument();
    expect(screen.getByText('Urgente')).toBeInTheDocument();
    expect(screen.getByText('Importante')).toBeInTheDocument();
    expect(screen.getByText('Idea')).toBeInTheDocument();
  });

  test('marca seleccionadas y llama onToggleTag', () => {
    render(
      <TaskTags {...defaultProps} selectedTags={['id-urgente']} onToggleTag={defaultProps.onToggleTag} />
    );

    expect(screen.getByText(`1/${MAX_TAGS_PER_TASK}`)).toBeInTheDocument();

    const selected = screen.getByLabelText('Deseleccionar etiqueta Urgente');
    expect(selected).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByLabelText('Seleccionar etiqueta Idea'));
    expect(defaultProps.onToggleTag).toHaveBeenCalledWith('id-idea');
  });

  test('muestra aviso de máximo', () => {
    render(<TaskTags {...defaultProps} showWarning />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      `Puedes seleccionar un máximo de ${MAX_TAGS_PER_TASK} etiquetas por tarea`
    );
  });
});
