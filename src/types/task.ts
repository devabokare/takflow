export type Priority = 'low' | 'medium' | 'high';
export type FilterStatus = 'all' | 'active' | 'completed';
export type ViewMode = 'list' | 'board' | 'calendar';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
  categoryId: string | null;
  status: TaskStatus;
  description?: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: '217 91% 60%' },
  { id: 'personal', name: 'Personal', color: '142 76% 36%' },
  { id: 'shopping', name: 'Shopping', color: '25 95% 53%' },
  { id: 'health', name: 'Health', color: '346 77% 50%' },
  { id: 'learning', name: 'Learning', color: '262 83% 58%' },
];
