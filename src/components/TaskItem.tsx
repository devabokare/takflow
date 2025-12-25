import { useState } from 'react';
import { Check, Trash2, Edit2, X, Flag, Calendar } from 'lucide-react';
import { Task, Priority, Category } from '@/types/task';
import { CategoryBadge } from './CategoryBadge';
import { Input } from '@/components/ui/input';
import { format, isToday, isTomorrow, isPast, isValid } from 'date-fns';

interface TaskItemProps {
  task: Task;
  category?: Category;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'text-priority-low' },
  medium: { label: 'Medium', className: 'text-priority-medium' },
  high: { label: 'High', className: 'text-priority-high' },
};

export function TaskItem({ task, category, onToggle, onDelete, onEdit }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isExiting, setIsExiting] = useState(false);

  const handleEdit = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onEdit(task.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    setIsExiting(true);
    setTimeout(() => onDelete(task.id), 150);
  };

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (!isValid(date)) return null;
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const isOverdue = task.dueDate && !task.completed && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  return (
    <div
      className={`group flex items-center gap-3 p-3 bg-card rounded-lg border border-border transition-all duration-200 hover:bg-secondary/30 ${
        isExiting ? 'opacity-0 scale-95' : ''
      } ${task.completed ? 'opacity-60' : ''}`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
          task.completed
            ? 'bg-foreground border-foreground text-background'
            : 'border-border hover:border-foreground/50'
        }`}
      >
        {task.completed && <Check className="w-3 h-3" strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEdit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              onBlur={handleEdit}
              autoFocus
              className="flex-1 h-7 text-sm"
            />
            <button
              onClick={() => setIsEditing(false)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <p
              onClick={() => setIsEditing(true)}
              className={`text-sm cursor-text transition-all duration-200 ${
                task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}
            >
              {task.title}
            </p>
            
            {/* Meta info inline */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {category && <CategoryBadge category={category} />}
              
              <span className={`${priorityConfig[task.priority].className}`}>
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
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
