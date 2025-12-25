import { Category } from '@/types/task';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          selectedCategory === null
            ? 'bg-foreground text-background'
            : 'bg-secondary text-muted-foreground hover:text-foreground'
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedCategory === category.id
              ? 'text-background'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
          style={{
            backgroundColor: selectedCategory === category.id ? `hsl(${category.color})` : undefined,
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: `hsl(${category.color})` }}
          />
          {category.name}
        </button>
      ))}
    </div>
  );
}
