export const TASK_STATUS = [
  { status: 'backlog', label: 'Backlog', color: 'bg-gray-500' },
  { status: 'in-progress', label: 'In Progress', color: 'bg-yellow-300' },
  { status: 'in-review', label: 'In Review', color: 'bg-purple-500' },
  { status: 'completed', label: 'Completed', color: 'bg-green-400' },
] as const;

export type TaskStatus = (typeof TASK_STATUS)[number]['status'];

export const TASK_TAGS = [
  { tag: 'technical', label: 'Technical', bgColor: 'bg-red-100', textColor: 'text-red-800' },
  { tag: 'front-end', label: 'Front End', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  {
    tag: 'interactivity',
    label: 'Interactivity',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  {
    tag: 'styling',
    label: 'Styling',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
  },
  { tag: 'filtering', label: 'Filtering', bgColor: 'bg-pink-100', textColor: 'text-pink-800' },
  { tag: 'design', label: 'Design', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  {
    tag: 'responsive',
    label: 'Responsive',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-800',
  },
  { tag: 'new-concept', label: 'New Concept', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800' },
] as const;

export type TaskTag = (typeof TASK_TAGS)[number]['tag'];

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  tags: TaskTag[];
  background?: string;
}
