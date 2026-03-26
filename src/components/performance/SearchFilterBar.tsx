import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

export type FilterStatus = 'all' | 'in-progress' | 'pending' | 'completed' | 'overdue';
export type SortBy = 'name' | 'department' | 'score' | 'date';

interface SearchFilterBarProps {
  onSearchChange: (query: string) => void;
  onFilterChange: (status: FilterStatus) => void;
  onSortChange: (sort: SortBy) => void;
  searchQuery?: string;
  filterStatus?: FilterStatus;
  sortBy?: SortBy;
  resultCount?: number;
}

export function SearchFilterBar({
  onSearchChange,
  onFilterChange,
  onSortChange,
  searchQuery = '',
  filterStatus = 'all',
  sortBy = 'name',
  resultCount,
}: SearchFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onSearchChange(value);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearchChange('');
  };

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by employee name..."
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {localSearch && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter and Sort Controls */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Filter by Status */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">Filter by Status</label>
          <Select value={filterStatus} onValueChange={(value) => onFilterChange(value as FilterStatus)}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">Sort By</label>
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortBy)}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Employee Name</SelectItem>
              <SelectItem value="department">Department</SelectItem>
              <SelectItem value="score">Performance Score</SelectItem>
              <SelectItem value="date">Review Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        {resultCount !== undefined && (
          <div className="md:col-span-1 flex items-end">
            <div className="w-full px-3 py-2 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs font-medium text-muted-foreground">
                {resultCount} {resultCount === 1 ? 'Result' : 'Results'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {(localSearch || filterStatus !== 'all') && (
        <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground font-medium">Active Filters:</p>
          {localSearch && (
            <div className="inline-flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-full text-xs">
              <span>Search: "{localSearch}"</span>
              <button
                onClick={handleClearSearch}
                className="text-muted-foreground hover:text-foreground ml-1"
              >
                ×
              </button>
            </div>
          )}
          {filterStatus !== 'all' && (
            <div className="inline-flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-full text-xs">
              <span>Status: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}</span>
              <button
                onClick={() => onFilterChange('all')}
                className="text-muted-foreground hover:text-foreground ml-1"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
