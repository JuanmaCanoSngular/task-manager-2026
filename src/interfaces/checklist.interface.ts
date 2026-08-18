export interface ChecklistItem {
  id: string;
  taskId: number;
  title: string;
  done: boolean;
  position: number;
}

export const MAX_CHECKLIST_ITEMS = 40;
export const MAX_CHECKLIST_ITEM_LENGTH = 80;
