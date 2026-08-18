import { FormEvent, useCallback, useEffect, useState } from 'react';
import { TrashIcon } from '@heroicons/react/20/solid';
import { checklistService } from '../../../services/checklist.service';
import type { ChecklistItem } from '../../../interfaces/checklist.interface';
import { MAX_CHECKLIST_ITEM_LENGTH, MAX_CHECKLIST_ITEMS } from '../../../interfaces/checklist.interface';
import { useBoardStore } from '../../../stores/board.store';

interface TaskChecklistDraftProps {
  items: string[];
  onChange: (items: string[]) => void;
}

export const TaskChecklistDraft = ({ items, onChange }: TaskChecklistDraftProps) => {
  const [draft, setDraft] = useState('');

  const add = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = draft.trim().slice(0, MAX_CHECKLIST_ITEM_LENGTH);
    if (!trimmed || items.length >= MAX_CHECKLIST_ITEMS) return;
    onChange([...items, trimmed]);
    setDraft('');
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Checklist</h4>
      {items.length > 0 ? (
        <ul className="space-y-1.5" aria-label="Ítems del checklist">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="flex items-center gap-2 min-w-0">
              <span
                className="flex h-4 w-4 shrink-0 rounded border"
                style={{ borderColor: 'var(--border)' }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 text-sm truncate">{item}</span>
              <button
                type="button"
                className="p-1 rounded-md text-red-500 hover:text-red-600"
                aria-label={`Quitar ${item}`}
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">Añade artículos o subtareas.</p>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          maxLength={MAX_CHECKLIST_ITEM_LENGTH}
          placeholder="Leche, pan…"
          className="input-base py-2"
          aria-label="Nuevo ítem del checklist"
          disabled={items.length >= MAX_CHECKLIST_ITEMS}
        />
        <button
          type="button"
          className="btn-secondary shrink-0"
          onClick={() => add()}
          disabled={!draft.trim() || items.length >= MAX_CHECKLIST_ITEMS}
        >
          Añadir
        </button>
      </div>
    </div>
  );
};

interface TaskChecklistProps {
  taskId: number;
}

export const TaskChecklist = ({ taskId }: TaskChecklistProps) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const syncSummary = useCallback(
    (list: ChecklistItem[]) => {
      queueMicrotask(() => {
        useBoardStore
          .getState()
          .setTaskChecklistSummary(taskId, list.filter((i) => i.done).length, list.length);
      });
    },
    [taskId]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await checklistService.listByTask(taskId);
      setItems(loaded);
      syncSummary(loaded);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el checklist');
    } finally {
      setLoading(false);
    }
  }, [taskId, syncSummary]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async (item: ChecklistItem) => {
    const nextDone = !item.done;
    setItems((prev) => {
      const next = prev.map((i) => (i.id === item.id ? { ...i, done: nextDone } : i));
      syncSummary(next);
      return next;
    });
    try {
      await checklistService.setDone(item.id, nextDone);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar');
      void load();
    }
  };

  const add = async () => {
    const trimmed = draft.trim().slice(0, MAX_CHECKLIST_ITEM_LENGTH);
    if (!trimmed || saving || items.length >= MAX_CHECKLIST_ITEMS) return;
    setSaving(true);
    setError(null);
    try {
      const created = await checklistService.add(taskId, trimmed, items.length);
      setItems((prev) => {
        const next = [...prev, created];
        syncSummary(next);
        return next;
      });
      setDraft('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo añadir');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await checklistService.delete(id);
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== id);
        syncSummary(next);
        return next;
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar');
    }
  };

  const done = items.filter((i) => i.done).length;

  return (
    <div className="space-y-2 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Checklist
        {items.length > 0 ? (
          <span className="ml-2 text-[11px] font-normal text-[var(--text-muted)] tabular-nums">
            {done}/{items.length}
          </span>
        ) : null}
      </h4>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Cargando checklist…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">Sin ítems. Añade artículos o subtareas.</p>
      ) : (
        <ul className="space-y-1.5 max-h-56 overflow-y-auto pr-1" aria-label="Checklist de la tarea">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 min-w-0">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => void toggle(item)}
                className="h-4 w-4 shrink-0 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                aria-label={item.title}
              />
              <span
                className={`min-w-0 flex-1 text-sm ${
                  item.done ? 'line-through text-[var(--text-muted)]' : ''
                }`}
              >
                {item.title}
              </span>
              <button
                type="button"
                onClick={() => void remove(item.id)}
                className="p-1 rounded-md text-red-500 hover:text-red-600"
                aria-label={`Eliminar ${item.title}`}
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void add();
            }
          }}
          maxLength={MAX_CHECKLIST_ITEM_LENGTH}
          placeholder="Nuevo ítem…"
          className="input-base py-2"
          aria-label="Nuevo ítem del checklist"
          disabled={saving || items.length >= MAX_CHECKLIST_ITEMS}
        />
        <button
          type="button"
          className="btn-secondary shrink-0"
          onClick={() => void add()}
          disabled={saving || !draft.trim() || items.length >= MAX_CHECKLIST_ITEMS}
        >
          Añadir
        </button>
      </div>
    </div>
  );
};
