import { useEffect } from 'react';
import { boardService } from '../services/board.service';
import { useBoardStore } from '../stores/board.store';

/** Escucha cambios en `tasks` (Telegram, otras pestañas) y sincroniza el store. */
export const useTasksRealtime = () => {
  const applyRemoteTaskInsert = useBoardStore((s) => s.applyRemoteTaskInsert);
  const applyRemoteTaskUpdate = useBoardStore((s) => s.applyRemoteTaskUpdate);
  const applyRemoteTaskDelete = useBoardStore((s) => s.applyRemoteTaskDelete);

  useEffect(() => {
    const unsubscribe = boardService.subscribeTasks({
      onInsert: applyRemoteTaskInsert,
      onUpdate: applyRemoteTaskUpdate,
      onDelete: applyRemoteTaskDelete,
    });
    return unsubscribe;
  }, [applyRemoteTaskInsert, applyRemoteTaskUpdate, applyRemoteTaskDelete]);
};
