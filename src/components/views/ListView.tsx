import { Task, Category } from '@/types/task';
import { TaskItem } from '../TaskItem';
import { ListTodo, GripVertical } from 'lucide-react';
import { Attachment } from '../FileUpload';
import { Reminder } from '@/hooks/useNotifications';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ListViewProps {
  tasks: Task[];
  categories: Category[];
  attachments?: Record<string, Attachment[]>;
  reminders?: Reminder[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onAddAttachment?: (attachment: Attachment) => void;
  onDeleteAttachment?: (taskId: string, attachmentId: string) => void;
  onAddReminder?: (taskId: string, remindAt: Date, message?: string) => Promise<Reminder | null>;
  onDeleteReminder?: (id: string) => Promise<boolean>;
}

interface SortableTaskItemProps {
  task: Task;
  category?: Category;
  attachments: Attachment[];
  reminders: Reminder[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onAddAttachment?: (attachment: Attachment) => void;
  onDeleteAttachment?: (taskId: string, attachmentId: string) => void;
  onAddReminder?: (taskId: string, remindAt: Date, message?: string) => Promise<Reminder | null>;
  onDeleteReminder?: (id: string) => Promise<boolean>;
}

function SortableTaskItem({
  task,
  category,
  attachments,
  reminders,
  onToggle,
  onDelete,
  onEdit,
  onAddAttachment,
  onDeleteAttachment,
  onAddReminder,
  onDeleteReminder,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-stretch gap-2">
      <button
        className="flex items-center justify-center px-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="flex-1">
        <TaskItem
          task={task}
          category={category}
          attachments={attachments}
          reminders={reminders}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          onAddAttachment={onAddAttachment}
          onDeleteAttachment={onDeleteAttachment}
          onAddReminder={onAddReminder}
          onDeleteReminder={onDeleteReminder}
        />
      </div>
    </div>
  );
}

export function ListView({ 
  tasks, 
  categories, 
  attachments = {}, 
  reminders = [],
  onToggle, 
  onDelete, 
  onEdit,
  onReorder,
  onAddAttachment, 
  onDeleteAttachment,
  onAddReminder,
  onDeleteReminder,
}: ListViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-secondary/80 flex items-center justify-center mb-6">
          <ListTodo className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No tasks yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Add your first task above to start organizing your day
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div 
              key={task.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <SortableTaskItem
                task={task}
                category={categories.find(c => c.id === task.categoryId)}
                attachments={attachments[task.id] || []}
                reminders={reminders}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                onAddAttachment={onAddAttachment}
                onDeleteAttachment={onDeleteAttachment}
                onAddReminder={onAddReminder}
                onDeleteReminder={onDeleteReminder}
              />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}