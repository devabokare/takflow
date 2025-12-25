import { FilterStatus } from '@/types/task';

interface TaskFiltersProps {
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  counts: { all: number; active: number; completed: number };
}

const filters: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

export function TaskFilters({ currentFilter, onFilterChange, counts }: TaskFiltersProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            currentFilter === filter.value
              ? 'bg-card text-foreground shadow-soft'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {filter.label}
          <span className={`ml-1.5 text-xs ${
            currentFilter === filter.value ? 'text-primary' : 'text-muted-foreground/60'
          }`}>
            {counts[filter.value]}
          </span>
        </button>
      ))}
    </div>
  );
}
