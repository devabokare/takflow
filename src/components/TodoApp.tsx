import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTasks, Priority, TaskStatus } from '@/hooks/useTasks';
import { useNotifications } from '@/hooks/useNotifications';
import { TaskInput } from '@/components/TaskInput';
import { ListView } from '@/components/views/ListView';
import { BoardView } from '@/components/views/BoardView';
import { CalendarView } from '@/components/views/CalendarView';
import { PlannerView } from '@/components/views/PlannerView';
import { TaskFilters } from '@/components/TaskFilters';
import { SearchBar } from '@/components/SearchBar';
import { ProgressBar } from '@/components/ProgressBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ViewToggle } from '@/components/ViewToggle';
import { CategoryFilter } from '@/components/CategoryFilter';
import { NotificationCenter } from '@/components/NotificationCenter';
import { LayoutGrid, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FilterStatus = 'all' | 'active' | 'completed';
type ViewMode = 'list' | 'board' | 'calendar' | 'planner';

export function TodoApp() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { tasks, categories, attachments, loading: tasksLoading, addTask, toggleTask, deleteTask, editTask, updateTaskStatus, addAttachment, removeAttachment, reorderTasks } = useTasks();
  const { 
    notifications, 
    reminders,
    unreadCount, 
    addReminder,
    deleteReminder,
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll 
  } = useNotifications();
  
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleAddTask = (title: string, priority: Priority, dueDate: string | null, categoryId: string | null) => {
    addTask(title, priority, dueDate, categoryId);
  };

  const handleStatusChange = (id: string, status: TaskStatus) => {
    updateTaskStatus(id, status);
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
      })
      .filter((task) => {
        if (selectedCategory) return task.category_id === selectedCategory;
        return true;
      })
      .filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [tasks, filter, searchQuery, selectedCategory]);

  const counts = useMemo(() => ({
    all: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  }), [tasks]);

  // Convert tasks to the format expected by view components
  const viewTasks = useMemo(() => {
    return filteredTasks.map(task => ({
      ...task,
      dueDate: task.due_date,
      categoryId: task.category_id,
      createdAt: task.created_at,
    }));
  }, [filteredTasks]);

  const viewCategories = useMemo(() => {
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
    }));
  }, [categories]);

  const renderView = () => {
    switch (viewMode) {
      case 'board':
        return (
          <BoardView
            tasks={viewTasks as any}
            categories={viewCategories}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={editTask}
            onStatusChange={handleStatusChange as any}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            tasks={viewTasks as any}
            categories={viewCategories}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={editTask}
          />
        );
      case 'planner':
        return (
          <PlannerView
            tasks={viewTasks as any}
            categories={viewCategories}
            onToggle={toggleTask}
          />
        );
      default:
        return (
          <ListView
            tasks={viewTasks as any}
            categories={viewCategories}
            attachments={attachments}
            reminders={reminders}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={editTask}
            onReorder={reorderTasks}
            onAddAttachment={addAttachment}
            onDeleteAttachment={removeAttachment}
            onAddReminder={addReminder}
            onDeleteReminder={deleteReminder}
          />
        );
    }
  };

  if (authLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-medium">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">TaskFlow</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDelete={deleteNotification}
              onClearAll={clearAll}
            />
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Progress */}
        <div className="mb-6 p-5 bg-card rounded-2xl border border-border shadow-soft animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <ProgressBar completed={counts.completed} total={counts.all} />
        </div>

        {/* Task Input */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <TaskInput onAddTask={handleAddTask} categories={viewCategories} />
        </div>

        {/* Controls Row */}
        <div className="flex flex-col gap-4 mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-wrap items-center gap-3">
            <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
            <TaskFilters
              currentFilter={filter}
              onFilterChange={setFilter}
              counts={counts}
            />
            <div className="flex-1 min-w-[180px] max-w-[260px]">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>
          <CategoryFilter
            categories={viewCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* View */}
        <div className="min-h-[400px] animate-fade-in" style={{ animationDelay: '0.25s' }}>
          {renderView()}
        </div>

        {/* Footer */}
        {tasks.length > 0 && (
          <footer className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-sm text-muted-foreground">
              {counts.active === 0 && counts.completed > 0 ? (
                <span>🎉 All tasks completed! Great job!</span>
              ) : (
                <span>{counts.active} task{counts.active !== 1 ? 's' : ''} remaining</span>
              )}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
