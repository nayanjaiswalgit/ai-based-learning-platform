'use client';

import * as React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export interface FilterOption {
  id: string;
  label: string;
  type: 'select' | 'multi-select';
  options: { value: string; label: string }[];
}

export interface SearchFilterProps {
  placeholder?: string;
  filters?: FilterOption[];
  onSearchChange?: (value: string) => void;
  onFiltersChange?: (filters: Record<string, string | string[]>) => void;
  className?: string;
}

export function SearchFilter({
  placeholder = 'Search...',
  filters = [],
  onSearchChange,
  onFiltersChange,
  className,
}: SearchFilterProps) {
  const [searchValue, setSearchValue] = React.useState('');
  const [activeFilters, setActiveFilters] = React.useState<
    Record<string, string | string[]>
  >({});

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange?.(value);
  };

  const handleFilterChange = (filterId: string, value: string | string[]) => {
    const newFilters = { ...activeFilters, [filterId]: value };
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const removeFilter = (filterId: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[filterId];
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchValue('');
    onSearchChange?.('');
    onFiltersChange?.({});
  };

  const hasActiveFilters =
    Object.keys(activeFilters).length > 0 || searchValue.length > 0;

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={placeholder}
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>

        {/* Filter Button */}
        {filters.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {Object.keys(activeFilters).length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5">
                    {Object.keys(activeFilters).length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-auto px-2 py-1 text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                {filters.map((filter) => (
                  <div key={filter.id} className="space-y-2">
                    <label className="text-sm font-medium">
                      {filter.label}
                    </label>
                    <Select
                      value={activeFilters[filter.id] as string}
                      onValueChange={(value) =>
                        handleFilterChange(filter.id, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearAllFilters}
            title="Clear all filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([filterId, value]) => {
            const filter = filters.find((f) => f.id === filterId);
            if (!filter) return null;

            const displayValue = Array.isArray(value)
              ? value.join(', ')
              : filter.options.find((opt) => opt.value === value)?.label ||
                value;

            return (
              <Badge
                key={filterId}
                variant="secondary"
                className="gap-1 pr-1"
              >
                <span className="text-xs">
                  {filter.label}: {displayValue}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeFilter(filterId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
