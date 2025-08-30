import React from 'react';
import { Search, Filter, Calendar, Tag } from 'lucide-react';
import Button from './ui/Button';

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
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 transition-colors duration-200 group-focus-within:text-primary-500" />
          <input
            type="text"
            placeholder="Search photos by tags, date, or location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-neutral-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-neutral-300"
          />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
        </div>
        
        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center mt-3 space-x-2 animate-in slide-in-from-top-2 duration-300">
            {activeFilters.selectedTags?.map((tag, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 border border-primary-200 shadow-sm">
                <Tag className="w-3 h-3 mr-1.5" />
                {tag}
              </span>
            ))}
            {activeFilters.dateRange && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700 border border-secondary-200 shadow-sm">
                <Calendar className="w-3 h-3 mr-1.5" />
                Last 7 days
              </span>
            )}
            <button
              onClick={onClearFilters}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 transition-colors duration-200"
            >
              <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filter buttons */}
      <div className="hidden md:flex items-center space-x-2">
        <Button 
          variant={activeFilters.sortOrder === 'asc' ? 'primary' : 'ghost'}
          onClick={onFilterClick}
          className="flex items-center"
        >
          <Filter className="w-4 h-4 mr-2" />
          Sort {activeFilters.sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
        <Button 
          variant={activeFilters.dateRange ? 'secondary' : 'ghost'}
          onClick={onDateClick}
          className="flex items-center"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Date
          {activeFilters.dateRange && <span className="ml-1 w-2 h-2 bg-secondary-500 rounded-full"></span>}
        </Button>
        <Button 
          variant={activeFilters.selectedTags?.length > 0 ? 'accent' : 'ghost'}
          onClick={onTagClick}
          className="flex items-center"
        >
          <Tag className="w-4 h-4 mr-2" />
          Tags
          {activeFilters.selectedTags?.length > 0 && (
            <span className="ml-1 px-1 text-xs bg-accent-500 text-white rounded-full min-w-[16px] h-4 flex items-center justify-center">
              {activeFilters.selectedTags.length}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
