import { useState } from 'react';
import { Plus, Calendar, Flag, Tag } from 'lucide-react';
import { Priority, Category } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface TaskInputProps {
  onAddTask: (title: string, priority: Priority, dueDate: string | null, categoryId: string | null) => void;
  categories: Category[];
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'text-priority-low' },
  medium: { label: 'Medium', className: 'text-priority-medium' },
  high: { label: 'High', className: 'text-priority-high' },
};

export function TaskInput({ onAddTask, categories }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask(title.trim(), priority, dueDate ? dueDate.toISOString() : null, selectedCategoryId);
      setTitle('');
      setPriority('medium');
      setDueDate(undefined);
      setSelectedCategoryId(null);
      setIsExpanded(false);
    }
  };

  const cyclePriority = () => {
    const priorities: Priority[] = ['low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(priority);
    setPriority(priorities[(currentIndex + 1) % priorities.length]);
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative">
        <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border transition-all duration-200 hover:border-border/80 focus-within:border-foreground/20">
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-foreground flex items-center justify-center text-background transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-30"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          <Input
            type="text"
            placeholder="Add a new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="flex-1 border-0 bg-transparent text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 h-8 px-0"
          />
          
          <div className={`flex items-center gap-1 transition-all duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button
              type="button"
              onClick={cyclePriority}
              className={`p-2 rounded-lg hover:bg-secondary transition-colors ${priorityConfig[priority].className}`}
              title={`Priority: ${priorityConfig[priority].label}`}
            >
              <Flag className="w-4 h-4" fill="currentColor" />
            </button>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`p-2 rounded-lg hover:bg-secondary transition-colors ${selectedCategory ? '' : 'text-muted-foreground'}`}
                  style={selectedCategory ? { color: `hsl(${selectedCategory.color})` } : undefined}
                >
                  <Tag className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="end">
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedCategoryId ? 'bg-secondary' : 'hover:bg-secondary'
                    }`}
                  >
                    No category
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(category.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategoryId === category.id ? 'bg-secondary' : 'hover:bg-secondary'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: `hsl(${category.color})` }}
                      />
                      {category.name}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`p-2 rounded-lg hover:bg-secondary transition-colors ${dueDate ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {isExpanded && (title || dueDate || selectedCategory) && (
          <div className="flex items-center gap-3 mt-2 px-3 text-xs text-muted-foreground">
            <span className={priorityConfig[priority].className}>
              {priorityConfig[priority].label}
            </span>
            {selectedCategory && (
              <>
                <span>•</span>
                <span style={{ color: `hsl(${selectedCategory.color})` }}>
                  {selectedCategory.name}
                </span>
              </>
            )}
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
