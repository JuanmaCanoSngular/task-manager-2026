import '@testing-library/jest-dom';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  CommentDropZones,
  DraggableCommentShell,
  COMMENT_DND_MIME,
} from '../../../src/components/tasks/CommentDragDrop';

describe('CommentDragDrop', () => {
  test('muestra zonas al arrastrar y dispara archive/delete', () => {
    const onArchive = vi.fn();
    const onDelete = vi.fn();
    const onDragActiveChange = vi.fn();

    render(
      <div>
        <DraggableCommentShell commentId="c-1" onDragActiveChange={onDragActiveChange}>
          <span>Mensaje</span>
        </DraggableCommentShell>
        <CommentDropZones visible onArchive={onArchive} onDelete={onDelete} />
      </div>
    );

    const shell = screen.getByText('Mensaje').parentElement!;
    fireEvent.dragStart(shell, {
      dataTransfer: {
        setData: vi.fn(),
        effectAllowed: 'move',
        types: [COMMENT_DND_MIME],
      },
    });
    expect(onDragActiveChange).toHaveBeenCalledWith(true);

    const archiveZone = screen.getByText('Archivar').closest('div')!;
    fireEvent.drop(archiveZone, {
      dataTransfer: {
        getData: (type: string) => (type === COMMENT_DND_MIME ? 'c-1' : ''),
        types: [COMMENT_DND_MIME],
      },
    });
    expect(onArchive).toHaveBeenCalledWith('c-1');

    const deleteZone = screen.getByText('Eliminar').closest('div')!;
    fireEvent.drop(deleteZone, {
      dataTransfer: {
        getData: (type: string) => (type === COMMENT_DND_MIME ? 'c-2' : ''),
        types: [COMMENT_DND_MIME],
      },
    });
    expect(onDelete).toHaveBeenCalledWith('c-2');
  });

  test('oculta zonas cuando visible=false', () => {
    render(
      <CommentDropZones visible={false} onArchive={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.queryByText('Archivar')).not.toBeInTheDocument();
  });
});
