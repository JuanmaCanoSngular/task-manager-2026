import { FormEvent, useMemo, useState } from 'react';
import { PlusIcon, ShoppingCartIcon } from '@heroicons/react/20/solid';
import { Board } from '../../../interfaces/board.interface';
import {
  getInboxColumn,
  getShoppingBoughtColumn,
  getShoppingDiscardedColumn,
} from '../../../interfaces/column.interface';
import {
  useBoardStore,
  useCurrentBoardColumns,
  useCurrentBoardTasks,
} from '../../../stores/board.store';
import { ShoppingItemRow, ShoppingItemMode } from './ShoppingItemRow';

type ShoppingTab = ShoppingItemMode;

const TAB_LABEL: Record<ShoppingTab, string> = {
  buy: 'Por comprar',
  bought: 'Comprado',
  discarded: 'Descartado',
};

const parseArticles = (raw: string): string[] =>
  raw
    .split(/[,;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);

interface ShoppingBoardProps {
  board: Board;
}

export const ShoppingBoard = ({ board }: ShoppingBoardProps) => {
  const addNewTask = useBoardStore((state) => state.addNewTask);
  const moveTask = useBoardStore((state) => state.moveTask);
  const tasks = useCurrentBoardTasks();
  const columns = useCurrentBoardColumns();
  const [tab, setTab] = useState<ShoppingTab>('buy');
  const [draft, setDraft] = useState('');

  const buyColumn = getInboxColumn(columns.length ? columns : board.columns);
  const boughtColumn = getShoppingBoughtColumn(columns.length ? columns : board.columns);
  const discardedColumn = getShoppingDiscardedColumn(columns.length ? columns : board.columns);

  const tasksByTab = useMemo(() => {
    const buyId = buyColumn?.id;
    const boughtId = boughtColumn?.id;
    const discardedId = discardedColumn?.id;
    return {
      buy: tasks.filter((task) => task.columnId === buyId),
      bought: tasks.filter((task) => task.columnId === boughtId),
      discarded: tasks.filter((task) => task.columnId === discardedId),
    };
  }, [tasks, buyColumn?.id, boughtColumn?.id, discardedColumn?.id]);

  const visibleBuy = tasksByTab.buy;
  const visibleBoughtOnList = tab === 'buy' ? tasksByTab.bought : [];
  const visible =
    tab === 'buy' ? visibleBuy : tab === 'bought' ? tasksByTab.bought : tasksByTab.discarded;
  const listEmpty =
    tab === 'buy'
      ? visibleBuy.length === 0 && visibleBoughtOnList.length === 0
      : visible.length === 0;

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    if (!buyColumn) return;
    const titles = parseArticles(draft);
    if (titles.length === 0) return;
    setDraft('');
    setTab('buy');
    const ordered = titles.length > 1 ? [...titles].reverse() : titles;
    for (const title of ordered) {
      await addNewTask({ title, columnId: buyColumn.id, tags: [] });
    }
  };

  const markBought = (taskId: number) => {
    if (!boughtColumn) return;
    moveTask(taskId, boughtColumn.id, 0);
  };

  const markDiscarded = (taskId: number) => {
    if (!discardedColumn) return;
    moveTask(taskId, discardedColumn.id, 0);
  };

  const restore = (taskId: number) => {
    if (!buyColumn) return;
    moveTask(taskId, buyColumn.id, 0);
  };

  return (
    <div
      className="w-full h-full min-w-0 min-h-0 rounded-2xl p-4 md:p-5 flex flex-col gap-4 overflow-hidden"
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
      }}
      data-testid="shopping-board"
    >
      <div className="flex items-center gap-2.5 flex-shrink-0 min-w-0">
        <ShoppingCartIcon
          className="w-5 h-5 flex-shrink-0"
          style={{ color: board.color }}
          aria-hidden
        />
        <h2 className="flex h-7 min-w-0 max-w-full items-center" style={{ color: board.color }}>
          <span className="truncate text-lg md:text-xl font-semibold tracking-tight leading-none">
            {board.name}
          </span>
        </h2>
      </div>

      <div
        className="flex rounded-xl p-1 flex-shrink-0"
        style={{ backgroundColor: 'var(--surface-2)' }}
        role="tablist"
        aria-label="Estado de la lista"
      >
        {(['buy', 'bought', 'discarded'] as const).map((id) => {
          const selected = tab === id;
          const count = tasksByTab[id].length;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(id)}
              className={`flex-1 min-w-0 rounded-lg px-2 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                selected
                  ? 'bg-white text-teal-800 shadow-sm dark:bg-teal-950/60 dark:text-teal-100'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <span className="truncate">{TAB_LABEL[id]}</span>
              <span className="ml-1 tabular-nums opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain -mx-1 px-1">
        {listEmpty ? (
          <div className="flex flex-col items-center justify-center text-center h-full min-h-[8rem] px-4">
            <p className="text-sm font-medium text-[var(--text-muted)]">
              {tab === 'buy'
                ? 'La lista está vacía'
                : tab === 'bought'
                  ? 'Aún no has marcado nada como comprado'
                  : 'No hay artículos descartados'}
            </p>
            {tab === 'buy' ? (
              <p className="mt-1 text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">
                Marca el recuadro o desliza a la derecha si lo compraste; a la izquierda si lo
                descartas.
              </p>
            ) : null}
          </div>
        ) : (
          <ul className="flex flex-col gap-2 pb-2">
            {visible.map((task) => (
              <li key={task.id}>
                {tab === 'buy' ? (
                  <ShoppingItemRow
                    title={task.title}
                    mode="buy"
                    onBought={() => markBought(task.id)}
                    onDiscarded={() => markDiscarded(task.id)}
                  />
                ) : (
                  <ShoppingItemRow
                    title={task.title}
                    mode={tab}
                    onRestore={() => restore(task.id)}
                  />
                )}
              </li>
            ))}
            {tab === 'buy'
              ? visibleBoughtOnList.map((task) => (
                  <li key={task.id}>
                    <ShoppingItemRow
                      title={task.title}
                      mode="bought"
                      onRestore={() => restore(task.id)}
                    />
                  </li>
                ))
              : null}
          </ul>
        )}
      </div>

      <form
        onSubmit={handleAdd}
        className="flex-shrink-0 flex gap-2 pt-1"
        aria-label="Añadir artículo"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Leche, pan, tomates…"
          enterKeyHint="done"
          autoComplete="off"
          className="input-base flex-1 min-w-0"
          aria-label="Nombre del artículo"
        />
        <button
          type="submit"
          disabled={!draft.trim() || !buyColumn}
          className="btn-primary inline-flex items-center gap-1 px-3 disabled:opacity-50"
        >
          <PlusIcon className="w-4 h-4" aria-hidden />
          Añadir
        </button>
      </form>
    </div>
  );
};
