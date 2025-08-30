import { useState, useCallback } from 'react';

export const useSearch = (initialQuery = '') => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);
  
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);
  
  return {
    searchQuery,
    handleSearchChange,
    clearSearch
  };
};
