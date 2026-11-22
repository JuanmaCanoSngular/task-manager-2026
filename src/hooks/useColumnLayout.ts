import { useCallback, useEffect, useState } from 'react';

export const COLUMN_DEFAULT_WIDTH = 280;
export const COLUMN_COLLAPSED_WIDTH = 48;
export const COLUMN_MIN_WIDTH = 200;
export const COLUMN_MAX_WIDTH = 560;

type BoardColumnLayout = {
  widths: Record<string, number>;
  collapsed: number[];
};

const storageKey = (boardId: number) => `taskblero-column-layout:${boardId}`;

const readLayout = (boardId: number): BoardColumnLayout => {
  try {
    const raw = localStorage.getItem(storageKey(boardId));
    if (!raw) return { widths: {}, collapsed: [] };
    const parsed = JSON.parse(raw) as Partial<BoardColumnLayout>;
    return {
      widths: parsed.widths && typeof parsed.widths === 'object' ? parsed.widths : {},
      collapsed: Array.isArray(parsed.collapsed)
        ? parsed.collapsed.filter((id): id is number => typeof id === 'number')
        : [],
    };
  } catch {
    return { widths: {}, collapsed: [] };
  }
};

export const clampColumnWidth = (width: number) =>
  Math.min(COLUMN_MAX_WIDTH, Math.max(COLUMN_MIN_WIDTH, Math.round(width)));

/** Anchos y columnas colapsadas por tablero (localStorage). */
export const useColumnLayout = (boardId: number | null) => {
  const resolvedId = typeof boardId === 'number' && Number.isFinite(boardId) ? boardId : null;
  const [layout, setLayout] = useState<BoardColumnLayout>(() =>
    resolvedId != null ? readLayout(resolvedId) : { widths: {}, collapsed: [] }
  );

  useEffect(() => {
    if (resolvedId == null) {
      setLayout({ widths: {}, collapsed: [] });
      return;
    }
    setLayout(readLayout(resolvedId));
  }, [resolvedId]);

  useEffect(() => {
    if (resolvedId == null) return;
    try {
      localStorage.setItem(storageKey(resolvedId), JSON.stringify(layout));
    } catch {
      /* ignore */
    }
  }, [resolvedId, layout]);

  const getWidth = useCallback(
    (columnId: number): number | undefined => {
      const stored = layout.widths[String(columnId)];
      return typeof stored === 'number' ? stored : undefined;
    },
    [layout.widths]
  );

  const setWidth = useCallback((columnId: number, width: number) => {
    const next = clampColumnWidth(width);
    setLayout((prev) => ({
      ...prev,
      widths: { ...prev.widths, [String(columnId)]: next },
    }));
  }, []);

  const isCollapsed = useCallback(
    (columnId: number) => layout.collapsed.includes(columnId),
    [layout.collapsed]
  );

  const toggleCollapsed = useCallback((columnId: number) => {
    setLayout((prev) => {
      const on = prev.collapsed.includes(columnId);
      return {
        ...prev,
        collapsed: on
          ? prev.collapsed.filter((id) => id !== columnId)
          : [...prev.collapsed, columnId],
      };
    });
  }, []);

  const shellWidth = useCallback(
    (columnId: number): number | undefined => {
      if (isCollapsed(columnId)) return COLUMN_COLLAPSED_WIDTH;
      return getWidth(columnId);
    },
    [getWidth, isCollapsed]
  );

  return {
    getWidth,
    setWidth,
    isCollapsed,
    toggleCollapsed,
    shellWidth,
  };
};
