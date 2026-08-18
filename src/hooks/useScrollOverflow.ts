import { RefObject, useCallback, useEffect, useState } from 'react';

const EDGE = 8;

export const useScrollOverflow = (ref: RefObject<HTMLElement | null>, watch = 0) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const max = el.scrollWidth - el.clientWidth;
    const hasOverflow = max > EDGE;
    setCanScrollLeft(hasOverflow && el.scrollLeft > EDGE);
    setCanScrollRight(hasOverflow && el.scrollLeft < max - EDGE);
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(update);
      observer.observe(el);
    }

    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer?.disconnect();
    };
  }, [update, watch]);

  const scrollByPage = (direction: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    const page = Math.max(el.clientWidth * 0.9, 1);
    el.scrollBy({ left: direction * page, behavior: 'smooth' });
  };

  return { canScrollLeft, canScrollRight, scrollByPage };
};
