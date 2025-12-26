-- Add order column to tasks table for manual sorting
ALTER TABLE public.tasks 
ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

-- Create an index for efficient ordering queries
CREATE INDEX idx_tasks_user_order ON public.tasks(user_id, "order");

-- Initialize order values based on created_at for existing tasks
UPDATE public.tasks 
SET "order" = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as row_num
  FROM public.tasks
) as subquery
WHERE public.tasks.id = subquery.id;