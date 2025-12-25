import { useMemo, useState } from 'react';
import { Task, Category } from '@/types/task';
import { CategoryBadge } from '../CategoryBadge';
import { 
  format, 
  startOfWeek, 
  addDays, 
  isToday, 
  isSameDay,
  startOfDay,
  endOfDay,
  isWithinInterval,
  subDays
} from 'date-fns';
import { ChevronLeft, ChevronRight, Check, Clock, TrendingUp, Target, Calendar } from 'lucide-react';

interface PlannerViewProps {
  tasks: Task[];
  categories: Category[];
  onToggle: (id: string) => void;
}

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00'
];

export function PlannerView({ tasks, categories, onToggle }: PlannerViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), day);
    });
  };

  // Weekly stats
  const weeklyStats = useMemo(() => {
    const weekEnd = addDays(weekStart, 6);
    const weekTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return isWithinInterval(taskDate, { start: weekStart, end: endOfDay(weekEnd) });
    });

    const completed = weekTasks.filter(t => t.completed).length;
    const total = weekTasks.length;
    const previousWeekStart = subDays(weekStart, 7);
    const previousWeekEnd = subDays(weekStart, 1);
    
    const previousWeekTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return isWithinInterval(taskDate, { start: previousWeekStart, end: endOfDay(previousWeekEnd) });
    });
    const previousCompleted = previousWeekTasks.filter(t => t.completed).length;

    return {
      total,
      completed,
      pending: total - completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      trend: completed - previousCompleted,
    };
  }, [tasks, weekStart]);

  // Today's stats
  const todayStats = useMemo(() => {
    const todayTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      return isToday(new Date(task.dueDate));
    });

    return {
      total: todayTasks.length,
      completed: todayTasks.filter(t => t.completed).length,
      high: todayTasks.filter(t => t.priority === 'high' && !t.completed).length,
    };
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Weekly Review Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="w-4 h-4" />
            <span className="text-xs font-medium">Weekly Tasks</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{weeklyStats.total}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {weeklyStats.pending} remaining
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Check className="w-4 h-4" />
            <span className="text-xs font-medium">Completed</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{weeklyStats.completed}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className={`w-3 h-3 ${weeklyStats.trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-xs ${weeklyStats.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {weeklyStats.trend >= 0 ? '+' : ''}{weeklyStats.trend} vs last week
            </span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Completion Rate</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{weeklyStats.completionRate}%</p>
          <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
            <div 
              className="bg-foreground h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${weeklyStats.completionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">Today</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {todayStats.completed}/{todayStats.total}
          </p>
          {todayStats.high > 0 && (
            <p className="text-xs text-priority-high mt-1">
              {todayStats.high} high priority
            </p>
          )}
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Week of {format(weekStart, 'MMMM d, yyyy')}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentDate(subDays(currentDate, 7))}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-sm rounded-lg hover:bg-secondary transition-colors"
          >
            This Week
          </button>
          <button
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daily Planner Grid */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-8 border-b border-border">
          <div className="p-3 text-xs font-medium text-muted-foreground border-r border-border">
            Time
          </div>
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className={`p-3 text-center border-r border-border last:border-r-0 ${
                isToday(day) ? 'bg-primary/5' : ''
              }`}
            >
              <p className="text-xs text-muted-foreground">{format(day, 'EEE')}</p>
              <p className={`text-sm font-medium ${
                isToday(day) ? 'text-primary' : 'text-foreground'
              }`}>
                {format(day, 'd')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {getTasksForDay(day).length} tasks
              </p>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="max-h-[500px] overflow-y-auto">
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8 border-b border-border last:border-b-0">
              <div className="p-2 text-xs text-muted-foreground border-r border-border flex items-start justify-end pr-3">
                {time}
              </div>
              {weekDays.map((day) => {
                const dayTasks = getTasksForDay(day);
                const hour = parseInt(time.split(':')[0]);
                // Simple distribution: spread tasks across working hours
                const taskIndex = Math.floor((hour - 6) / 2);
                const task = dayTasks[taskIndex];

                return (
                  <div
                    key={`${day.toISOString()}-${time}`}
                    className={`p-1 min-h-[60px] border-r border-border last:border-r-0 ${
                      isToday(day) ? 'bg-primary/5' : ''
                    }`}
                  >
                    {task && taskIndex === Math.floor((hour - 6) / 2) && (hour - 6) % 2 === 0 && (
                      <div
                        onClick={() => onToggle(task.id)}
                        className={`p-2 rounded text-xs cursor-pointer transition-all ${
                          task.completed
                            ? 'bg-secondary/50 text-muted-foreground line-through'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        <div className="flex items-start gap-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0"
                            style={{ 
                              backgroundColor: task.categoryId 
                                ? `hsl(${categories.find(c => c.id === task.categoryId)?.color || '0 0% 50%'})` 
                                : 'hsl(var(--muted-foreground))' 
                            }}
                          />
                          <span className="truncate flex-1">{task.title}</span>
                        </div>
                        {task.completed && (
                          <Check className="w-3 h-3 mt-1 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Today's Focus */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Today's Focus
        </h3>
        <div className="space-y-2">
          {tasks
            .filter(t => t.dueDate && isToday(new Date(t.dueDate)) && !t.completed)
            .slice(0, 5)
            .map(task => {
              const category = categories.find(c => c.id === task.categoryId);
              return (
                <div
                  key={task.id}
                  onClick={() => onToggle(task.id)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
                >
                  <button className="w-4 h-4 rounded border border-border flex-shrink-0" />
                  <span className="text-sm text-foreground flex-1">{task.title}</span>
                  {category && <CategoryBadge category={category} />}
                  <span className={`text-xs ${
                    task.priority === 'high' ? 'text-priority-high' :
                    task.priority === 'medium' ? 'text-priority-medium' : 'text-priority-low'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              );
            })}
          {tasks.filter(t => t.dueDate && isToday(new Date(t.dueDate)) && !t.completed).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tasks scheduled for today. Enjoy your day!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
