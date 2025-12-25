import { useState, useMemo, useEffect } from 'react';
import { Task, Priority, FilterStatus } from '@/types/task';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TaskInput } from '@/components/TaskInput';
import { TaskList } from '@/components/TaskList';
import { TaskFilters } from '@/components/TaskFilters';
import { SearchBar } from '@/components/SearchBar';
import { ProgressBar } from '@/components/ProgressBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CheckCircle2 } from 'lucide-react';

export function TodoApp() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('todo-tasks', []);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const addTask = (title: string, priority: Priority, dueDate: string | null) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      priority,
      dueDate,
      createdAt: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((task) => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const editTask = (id: string, title: string) => {
    setTasks(tasks.map((task) =>
      task.id === id ? { ...task, title } : task
    ));
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
      })
      .filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [tasks, filter, searchQuery]);

  const counts = useMemo(() => ({
    all: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  }), [tasks]);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">TaskFlow</h1>
              <p className="text-sm text-muted-foreground">Stay organized, stay productive</p>
            </div>
          </div>
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
        </header>

        {/* Progress */}
        <div className="mb-8 p-5 bg-card rounded-2xl border border-border/50 shadow-soft animate-slide-up" style={{ animationDelay: '100ms' }}>
          <ProgressBar completed={counts.completed} total={counts.all} />
        </div>

        {/* Task Input */}
        <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <TaskInput onAddTask={addTask} />
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <TaskFilters
            currentFilter={filter}
            onFilterChange={setFilter}
            counts={counts}
          />
          <div className="flex-1 sm:max-w-[200px]">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>

        {/* Task List */}
        <div className="animate-slide-up" style={{ animationDelay: '250ms' }}>
          <TaskList
            tasks={filteredTasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={editTask}
          />
        </div>

        {/* Footer */}
        {tasks.length > 0 && (
          <footer className="mt-8 text-center text-sm text-muted-foreground animate-fade-in">
            {counts.active === 0 && counts.completed > 0 ? (
              <span className="text-accent">All tasks completed! Great job! 🎉</span>
            ) : (
              <span>{counts.active} task{counts.active !== 1 ? 's' : ''} remaining</span>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}
