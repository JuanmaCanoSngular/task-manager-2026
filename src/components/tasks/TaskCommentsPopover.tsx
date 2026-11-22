import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { commentService } from '../../services/comment.service';
import type { TaskComment } from '../../interfaces/comment.interface';
import { MAX_COMMENT_LENGTH } from '../../interfaces/comment.interface';
import { formatRelativeCreatedAt } from '../../utils/relativeTime';
import { useBoardStore } from '../../stores/board.store';

interface TaskCommentsPopoverProps {
  taskId: number;
  taskTitle: string;
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

const POP_W = 320;
const POP_MAX_H = 420;
const GAP = 8;

const previewFromComments = (list: TaskComment[]): string | undefined => {
  const latest = list.at(-1)?.body.trim();
  if (!latest) return undefined;
  return latest.length > 80 ? `${latest.slice(0, 77)}…` : latest;
};

export const TaskCommentsPopover = ({
  taskId,
  taskTitle,
  anchorEl,
  open,
  onClose,
}: TaskCommentsPopoverProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; below: boolean } | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const syncSummary = (list: TaskComment[]) => {
    useBoardStore
      .getState()
      .setTaskCommentSummary(taskId, list.length, previewFromComments(list));
  };

  useLayoutEffect(() => {
    if (!open || !anchorEl) {
      setPos(null);
      return;
    }
    const place = () => {
      const r = anchorEl.getBoundingClientRect();
      const left = Math.min(
        Math.max(8, r.left),
        Math.max(8, window.innerWidth - POP_W - 8)
      );
      const spaceBelow = window.innerHeight - r.bottom;
      const below = spaceBelow >= 240 || spaceBelow > r.top;
      setPos({
        top: below ? r.bottom + GAP : Math.max(8, r.top - GAP),
        left,
        below,
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, anchorEl]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void commentService
      .listByTask(taskId)
      .then((loaded) => {
        if (cancelled) return;
        setComments(loaded);
        syncSummary(loaded);
        requestAnimationFrame(() => {
          const el = listRef.current;
          if (el) el.scrollTop = el.scrollHeight;
        });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'No se pudieron cargar los comentarios');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, taskId]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (anchorEl?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, anchorEl]);

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    setError(null);
    try {
      const created = await commentService.create(taskId, trimmed);
      const next = [...comments, created];
      setComments(next);
      syncSummary(next);
      setDraft('');
      requestAnimationFrame(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar');
    } finally {
      setSaving(false);
    }
  };

  if (!open || !pos) return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label={`Comentarios de ${taskTitle}`}
      className="fixed z-[90] flex flex-col overflow-hidden rounded-2xl border shadow-xl"
      style={{
        top: pos.top,
        left: pos.left,
        width: POP_W,
        maxHeight: POP_MAX_H,
        transform: pos.below ? undefined : 'translateY(-100%)',
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-card)',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="flex items-center justify-between gap-2 border-b px-3 py-2.5"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Comentarios
          </p>
          <p className="truncate text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {taskTitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Cerrar comentarios"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      <div
        className="flex-1 min-h-0 overflow-y-auto px-3 py-3"
        style={{ backgroundColor: 'var(--surface-2)' }}
      >
        {loading ? (
          <p className="text-center text-xs text-[var(--text-muted)] py-6">Cargando…</p>
        ) : error && comments.length === 0 ? (
          <p className="text-center text-xs text-red-600 dark:text-red-400 py-6" role="alert">
            {error}
          </p>
        ) : comments.length === 0 ? (
          <p className="text-center text-xs text-[var(--text-muted)] py-6">
            Aún no hay comentarios
          </p>
        ) : (
          <ul ref={listRef} className="flex flex-col gap-2 max-h-56 overflow-y-auto">
            {comments.map((comment) => (
              <li key={comment.id} className="flex flex-col items-start gap-0.5">
                <div
                  className="max-w-[92%] rounded-2xl rounded-bl-md px-3 py-2 text-left text-[13px] leading-snug whitespace-pre-wrap break-words"
                  style={{
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {comment.body}
                </div>
                <time
                  className="pl-1 text-[10px] text-[var(--text-muted)]"
                  dateTime={comment.createdAt}
                  title={new Date(comment.createdAt).toLocaleString('es')}
                >
                  {formatRelativeCreatedAt(comment.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form
        className="border-t p-2.5 space-y-1.5"
        style={{ borderColor: 'var(--border)' }}
        onSubmit={(e) => void handleSend(e)}
      >
        {error && comments.length > 0 ? (
          <p className="text-[11px] text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <label htmlFor={`quick-comment-${taskId}`} className="sr-only">
          Nuevo comentario
        </label>
        <textarea
          id={`quick-comment-${taskId}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={MAX_COMMENT_LENGTH}
          rows={2}
          placeholder="Escribe un comentario…"
          className="input-base resize-none text-sm min-h-[2.75rem]"
          disabled={saving}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary text-xs px-3 py-1.5"
            disabled={saving || !draft.trim()}
          >
            {saving ? 'Enviando…' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};
