import { Search, X } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TRANSACTION_TYPES } from '../../utils/formatters';

export default function TransactionFilterBar({ filters, onUpdate }) {
  const allCategories = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])].sort();

  const handleClear = () => {
    onUpdate({
      search: '',
      category: '',
      type: '',
    });
  };

  const hasActiveFilters = filters.search || filters.category || filters.type;

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search description..."
            value={filters.search || ''}
            onChange={(e) => onUpdate({ search: e.target.value })}
            className="input pl-10 pr-4"
            aria-label="Search transactions"
          />
        </div>

        {/* Type filter */}
        <div className="sm:w-40">
          <select
            value={filters.type || ''}
            onChange={(e) => onUpdate({ type: e.target.value })}
            className="input"
            aria-label="Filter by type"
          >
            <option value="">All types</option>
            {TRANSACTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Category filter */}
        <div className="sm:w-48">
          <select
            value={filters.category || ''}
            onChange={(e) => onUpdate({ category: e.target.value })}
            className="input"
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-ghost gap-2 animate-scale-in"
            aria-label="Clear all filters"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>
    </div>
  );
}
