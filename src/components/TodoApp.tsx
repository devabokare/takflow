import { useState, useMemo, useEffect } from 'react';
import { Task, Priority, FilterStatus, ViewMode, Category, DEFAULT_CATEGORIES, TaskStatus } from '@/types/task';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TaskInput } from '@/components/TaskInput';
import { ListView } from '@/components/views/ListView';
import { BoardView } from '@/components/views/BoardView';
import { CalendarView } from '@/components/views/CalendarView';
import { TaskFilters } from '@/components/TaskFilters';
import { SearchBar } from '@/components/SearchBar';
import { ProgressBar } from '@/components/ProgressBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ViewToggle } from '@/components/ViewToggle';
import { CategoryFilter } from '@/components/CategoryFilter';
import { LayoutGrid } from 'lucide-react';

export function TodoApp() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('todo-tasks', []);
  const [categories] = useLocalStorage<Category[]>('todo-categories', DEFAULT_CATEGORIES);
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
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const addTask = (title: string, priority: Priority, dueDate: string | null, categoryId: string | null) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      priority,
      dueDate,
      createdAt: new Date().toISOString(),
      categoryId,
      status: 'todo',
    };
    setTasks([newTask, ...tasks]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((task) => 
      task.id === id ? { 
        ...task, 
        completed: !task.completed,
        status: !task.completed ? 'done' : 'todo'
      } : task
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

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(tasks.map((task) =>
      task.id === id ? { 
        ...task, 
        status,
        completed: status === 'done'
      } : task
    ));
  };

  const reorderTasks = (activeId: string, overId: string) => {
    const oldIndex = tasks.findIndex(t => t.id === activeId);
    const newIndex = tasks.findIndex(t => t.id === overId);
    if (oldIndex !== -1 && newIndex !== -1) {
      const newTasks = [...tasks];
      const [removed] = newTasks.splice(oldIndex, 1);
      newTasks.splice(newIndex, 0, removed);
      setTasks(newTasks);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
      })
      .filter((task) => {
        if (selectedCategory) return task.categoryId === selectedCategory;
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

  const renderView = () => {
    switch (viewMode) {
      case 'board':
        return (
          <BoardView
            tasks={filteredTasks}
            categories={categories}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={editTask}
            onStatusChange={updateTaskStatus}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            tasks={filteredTasks}
            categories={categories}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={editTask}
          />
        );
      default:
        return (
          <ListView
            tasks={filteredTasks}
            categories={categories}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={editTask}
            onReorder={reorderTasks}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-foreground flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-background" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Workspace</h1>
              <p className="text-sm text-muted-foreground">Your personal productivity hub</p>
            </div>
          </div>
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
        </header>

        {/* Progress */}
        <div className="mb-6 p-4 bg-card rounded-lg border border-border">
          <ProgressBar completed={counts.completed} total={counts.all} />
        </div>

        {/* Task Input */}
        <div className="mb-6">
          <TaskInput onAddTask={addTask} categories={categories} />
        </div>

        {/* Controls Row */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
            <TaskFilters
              currentFilter={filter}
              onFilterChange={setFilter}
              counts={counts}
            />
            <div className="flex-1 min-w-[180px] max-w-[240px]">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* View */}
        <div className="min-h-[400px]">
          {renderView()}
        </div>

        {/* Footer */}
        {tasks.length > 0 && (
          <footer className="mt-8 text-center text-sm text-muted-foreground">
            {counts.active === 0 && counts.completed > 0 ? (
              <span>All tasks completed! Great job!</span>
            ) : (
              <span>{counts.active} task{counts.active !== 1 ? 's' : ''} remaining</span>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}
