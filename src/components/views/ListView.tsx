import { Task, Category } from '@/types/task';
import { TaskItem } from '../TaskItem';
import { ListTodo } from 'lucide-react';

interface ListViewProps {
  tasks: Task[];
  categories: Category[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onReorder: (activeId: string, overId: string) => void;
}

export function ListView({ tasks, categories, onToggle, onDelete, onEdit }: ListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center mb-4">
          <ListTodo className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-medium text-foreground mb-1">No tasks yet</h3>
        <p className="text-muted-foreground text-sm">Add your first task to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          category={categories.find(c => c.id === task.categoryId)}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
