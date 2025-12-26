import { useState } from 'react';
import { Clock, Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Reminder } from '@/hooks/useNotifications';
import { format, addMinutes, addHours, addDays } from 'date-fns';
import { toast } from 'sonner';

interface ReminderDialogProps {
  taskId: string;
  taskTitle: string;
  dueDate: string | null;
  reminders: Reminder[];
  onAddReminder: (taskId: string, remindAt: Date, message?: string) => Promise<Reminder | null>;
  onDeleteReminder: (id: string) => Promise<boolean>;
}

export function ReminderDialog({
  taskId,
  taskTitle,
  dueDate,
  reminders,
  onAddReminder,
  onDeleteReminder,
}: ReminderDialogProps) {
  const [open, setOpen] = useState(false);
  const [reminderType, setReminderType] = useState<string>('custom');
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const taskReminders = reminders.filter(r => r.task_id === taskId && !r.is_triggered);

  const quickOptions = [
    { label: 'In 15 minutes', value: '15min', getDate: () => addMinutes(new Date(), 15) },
    { label: 'In 30 minutes', value: '30min', getDate: () => addMinutes(new Date(), 30) },
    { label: 'In 1 hour', value: '1hour', getDate: () => addHours(new Date(), 1) },
    { label: 'In 3 hours', value: '3hours', getDate: () => addHours(new Date(), 3) },
    { label: 'Tomorrow morning', value: 'tomorrow', getDate: () => {
      const d = addDays(new Date(), 1);
      d.setHours(9, 0, 0, 0);
      return d;
    }},
  ];

  if (dueDate) {
    const dueDateObj = new Date(dueDate);
    quickOptions.unshift({
      label: 'At due date/time',
      value: 'due',
      getDate: () => dueDateObj,
    });
    quickOptions.splice(1, 0, {
      label: '1 hour before due',
      value: '1hour-before',
      getDate: () => addHours(dueDateObj, -1),
    });
  }

  const handleAddReminder = async () => {
    let remindAt: Date;

    if (reminderType === 'custom') {
      if (!customDate || !customTime) {
        toast.error('Please select date and time');
        return;
      }
      remindAt = new Date(`${customDate}T${customTime}`);
    } else {
      const option = quickOptions.find(o => o.value === reminderType);
      if (!option) return;
      remindAt = option.getDate();
    }

    if (remindAt <= new Date()) {
      toast.error('Reminder time must be in the future');
      return;
    }

    setLoading(true);
    const result = await onAddReminder(taskId, remindAt, message || `Reminder: ${taskTitle}`);
    setLoading(false);

    if (result) {
      toast.success('Reminder set');
      setReminderType('custom');
      setCustomDate('');
      setCustomTime('');
      setMessage('');
    } else {
      toast.error('Failed to set reminder');
    }
  };

  const handleDeleteReminder = async (id: string) => {
    const success = await onDeleteReminder(id);
    if (success) {
      toast.success('Reminder removed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Set reminder"
        >
          <Clock className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Set Reminder
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Task: <span className="font-medium text-foreground">{taskTitle}</span>
          </div>

          {/* Existing reminders */}
          {taskReminders.length > 0 && (
            <div className="space-y-2">
              <Label>Active Reminders</Label>
              <div className="space-y-1">
                {taskReminders.map(reminder => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-2 bg-secondary rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="w-3 h-3 text-primary" />
                      <span>{format(new Date(reminder.remind_at), 'MMM d, h:mm a')}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleDeleteReminder(reminder.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick options */}
          <div className="space-y-2">
            <Label>When to remind</Label>
            <Select value={reminderType} onValueChange={setReminderType}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {quickOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom date/time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom date/time */}
          {reminderType === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label>Message (optional)</Label>
            <Input
              placeholder="Add a note..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <Button onClick={handleAddReminder} disabled={loading} className="w-full">
            {loading ? 'Setting...' : 'Set Reminder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
