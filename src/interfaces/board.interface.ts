import { Task } from './task.interface';

export interface Board {
    id: number;
    name: string;
    emoji: string;
    color: string;
    link: string;
    tasks?: Task[];
}
