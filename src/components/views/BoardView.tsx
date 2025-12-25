import { Task, Category, TaskStatus } from '@/types/task';
import { CategoryBadge } from '../CategoryBadge';
import { Check, Trash2, GripVertical, Flag, Calendar } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, isValid } from 'date-fns';

interface BoardViewProps {
  tasks: Task[];
  categories: Category[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: '0 0% 50%' },
  { id: 'in-progress', title: 'In Progress', color: '38 92% 50%' },
  { id: 'done', title: 'Done', color: '142 76% 36%' },
];

export function BoardView({ tasks, categories, onDelete, onStatusChange }: BoardViewProps) {
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => {
      if (status === 'done') return task.completed || task.status === 'done';
      if (status === 'todo') return !task.completed && (task.status === 'todo' || !task.status);
      return task.status === status;
    });
  };

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (!isValid(date)) return null;
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        return (
          <div key={column.id} className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3 px-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: `hsl(${column.color})` }}
              />
              <h3 className="text-sm font-medium text-foreground">{column.title}</h3>
              <span className="text-xs text-muted-foreground ml-auto">{columnTasks.length}</span>
            </div>
            
            <div className="space-y-2 min-h-[200px]">
              {columnTasks.map((task) => {
                const category = categories.find(c => c.id === task.categoryId);
                const isOverdue = task.dueDate && !task.completed && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

                return (
                  <div
                    key={task.id}
                    className="group bg-card rounded-lg p-3 border border-border hover:border-border/80 transition-all duration-200 cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {category && <CategoryBadge category={category} />}
                          
                          <span className={`flex items-center gap-1 text-xs ${
                            task.priority === 'high' ? 'text-priority-high' :
                            task.priority === 'medium' ? 'text-priority-medium' : 'text-priority-low'
                          }`}>
                            <Flag className="w-3 h-3" fill="currentColor" />
                          </span>
                          
                          {task.dueDate && (
                            <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                              <Calendar className="w-3 h-3" />
                              {formatDueDate(task.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                      {columns.filter(c => c.id !== column.id).map(targetCol => (
                        <button
                          key={targetCol.id}
                          onClick={() => onStatusChange(task.id, targetCol.id)}
                          className="flex-1 text-xs py-1 px-2 rounded bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors"
                        >
                          Move to {targetCol.title}
                        </button>
                      ))}
                      <button
                        onClick={() => onDelete(task.id)}
                        className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {columnTasks.length === 0 && (
                <div className="flex items-center justify-center h-24 border-2 border-dashed border-border/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">No tasks</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
