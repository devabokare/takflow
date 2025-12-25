import { useState } from 'react';
import { Plus, Calendar, Flag } from 'lucide-react';
import { Task, Priority } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface TaskInputProps {
  onAddTask: (title: string, priority: Priority, dueDate: string | null) => void;
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'text-priority-low' },
  medium: { label: 'Medium', className: 'text-priority-medium' },
  high: { label: 'High', className: 'text-priority-high' },
};

export function TaskInput({ onAddTask }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask(title.trim(), priority, dueDate ? dueDate.toISOString() : null);
      setTitle('');
      setPriority('medium');
      setDueDate(undefined);
      setIsExpanded(false);
    }
  };

  const cyclePriority = () => {
    const priorities: Priority[] = ['low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(priority);
    setPriority(priorities[(currentIndex + 1) % priorities.length]);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="relative">
        <div className="flex items-center gap-3 p-4 bg-card rounded-xl shadow-soft border border-border/50 transition-all duration-300 hover:shadow-medium focus-within:shadow-medium focus-within:border-primary/30">
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-glow transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
          >
            <Plus className="w-5 h-5" />
          </button>
          
          <Input
            type="text"
            placeholder="Add a new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="flex-1 border-0 bg-transparent text-lg placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          
          <div className={`flex items-center gap-2 transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
            <button
              type="button"
              onClick={cyclePriority}
              className={`p-2 rounded-lg hover:bg-secondary transition-colors ${priorityConfig[priority].className}`}
              title={`Priority: ${priorityConfig[priority].label}`}
            >
              <Flag className="w-5 h-5" fill="currentColor" />
            </button>
            
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`p-2 rounded-lg hover:bg-secondary transition-colors ${dueDate ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Calendar className="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {isExpanded && (title || dueDate) && (
          <div className="flex items-center gap-3 mt-3 px-4 text-sm text-muted-foreground animate-fade-in">
            <span className={priorityConfig[priority].className}>
              {priorityConfig[priority].label} priority
            </span>
            {dueDate && (
              <>
                <span>•</span>
                <span>Due {format(dueDate, 'MMM d, yyyy')}</span>
              </>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
