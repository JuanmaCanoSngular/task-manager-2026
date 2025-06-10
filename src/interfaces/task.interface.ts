type TaskStatus = 'backlog' | 'in-review' | 'in-progress' | 'completed';

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
