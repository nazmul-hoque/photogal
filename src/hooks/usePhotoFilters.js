import { useMemo } from 'react';

export const usePhotoFilters = (photos, searchQuery, selectedSection, activeFilters) => {
  return useMemo(() => {
    let filtered = photos;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(photo => 
        photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        photo.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.people.some(person => person.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by selected tags
    if (activeFilters.selectedTags.length > 0) {
      filtered = filtered.filter(photo => 
        activeFilters.selectedTags.some(selectedTag => 
          photo.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
        )
      );
    }

    // Filter by date range
    if (activeFilters.dateRange) {
      const { start, end } = activeFilters.dateRange;
      filtered = filtered.filter(photo => {
        const photoDate = new Date(photo.date);
        return photoDate >= start && photoDate <= end;
      });
    }

    // Filter by section
    switch (selectedSection) {
      case 'favorites':
        filtered = filtered.filter(photo => photo.isFavorite);
        break;
      case 'recent':
        // Will be sorted below
        break;
      case 'people':
        filtered = filtered.filter(photo => photo.people.length > 0);
        break;
      case 'places':
        // Group by location, show all for now
        break;
      case 'albums':
        // Show auto-generated albums
        break;
      default:
        break;
    }

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (activeFilters.sortBy) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'name':
          comparison = a.originalFilename?.localeCompare(b.originalFilename || '') || 0;
          break;
        case 'location':
          comparison = a.location.localeCompare(b.location);
          break;
        default:
          comparison = new Date(a.date) - new Date(b.date);
      }
      
      return activeFilters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [searchQuery, selectedSection, photos, activeFilters]);
};
