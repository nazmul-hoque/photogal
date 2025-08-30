import { useState, useCallback } from 'react';

export const useFilters = () => {
  const [activeFilters, setActiveFilters] = useState({
    dateRange: null,
    selectedTags: [],
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const handleFilterClick = useCallback(() => {
    setActiveFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  }, []);

  const handleDateClick = useCallback(() => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    setActiveFilters(prev => ({
      ...prev,
      dateRange: prev.dateRange ? null : { start: lastWeek, end: now }
    }));
  }, []);

  const handleTagClick = useCallback((photos) => {
    const allTags = [...new Set(photos.flatMap(photo => photo.tags))];
    const commonTags = ['nature', 'pet', 'food', 'family'];
    const tagToToggle = commonTags.find(tag => allTags.includes(tag)) || allTags[0];
    
    if (tagToToggle) {
      setActiveFilters(prev => ({
        ...prev,
        selectedTags: prev.selectedTags.includes(tagToToggle)
          ? prev.selectedTags.filter(tag => tag !== tagToToggle)
          : [...prev.selectedTags, tagToToggle]
      }));
    }
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({
      dateRange: null,
      selectedTags: [],
      sortBy: 'date',
      sortOrder: 'desc'
    });
  }, []);

  return {
    activeFilters,
    handleFilterClick,
    handleDateClick,
    handleTagClick,
    clearAllFilters
  };
};
