import React, { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import PhotoGrid from '../components/PhotoGrid';
import UploadButton from '../components/UploadButton';
import Notification from '../components/Notification';
import PhotoModal from '../components/PhotoModal';

// Mock data for demonstration
const mockPhotos = [
  {
    id: 1,
    url: '/images/mock/beach-sunset.svg',
    tags: ['beach', 'sunset', 'nature'],
    date: '2024-07-20',
    location: 'Malibu Beach',
    isFavorite: false,
    people: ['John', 'Sarah']
  },
  {
    id: 2,
    url: '/images/mock/golden-retriever.svg',
    tags: ['dog', 'pet', 'golden retriever'],
    date: '2024-07-18',
    location: 'Central Park',
    isFavorite: true,
    people: []
  },
  {
    id: 3,
    url: '/images/mock/restaurant-food.svg',
    tags: ['food', 'dinner', 'restaurant'],
    date: '2024-07-15',
    location: 'Downtown Restaurant',
    isFavorite: false,
    people: ['Mike', 'Lisa']
  },
  {
    id: 4,
    url: '/images/mock/forest-hiking.svg',
    tags: ['nature', 'forest', 'hiking'],
    date: '2024-07-12',
    location: 'Yosemite National Park',
    isFavorite: true,
    people: ['John']
  },
  {
    id: 5,
    url: '/images/mock/family-birthday.svg',
    tags: ['family', 'birthday', 'celebration'],
    date: '2024-07-10',
    location: 'Home',
    isFavorite: false,
    people: ['Sarah', 'Mom', 'Dad']
  },
  {
    id: 6,
    url: '/images/mock/city-architecture.svg',
    tags: ['city', 'architecture', 'urban'],
    date: '2024-07-08',
    location: 'New York City',
    isFavorite: false,
    people: []
  },
  {
    id: 7,
    url: '/images/mock/code-programming.svg',
    tags: ['code', 'work', 'programming'],
    date: '2024-07-05',
    location: 'Office',
    isFavorite: true,
    people: []
  },
  {
    id: 8,
    url: '/images/mock/cute-cat.svg',
    tags: ['cat', 'pet', 'cute'],
    date: '2024-07-03',
    location: 'Home',
    isFavorite: false,
    people: []
  }
];

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('recent');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [photos, setPhotos] = useState(mockPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  
  // Filter states
  const [activeFilters, setActiveFilters] = useState({
    dateRange: null, // { start: Date, end: Date }
    selectedTags: [], // Array of selected tags
    sortBy: 'date', // 'date', 'name', 'location'
    sortOrder: 'desc' // 'asc', 'desc'
  });
  
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Filter photos based on search query and active filters
  const filteredPhotos = useMemo(() => {
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

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleSectionChange = (section) => {
    setSelectedSection(section);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setIsPhotoModalOpen(true);
  };

  const handleClosePhotoModal = () => {
    setIsPhotoModalOpen(false);
    setSelectedPhoto(null);
  };

  const showNotification = (type, title, message) => {
    setNotification({
      isVisible: true,
      type,
      title,
      message
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const handleUploadComplete = (photoObject) => {
    console.log('New photo uploaded:', photoObject);
    
    // Add the new photo to the beginning of the photos array
    setPhotos(prevPhotos => [photoObject, ...prevPhotos]);
    
    // Switch to recent section to show the newly uploaded photo
    setSelectedSection('recent');
    
    // Show success notification
    showNotification(
      'success',
      'Photo Uploaded Successfully!',
      `"${photoObject.originalFilename}" was analyzed and added with ${photoObject.tags.length} AI-detected tags.`
    );
  };

  const handleUploadError = (error, filename) => {
    console.error('Upload error:', error);
    showNotification(
      'error',
      'Upload Failed',
      `Failed to upload "${filename}": ${error.message}`
    );
  };

  const handleFilterClick = () => {
    // Toggle sort order or show sort options
    setActiveFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleDateClick = () => {
    // Create date filter options - last week, month, year, or custom range
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    setActiveFilters(prev => ({
      ...prev,
      dateRange: prev.dateRange ? null : { start: lastWeek, end: now }
    }));
  };

  const handleTagClick = () => {
    // Get all unique tags from photos
    const allTags = [...new Set(photos.flatMap(photo => photo.tags))];
    
    // For now, toggle the first common tag as an example
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
  };

  const clearAllFilters = () => {
    setActiveFilters({
      dateRange: null,
      selectedTags: [],
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar overlay */}
      <Sidebar
        selectedSection={selectedSection}
        onSectionChange={handleSectionChange}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={handleMobileMenuClose}
      />

      {/* Fixed Desktop Sidebar */}
      <div className="hidden lg:block fixed top-0 left-0 w-64 h-full z-40">
        <div className="bg-white border-r border-neutral-200 h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-neutral-900 mb-8">PhotoGal</h1>
            <nav className="space-y-2">
              {[
                { id: 'recent', label: 'Recently Added', icon: 'Clock', count: filteredPhotos.length },
                { id: 'favorites', label: 'Favorites', icon: 'Heart', count: photos.filter(p => p.isFavorite).length },
                { id: 'people', label: 'People', icon: 'Users', count: photos.filter(p => p.people.length > 0).length },
                { id: 'places', label: 'Places', icon: 'MapPin', count: [...new Set(photos.map(p => p.location))].length },
                { id: 'albums', label: 'Auto Albums', icon: 'Album', count: 4 }
              ].map((section) => (
                <div
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`sidebar-item ${selectedSection === section.id ? 'active' : ''}`}
                >
                  <span className="w-5 h-5 mr-3">
                    {section.icon === 'Clock' && '🕐'}
                    {section.icon === 'Heart' && '❤️'}
                    {section.icon === 'Users' && '👥'}
                    {section.icon === 'MapPin' && '📍'}
                    {section.icon === 'Album' && '📚'}
                  </span>
                  <span className="flex-1">{section.label}</span>
                  <span className="text-sm bg-neutral-100 px-2 py-1 rounded-full">
                    {section.count}
                  </span>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Fixed Top Header Bar - spans full width at top of page */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 px-4 py-4 z-50 lg:left-64">
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            onClick={handleMobileMenuToggle}
            className="lg:hidden p-2 text-neutral-500 hover:text-neutral-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search Bar Component */}
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onFilterClick={handleFilterClick}
            onDateClick={handleDateClick}
            onTagClick={handleTagClick}
            activeFilters={activeFilters}
            onClearFilters={clearAllFilters}
            className="flex-1"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="lg:left-64 lg:right-0 lg:absolute lg:top-16">
        {/* Photo Gallery */}
        <main className="p-6">
          {/* Results indicator - only show when filters are active */}
          {(activeFilters.selectedTags.length > 0 || activeFilters.dateRange || searchQuery) && (
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm text-neutral-600">
                Showing {filteredPhotos.length} of {photos.length} photos
                <span className="ml-2 text-primary-600">• Filtered</span>
              </div>
              <button
                onClick={clearAllFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >image.png
                Clear filters
              </button>
            </div>
          )}
          
          <PhotoGrid
            photos={filteredPhotos}
            selectedSection={selectedSection}
            searchQuery={searchQuery}
            onPhotoClick={handlePhotoClick}
          />
        </main>
      </div>

      {/* Upload Button */}
      <UploadButton 
        onUploadComplete={handleUploadComplete}
        onError={handleUploadError}
      />

      {/* Notification */}
      <Notification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      {/* Photo Modal */}
      <PhotoModal
        photo={selectedPhoto}
        isOpen={isPhotoModalOpen}
        onClose={handleClosePhotoModal}
      />
    </div>
  );
};

export default Home;
