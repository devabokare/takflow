import { Category } from '@/types/task';

interface CategoryBadgeProps {
  category: Category | undefined;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  if (!category) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
      style={{
        backgroundColor: `hsl(${category.color} / 0.15)`,
        color: `hsl(${category.color})`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: `hsl(${category.color})` }}
      />
      {category.name}
    </span>
  );
}
