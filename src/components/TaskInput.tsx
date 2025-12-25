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
        <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border shadow-soft transition-all duration-200 hover:shadow-medium focus-within:border-primary/30 focus-within:shadow-medium">
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
          </button>
          
          <Input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="flex-1 border-0 bg-transparent text-base font-medium placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 h-10 px-0"
          />
          
          <div className={`flex items-center gap-1 transition-all duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button
              type="button"
              onClick={cyclePriority}
              className={`p-2.5 rounded-lg hover:bg-secondary transition-colors ${priorityConfig[priority].className}`}
              title={`Priority: ${priorityConfig[priority].label}`}
            >
              <Flag className="w-4 h-4" fill="currentColor" />
            </button>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`p-2.5 rounded-lg hover:bg-secondary transition-colors ${selectedCategory ? '' : 'text-muted-foreground'}`}
                  style={selectedCategory ? { color: `hsl(${selectedCategory.color})` } : undefined}
                >
                  <Tag className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-2" align="end">
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(null)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      !selectedCategoryId ? 'bg-secondary text-foreground' : 'hover:bg-secondary text-muted-foreground'
                    }`}
                  >
                    No category
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategoryId === category.id ? 'bg-secondary text-foreground' : 'hover:bg-secondary text-muted-foreground'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
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
                  className={`p-2.5 rounded-lg hover:bg-secondary transition-colors ${dueDate ? 'text-primary' : 'text-muted-foreground'}`}
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
                  className="pointer-events-auto rounded-xl"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {isExpanded && (title || dueDate || selectedCategory) && (
          <div className="flex items-center gap-3 mt-3 px-4 text-xs font-medium">
            <span className={`px-2 py-1 rounded-md bg-secondary ${priorityConfig[priority].className}`}>
              {priorityConfig[priority].label} priority
            </span>
            {selectedCategory && (
              <span 
                className="px-2 py-1 rounded-md"
                style={{ 
                  backgroundColor: `hsl(${selectedCategory.color} / 0.15)`,
                  color: `hsl(${selectedCategory.color})` 
                }}
              >
                {selectedCategory.name}
              </span>
            )}
            {dueDate && (
              <span className="px-2 py-1 rounded-md bg-secondary text-muted-foreground">
                Due {format(dueDate, 'MMM d, yyyy')}
              </span>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
