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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-secondary/80 flex items-center justify-center mb-6">
          <ListTodo className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No tasks yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Add your first task above to start organizing your day
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <div 
          key={task.id} 
          className="animate-fade-in"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <TaskItem
            task={task}
            category={categories.find(c => c.id === task.categoryId)}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      ))}
    </div>
  );
}
