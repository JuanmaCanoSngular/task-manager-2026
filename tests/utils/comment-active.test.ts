import { describe, test, expect } from 'vitest';
import {
  activeComments,
  binComments,
  isCommentArchived,
  isCommentInBin,
  isCommentTrashed,
  type TaskComment,
} from '../../src/interfaces/comment.interface';

const base = {
  taskId: 1,
  body: 'Hola',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('comment active / bin helpers', () => {
  test('separa activos y papelera', () => {
    const list: TaskComment[] = [
      { id: 'a', ...base, archivedAt: null, deletedAt: null },
      { id: 'b', ...base, archivedAt: '2026-01-02T00:00:00.000Z', deletedAt: null },
      { id: 'c', ...base, archivedAt: null, deletedAt: '2026-01-03T00:00:00.000Z' },
      { id: 'd', ...base },
    ];
    expect(activeComments(list).map((c) => c.id)).toEqual(['a', 'd']);
    expect(binComments(list).map((c) => c.id)).toEqual(['b', 'c']);
    expect(isCommentArchived(list[1])).toBe(true);
    expect(isCommentTrashed(list[2])).toBe(true);
    expect(isCommentInBin(list[1])).toBe(true);
  });
});
