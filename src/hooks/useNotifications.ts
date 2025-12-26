import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  user_id: string;
  task_id: string | null;
  title: string;
  message: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface Reminder {
  id: string;
  task_id: string;
  user_id: string;
  remind_at: string;
  message: string | null;
  is_triggered: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.is_read).length);
    }
  }, [user]);

  // Fetch reminders
  const fetchReminders = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('remind_at', { ascending: true });

    if (error) {
      console.error('Error fetching reminders:', error);
    } else {
      setReminders(data || []);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchNotifications(), fetchReminders()]).finally(() => {
        setLoading(false);
      });
    } else {
      setNotifications([]);
      setReminders([]);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [user, fetchNotifications, fetchReminders]);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Check for due reminders and create notifications
  useEffect(() => {
    if (!user || reminders.length === 0) return;

    const checkReminders = async () => {
      const now = new Date();
      const dueReminders = reminders.filter(r => 
        !r.is_triggered && new Date(r.remind_at) <= now
      );

      for (const reminder of dueReminders) {
        // Create notification for due reminder
        await supabase.from('notifications').insert({
          user_id: user.id,
          task_id: reminder.task_id,
          title: 'Reminder',
          message: reminder.message || 'You have a scheduled reminder',
          type: 'reminder',
        });

        // Mark reminder as triggered
        await supabase
          .from('reminders')
          .update({ is_triggered: true })
          .eq('id', reminder.id);
      }

      if (dueReminders.length > 0) {
        fetchReminders();
      }
    };

    // Check immediately and then every minute
    checkReminders();
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [user, reminders, fetchReminders]);

  // Add reminder
  const addReminder = async (
    taskId: string,
    remindAt: Date,
    message?: string
  ) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: user.id,
        task_id: taskId,
        remind_at: remindAt.toISOString(),
        message,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding reminder:', error);
      return null;
    }

    setReminders(prev => [...prev, data]);
    return data;
  };

  // Delete reminder
  const deleteReminder = async (id: string) => {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting reminder:', error);
      return false;
    }

    setReminders(prev => prev.filter(r => r.id !== id));
    return true;
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }

    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return;
    }

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
      return;
    }

    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notification && !notification.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing notifications:', error);
      return;
    }

    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    reminders,
    unreadCount,
    loading,
    addReminder,
    deleteReminder,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}
