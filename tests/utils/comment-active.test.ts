import { describe, test, expect } from 'vitest';
import {
  activeComments,
  archivedComments,
  isCommentArchived,
  type TaskComment,
} from '../../src/interfaces/comment.interface';

const base = {
  taskId: 1,
  body: 'Hola',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('comment active helpers', () => {
  test('separa activos y archivados', () => {
    const list: TaskComment[] = [
      { id: 'a', ...base, archivedAt: null },
      { id: 'b', ...base, archivedAt: '2026-01-02T00:00:00.000Z' },
      { id: 'c', ...base },
    ];
    expect(activeComments(list).map((c) => c.id)).toEqual(['a', 'c']);
    expect(archivedComments(list).map((c) => c.id)).toEqual(['b']);
    expect(isCommentArchived(list[1])).toBe(true);
  });
});
