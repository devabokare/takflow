import { useMemo, useState } from 'react';
import { Task, Category } from '@/types/task';
import { CategoryBadge } from '../CategoryBadge';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  categories: Category[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
}

export function CalendarView({ tasks, categories, onToggle }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), day);
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startDayOfWeek = days[0].getDay();

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 text-sm rounded-lg hover:bg-secondary transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[100px] p-2 border-r border-b border-border bg-secondary/30" />
        ))}

        {days.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] p-2 border-r border-b border-border ${
                isCurrentDay ? 'bg-primary/5' : ''
              }`}
            >
              <div className={`text-sm font-medium mb-2 ${
                isCurrentDay ? 'text-primary' : 'text-muted-foreground'
              }`}>
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                  isCurrentDay ? 'bg-primary text-primary-foreground' : ''
                }`}>
                  {format(day, 'd')}
                </span>
              </div>

              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => {
                  const category = categories.find(c => c.id === task.categoryId);
                  return (
                    <div
                      key={task.id}
                      onClick={() => onToggle(task.id)}
                      className={`group flex items-center gap-1 p-1 rounded text-xs cursor-pointer transition-all ${
                        task.completed
                          ? 'bg-secondary/50 text-muted-foreground line-through'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category ? `hsl(${category.color})` : 'hsl(var(--muted-foreground))' }}
                      />
                      <span className="truncate flex-1">{task.title}</span>
                      {task.completed && <Check className="w-3 h-3 flex-shrink-0" />}
                    </div>
                  );
                })}
                {dayTasks.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{dayTasks.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
