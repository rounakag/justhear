import React, { useState } from 'react';
import type { SlotFilters as SlotFiltersType, Listener } from '@/types/admin.types';

interface SlotFiltersProps {
  filters: SlotFiltersType;
  listeners: Listener[];
  onFiltersChange: (filters: Partial<SlotFiltersType>) => void;
  className?: string;
}

export const SlotFilters: React.FC<SlotFiltersProps> = ({
  filters,
  listeners,
  onFiltersChange,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const daysOfWeekOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  const handleFilterChange = (key: keyof SlotFiltersType, value: any) => {
    onFiltersChange({ [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: undefined,
      listenerId: undefined,
      isAvailable: undefined,
      isBooked: undefined,
      dayOfWeek: undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors"
              onClick={clearFilters}
            >
              Clear All
            </button>
          )}
          <button
            className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            filters.isAvailable === true
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
          }`}
          onClick={() => handleFilterChange('isAvailable', filters.isAvailable === true ? undefined : true)}
        >
          Available
        </button>
        <button
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            filters.isBooked === true
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
          }`}
          onClick={() => handleFilterChange('isBooked', filters.isBooked === true ? undefined : true)}
        >
          Booked
        </button>
        <button
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            filters.isAvailable === false
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
          }`}
          onClick={() => handleFilterChange('isAvailable', filters.isAvailable === false ? undefined : false)}
        >
          Unavailable
        </button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  start: e.target.value || undefined,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  end: e.target.value || undefined,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Listener Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Listener
            </label>
            <select
              value={filters.listenerId || ''}
              onChange={(e) => handleFilterChange('listenerId', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Listeners</option>
              {listeners.map((listener) => (
                <option key={listener.id} value={listener.id}>
                  {listener.name || listener.username}
                </option>
              ))}
            </select>
          </div>

          {/* Day of Week Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Day of Week
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {daysOfWeekOptions.map((day) => (
                <label key={day.value} className="flex items-center">
                  <input
                    type="radio"
                    name="dayOfWeek"
                    value={day.value}
                    checked={filters.dayOfWeek === day.value}
                    onChange={(e) => handleFilterChange('dayOfWeek', parseInt(e.target.value))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{day.label}</span>
                </label>
              ))}
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dayOfWeek"
                  value=""
                  checked={filters.dayOfWeek === undefined}
                  onChange={() => handleFilterChange('dayOfWeek', undefined)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">All Days</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.dateRange?.start && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                From: {new Date(filters.dateRange.start).toLocaleDateString()}
              </span>
            )}
            {filters.dateRange?.end && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                To: {new Date(filters.dateRange.end).toLocaleDateString()}
              </span>
            )}
            {filters.listenerId && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Listener: {listeners.find(l => l.id === filters.listenerId)?.name || listeners.find(l => l.id === filters.listenerId)?.username}
              </span>
            )}

            {filters.isAvailable === true && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Available
              </span>
            )}
            {filters.isAvailable === false && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                Unavailable
              </span>
            )}
            {filters.isBooked === true && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                Booked
              </span>
            )}
            {filters.dayOfWeek !== undefined && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                {daysOfWeekOptions[filters.dayOfWeek]?.label}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
