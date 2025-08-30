import React from 'react';
import { Search, Filter, Calendar, Tag } from 'lucide-react';

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  onFilterClick, 
  onDateClick, 
  onTagClick,
  activeFilters = {},
  onClearFilters,
  className = '' 
}) => {
  const hasActiveFilters = activeFilters.selectedTags?.length > 0 || 
                          activeFilters.dateRange !== null;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search photos by tags, date, or location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        
        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center mt-2 space-x-2">
            {activeFilters.selectedTags?.map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700">
                #{tag}
              </span>
            ))}
            {activeFilters.dateRange && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary-100 text-secondary-700">
                Last 7 days
              </span>
            )}
            <button
              onClick={onClearFilters}
              className="text-xs text-neutral-500 hover:text-neutral-700"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filter buttons */}
      <div className="hidden md:flex items-center space-x-2">
        <button 
          onClick={onFilterClick}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            activeFilters.sortOrder === 'asc' 
              ? 'bg-primary-100 text-primary-700' 
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Sort {activeFilters.sortOrder === 'asc' ? '↑' : '↓'}
        </button>
        <button 
          onClick={onDateClick}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            activeFilters.dateRange 
              ? 'bg-secondary-100 text-secondary-700' 
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Date
          {activeFilters.dateRange && <span className="ml-1 w-2 h-2 bg-secondary-500 rounded-full"></span>}
        </button>
        <button 
          onClick={onTagClick}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            activeFilters.selectedTags?.length > 0
              ? 'bg-accent-100 text-accent-700' 
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Tag className="w-4 h-4 mr-2" />
          Tags
          {activeFilters.selectedTags?.length > 0 && (
            <span className="ml-1 px-1 text-xs bg-accent-500 text-white rounded-full min-w-[16px] h-4 flex items-center justify-center">
              {activeFilters.selectedTags.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
