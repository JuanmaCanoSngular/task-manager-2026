import { useCallback, useEffect, useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/20/solid';
import { commentService } from '../../../services/comment.service';
import type { TaskComment } from '../../../interfaces/comment.interface';
import { MAX_COMMENT_LENGTH } from '../../../interfaces/comment.interface';
import { formatRelativeCreatedAt } from '../../../utils/relativeTime';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { useBoardStore } from '../../../stores/board.store';

interface TaskCommentsProps {
  taskId: number;
}

const previewFromComments = (list: TaskComment[]): string | undefined => {
  const latest = list.at(-1)?.body.trim();
  if (!latest) return undefined;
  return latest.length > 80 ? `${latest.slice(0, 77)}…` : latest;
};

export const TaskComments = ({ taskId }: TaskCommentsProps) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBody, setNewBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const syncSummary = useCallback((list: TaskComment[]) => {
    queueMicrotask(() => {
      useBoardStore
        .getState()
        .setTaskCommentSummary(taskId, list.length, previewFromComments(list));
    });
  }, [taskId]);

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

  const handleAdd = async () => {
    const trimmed = newBody.trim();
    if (!trimmed || saving) return;

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo añadir el comentario');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (comment: TaskComment) => {
    setEditingId(comment.id);
    setEditBody(comment.body);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditBody('');
  };

  const saveEdit = async (commentId: string) => {
    const trimmed = editBody.trim();
    if (!trimmed || saving) return;

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el comentario');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId || saving) return;

    setSaving(true);
    setError(null);
    try {
      await commentService.delete(deleteId);
      let next: TaskComment[] = [];
      setComments((prev) => {
        next = prev.filter((c) => c.id !== deleteId);
        return next;
      });
      syncSummary(next);
      if (editingId === deleteId) cancelEdit();
      setDeleteId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el comentario');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Comentarios</h4>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Cargando comentarios…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">
          Sin comentarios. Añade contexto si la tarea está bloqueada o necesita seguimiento.
        </p>
      ) : (
        <ul className="space-y-2 max-h-48 overflow-y-auto pr-1" aria-label="Comentarios de la tarea">
          {comments.map((comment) => {
            const isEditing = editingId === comment.id;
            const edited = comment.updatedAt !== comment.createdAt;

            return (
              <li
                key={comment.id}
                className="rounded-xl p-3 text-sm"
                style={{ backgroundColor: 'var(--surface-2)' }}
              >
                {isEditing ? (
                  <div className="space-y-2">
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
                  <>
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
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(comment)}
                          className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                          aria-label="Editar comentario"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(comment.id)}
                          className="p-1 rounded-md text-red-500 hover:text-red-600 dark:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                          aria-label="Eliminar comentario"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

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
        <div className="flex justify-end">
          <button
            type="button"
            className="btn-secondary text-sm"
            disabled={saving || !newBody.trim()}
            onClick={() => void handleAdd()}
          >
            {saving ? 'Guardando…' : 'Añadir comentario'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => !saving && setDeleteId(null)}
        onConfirm={() => void confirmDelete()}
        title="¿Eliminar comentario?"
        description="Esta acción no se puede deshacer."
        confirmText={saving ? 'Eliminando…' : 'Eliminar'}
        cancelText="Cancelar"
      />
    </div>
  );
};
