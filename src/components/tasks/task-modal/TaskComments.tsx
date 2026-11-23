import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { PencilIcon } from '@heroicons/react/20/solid';
import { commentService } from '../../../services/comment.service';
import type { TaskComment } from '../../../interfaces/comment.interface';
import {
  MAX_COMMENT_LENGTH,
  activeComments,
  binComments,
  isCommentTrashed,
} from '../../../interfaces/comment.interface';
import { formatRelativeCreatedAt } from '../../../utils/relativeTime';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { useBoardStore } from '../../../stores/board.store';
import { BinCommentActions, SwipeableComment } from '../CommentSwipe';

interface TaskCommentsProps {
  taskId: number;
}

export type TaskCommentsHandle = {
  hasPendingDraft: () => boolean;
  flushPendingDraft: () => Promise<boolean>;
  publishSummary: () => void;
};

const previewFromActive = (list: TaskComment[]): string | undefined => {
  const latest = activeComments(list).at(-1)?.body.trim();
  if (!latest) return undefined;
  return latest.length > 80 ? `${latest.slice(0, 77)}…` : latest;
};

export const TaskComments = forwardRef<TaskCommentsHandle, TaskCommentsProps>(
  ({ taskId }, ref) => {
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newBody, setNewBody] = useState('');
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editBody, setEditBody] = useState('');
    const [purgeId, setPurgeId] = useState<string | null>(null);
    const [showBin, setShowBin] = useState(false);
    const commentsRef = useRef<TaskComment[]>([]);

    const syncSummary = useCallback(
      (list: TaskComment[]) => {
        commentsRef.current = list;
        const active = activeComments(list);
        useBoardStore
          .getState()
          .setTaskCommentSummary(taskId, active.length, previewFromActive(list));
      },
      [taskId]
    );

    const loadComments = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const loaded = await commentService.listByTask(taskId);
        setComments(loaded);
        syncSummary(loaded);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'No se pudieron cargar los comentarios');
      } finally {
        setLoading(false);
      }
    }, [taskId, syncSummary]);

    useEffect(() => {
      void loadComments();
    }, [loadComments]);

    useEffect(() => {
      return () => {
        const list = commentsRef.current;
        const active = activeComments(list);
        useBoardStore
          .getState()
          .setTaskCommentSummary(taskId, active.length, previewFromActive(list));
      };
    }, [taskId]);

    const handleAdd = useCallback(async (): Promise<boolean> => {
      const trimmed = newBody.trim();
      if (!trimmed) return true;
      if (saving) return false;

      setSaving(true);
      setError(null);
      try {
        const created = await commentService.create(taskId, trimmed);
        let next: TaskComment[] = [];
        setComments((prev) => {
          next = [...prev, created];
          return next;
        });
        syncSummary(next);
        setNewBody('');
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'No se pudo añadir el comentario');
        return false;
      } finally {
        setSaving(false);
      }
    }, [newBody, saving, taskId, syncSummary]);

    const cancelEdit = useCallback(() => {
      setEditingId(null);
      setEditBody('');
    }, []);

    const saveEdit = useCallback(
      async (commentId: string): Promise<boolean> => {
        const trimmed = editBody.trim();
        if (!trimmed) return true;
        if (saving) return false;

        setSaving(true);
        setError(null);
        try {
          const updated = await commentService.update(commentId, trimmed);
          let next: TaskComment[] = [];
          setComments((prev) => {
            next = prev.map((c) => (c.id === commentId ? updated : c));
            return next;
          });
          syncSummary(next);
          cancelEdit();
          return true;
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'No se pudo guardar el comentario');
          return false;
        } finally {
          setSaving(false);
        }
      },
      [editBody, saving, syncSummary, cancelEdit]
    );

    useImperativeHandle(
      ref,
      () => ({
        hasPendingDraft: () =>
          newBody.trim().length > 0 || (editingId != null && editBody.trim().length > 0),
        flushPendingDraft: async () => {
          if (editingId) {
            const edited = await saveEdit(editingId);
            if (!edited) return false;
          }
          return handleAdd();
        },
        publishSummary: () => {
          syncSummary(commentsRef.current);
        },
      }),
      [newBody, editBody, editingId, handleAdd, saveEdit, syncSummary]
    );

    const startEdit = (comment: TaskComment) => {
      setEditingId(comment.id);
      setEditBody(comment.body);
      setError(null);
    };

    const replaceComment = (updated: TaskComment) => {
      let next: TaskComment[] = [];
      setComments((prev) => {
        next = prev.map((c) => (c.id === updated.id ? updated : c));
        return next;
      });
      syncSummary(next);
      setShowBin(true);
    };

    const handleArchive = async (id: string) => {
      if (saving) return;
      setSaving(true);
      setError(null);
      try {
        const updated = await commentService.archive(id);
        replaceComment(updated);
        if (editingId === id) cancelEdit();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'No se pudo archivar el comentario');
      } finally {
        setSaving(false);
      }
    };

    const handleSoftDelete = async (id: string) => {
      if (saving) return;
      setSaving(true);
      setError(null);
      try {
        const updated = await commentService.softDelete(id);
        replaceComment(updated);
        if (editingId === id) cancelEdit();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'No se pudo mover a la papelera');
      } finally {
        setSaving(false);
      }
    };

    const handleRestore = async (id: string) => {
      if (saving) return;
      setSaving(true);
      setError(null);
      try {
        const updated = await commentService.restore(id);
        let next: TaskComment[] = [];
        setComments((prev) => {
          next = prev.map((c) => (c.id === id ? updated : c));
          return next;
        });
        syncSummary(next);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'No se pudo restaurar el comentario');
      } finally {
        setSaving(false);
      }
    };

    const confirmPurge = async () => {
      if (!purgeId || saving) return;
      setSaving(true);
      setError(null);
      try {
        await commentService.delete(purgeId);
        let next: TaskComment[] = [];
        setComments((prev) => {
          next = prev.filter((c) => c.id !== purgeId);
          return next;
        });
        syncSummary(next);
        setPurgeId(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'No se pudo eliminar el comentario');
      } finally {
        setSaving(false);
      }
    };

    const active = activeComments(comments);
    const bin = binComments(comments);

    return (
      <div className="space-y-3 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Comentarios</h4>
          {active.length > 0 ? (
            <p className="text-[11px] text-[var(--text-muted)]">
              Desliza: ← archivar · eliminar →
            </p>
          ) : null}
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-[var(--text-muted)]">Cargando comentarios…</p>
        ) : active.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            Sin comentarios. Añade contexto si la tarea está bloqueada o necesita seguimiento.
          </p>
        ) : (
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-1" aria-label="Comentarios de la tarea">
            {active.map((comment) => {
              const isEditing = editingId === comment.id;
              const edited = comment.updatedAt !== comment.createdAt;

              return (
                <li key={comment.id}>
                  {isEditing ? (
                    <div
                      className="rounded-xl p-3 text-sm space-y-2"
                      style={{ backgroundColor: 'var(--surface-2)' }}
                    >
                      <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        maxLength={MAX_COMMENT_LENGTH}
                        rows={3}
                        className="input-base resize-y min-h-[4.5rem]"
                        aria-label="Editar comentario"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="btn-secondary text-xs px-3 py-1.5"
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="btn-primary text-xs px-3 py-1.5"
                          onClick={() => void saveEdit(comment.id)}
                          disabled={saving || !editBody.trim()}
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <SwipeableComment
                      disabled={saving}
                      onArchive={() => void handleArchive(comment.id)}
                      onDelete={() => void handleSoftDelete(comment.id)}
                    >
                      <div className="p-3 text-sm">
                        <p className="whitespace-pre-wrap break-words text-left">{comment.body}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <time
                            className="text-[11px] text-[var(--text-muted)]"
                            dateTime={comment.updatedAt}
                            title={new Date(comment.updatedAt).toLocaleString('es')}
                          >
                            {edited ? 'Editado ' : ''}
                            {formatRelativeCreatedAt(comment.updatedAt)}
                          </time>
                          <button
                            type="button"
                            onClick={() => startEdit(comment)}
                            className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                            aria-label="Editar comentario"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </SwipeableComment>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {bin.length > 0 ? (
          <div className="space-y-2">
            <button
              type="button"
              className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)] hover:text-[var(--text)]"
              onClick={() => setShowBin((v) => !v)}
              aria-expanded={showBin}
            >
              Papelera ({bin.length})
            </button>
            {showBin ? (
              <ul className="space-y-2 max-h-36 overflow-y-auto pr-1" aria-label="Papelera de comentarios">
                {bin.map((comment) => (
                  <li
                    key={comment.id}
                    className="rounded-xl p-3 text-sm opacity-75"
                    style={{ backgroundColor: 'var(--surface-2)' }}
                  >
                    <p className="whitespace-pre-wrap break-words text-left">{comment.body}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {isCommentTrashed(comment) ? 'Eliminado' : 'Archivado'}
                      </span>
                      <BinCommentActions
                        disabled={saving}
                        onRestore={() => void handleRestore(comment.id)}
                        onPurge={() => setPurgeId(comment.id)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="new-comment" className="sr-only">
            Añadir comentario
          </label>
          <textarea
            id="new-comment"
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            maxLength={MAX_COMMENT_LENGTH}
            rows={3}
            placeholder="Escribe un comentario…"
            className="input-base resize-y min-h-[4.5rem]"
            disabled={saving}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void handleAdd();
              }
            }}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] leading-snug text-[var(--text-muted)]">
              Se guarda con «Añadir comentario» o al pulsar «Guardar cambios».
            </p>
            <button
              type="button"
              className="btn-secondary text-sm self-end sm:self-auto"
              disabled={saving || !newBody.trim()}
              onClick={() => void handleAdd()}
            >
              {saving ? 'Guardando…' : 'Añadir comentario'}
            </button>
          </div>
        </div>

        <ConfirmDialog
          isOpen={purgeId !== null}
          onClose={() => !saving && setPurgeId(null)}
          onConfirm={() => void confirmPurge()}
          title="¿Eliminar definitivamente?"
          description="Esta acción no se puede deshacer."
          confirmText={saving ? 'Eliminando…' : 'Eliminar'}
          cancelText="Cancelar"
        />
      </div>
    );
  }
);

TaskComments.displayName = 'TaskComments';
