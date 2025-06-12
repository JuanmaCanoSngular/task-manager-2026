export const TASK_STATUS = [
  { status: 'backlog', label: 'Backlog', color: 'bg-gray-500' },
  { status: 'in-progress', label: 'In Progress', color: 'bg-yellow-300' },
  { status: 'in-review', label: 'In Review', color: 'bg-purple-500' },
  { status: 'completed', label: 'Completed', color: 'bg-green-400' },
] as const;

type TaskStatus = (typeof TASK_STATUS)[number]['status'];

type TaskTag =
  | 'new-concept'
  | 'technical'
  | 'styling'
  | 'front-end'
  | 'interactivity'
  | 'filtering'
  | 'design'
  | 'responsive';

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  background: string | null;
  tags: TaskTag[];
}
