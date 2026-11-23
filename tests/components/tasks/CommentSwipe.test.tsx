import '@testing-library/jest-dom';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  SwipeableComment,
  resolveSwipeAction,
  COMMENT_SWIPE_COMMIT,
} from '../../../src/components/tasks/CommentSwipe';

describe('resolveSwipeAction', () => {
  test('derecha elimina, izquierda archiva, corto no hace nada', () => {
    expect(resolveSwipeAction(COMMENT_SWIPE_COMMIT)).toBe('delete');
    expect(resolveSwipeAction(COMMENT_SWIPE_COMMIT + 20)).toBe('delete');
    expect(resolveSwipeAction(-COMMENT_SWIPE_COMMIT)).toBe('archive');
    expect(resolveSwipeAction(-COMMENT_SWIPE_COMMIT - 10)).toBe('archive');
    expect(resolveSwipeAction(10)).toBeNull();
    expect(resolveSwipeAction(-10)).toBeNull();
    expect(resolveSwipeAction(0)).toBeNull();
  });
});

describe('SwipeableComment', () => {
  test('expone pista de deslizar accesible', () => {
    render(
      <SwipeableComment onDelete={() => undefined} onArchive={() => undefined}>
        <span>Mensaje</span>
      </SwipeableComment>
    );
    expect(
      screen.getByRole('group', { name: /desliza a la derecha para eliminar/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Mensaje')).toBeInTheDocument();
  });
});
