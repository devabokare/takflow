import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  status: TaskStatus;
  due_date: string | null;
  category_id: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

const DEFAULT_CATEGORIES = [
  { name: 'Work', color: '217 91% 60%' },
  { name: 'Personal', color: '142 76% 36%' },
  { name: 'Shopping', color: '25 95% 53%' },
  { name: 'Health', color: '346 77% 50%' },
  { name: 'Learning', color: '262 83% 58%' },
];

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } else {
      setTasks(data || []);
    }
  }, [user]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
    } else if (data && data.length === 0) {
      // Create default categories for new users
      const newCategories = DEFAULT_CATEGORIES.map(cat => ({
        user_id: user.id,
        name: cat.name,
        color: cat.color,
      }));

      const { data: insertedData, error: insertError } = await supabase
        .from('categories')
        .insert(newCategories)
        .select();

      if (!insertError && insertedData) {
        setCategories(insertedData);
      }
    } else {
      setCategories(data || []);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchTasks(), fetchCategories()]).finally(() => {
        setLoading(false);
      });
    } else {
      setTasks([]);
      setCategories([]);
      setLoading(false);
    }
  }, [user, fetchTasks, fetchCategories]);

  // Add task
  const addTask = async (
    title: string,
    priority: Priority,
    dueDate: string | null,
    categoryId: string | null
  ) => {
    if (!user) return;

    const newTask = {
      user_id: user.id,
      title,
      priority,
      due_date: dueDate,
      category_id: categoryId,
      completed: false,
      status: 'todo' as TaskStatus,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(newTask)
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    } else if (data) {
      setTasks(prev => [data, ...prev]);
      toast.success('Task added');
    }
  };

  // Toggle task completion
  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;
    const newStatus = newCompleted ? 'done' : 'todo';

    const { error } = await supabase
      .from('tasks')
      .update({ completed: newCompleted, status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error toggling task:', error);
      toast.error('Failed to update task');
    } else {
      setTasks(prev =>
        prev.map(t =>
          t.id === id ? { ...t, completed: newCompleted, status: newStatus } : t
        )
      );
    }
  };

  // Delete task
  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Task deleted');
    }
  };

  // Edit task title
  const editTask = async (id: string, title: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ title })
      .eq('id', id);

    if (error) {
      console.error('Error editing task:', error);
      toast.error('Failed to update task');
    } else {
      setTasks(prev => prev.map(t => (t.id === id ? { ...t, title } : t)));
    }
  };

  // Update task status
  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    const completed = status === 'done';

    const { error } = await supabase
      .from('tasks')
      .update({ status, completed })
      .eq('id', id);

    if (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task');
    } else {
      setTasks(prev =>
        prev.map(t => (t.id === id ? { ...t, status, completed } : t))
      );
    }
  };

  return {
    tasks,
    categories,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    updateTaskStatus,
  };
}
