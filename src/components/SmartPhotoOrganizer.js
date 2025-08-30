import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Upload, 
  Heart, 
  Clock, 
  Users, 
  MapPin, 
  Album,
  X,
  Filter,
  Calendar,
  Tag
} from 'lucide-react';

// Mock data for demonstration
const mockPhotos = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    tags: ['beach', 'sunset', 'nature'],
    date: '2024-07-20',
    location: 'Malibu Beach',
    isFavorite: false,
    people: ['John', 'Sarah']
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=400&h=300&fit=crop',
    tags: ['dog', 'pet', 'golden retriever'],
    date: '2024-07-18',
    location: 'Central Park',
    isFavorite: true,
    people: []
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
    tags: ['food', 'dinner', 'restaurant'],
    date: '2024-07-15',
    location: 'Downtown Restaurant',
    isFavorite: false,
    people: ['Mike', 'Lisa']
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
    tags: ['nature', 'forest', 'hiking'],
    date: '2024-07-12',
    location: 'Yosemite National Park',
    isFavorite: true,
    people: ['John']
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&h=300&fit=crop',
    tags: ['family', 'birthday', 'celebration'],
    date: '2024-07-10',
    location: 'Home',
    isFavorite: false,
    people: ['Sarah', 'Mom', 'Dad']
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
    tags: ['city', 'architecture', 'urban'],
    date: '2024-07-08',
    location: 'New York City',
    isFavorite: false,
    people: []
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=300&fit=crop',
    tags: ['code', 'work', 'programming'],
    date: '2024-07-05',
    location: 'Office',
    isFavorite: true,
    people: []
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
    tags: ['cat', 'pet', 'cute'],
    date: '2024-07-03',
    location: 'Home',
    isFavorite: false,
    people: []
  }
];

const sidebarSections = [
  { id: 'recent', label: 'Recently Added', icon: Clock, count: 8 },
  { id: 'favorites', label: 'Favorites', icon: Heart, count: 3 },
  { id: 'people', label: 'People', icon: Users, count: 5 },
  { id: 'places', label: 'Places', icon: MapPin, count: 6 },
  { id: 'albums', label: 'Auto Albums', icon: Album, count: 4 }
];

const tagColors = {
  beach: 'bg-secondary-100 text-secondary-700',
  sunset: 'bg-primary-100 text-primary-700',
  nature: 'bg-accent-100 text-accent-700',
  dog: 'bg-yellow-100 text-yellow-700',
  pet: 'bg-pink-100 text-pink-700',
  food: 'bg-orange-100 text-orange-700',
  family: 'bg-purple-100 text-purple-700',
  city: 'bg-gray-100 text-gray-700',
  code: 'bg-blue-100 text-blue-700',
  cat: 'bg-indigo-100 text-indigo-700'
};

const SmartPhotoOrganizer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedSection, setSelectedSection] = useState('recent');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter photos based on search query and active filters
  const filteredPhotos = useMemo(() => {
    let filtered = mockPhotos;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(photo => 
        photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        photo.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.people.some(person => person.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by section
    switch (selectedSection) {
      case 'favorites':
        filtered = filtered.filter(photo => photo.isFavorite);
        break;
      case 'recent':
        filtered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
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

    return filtered;
  }, [searchQuery, selectedSection]);

  const PhotoCard = ({ photo }) => (
    <div className="photo-card group">
      <div className="relative">
        <img 
          src={photo.url} 
          alt={`Photo ${photo.id}`}
          className="w-full h-48 object-cover"
        />
        {photo.isFavorite && (
          <Heart className="absolute top-2 right-2 w-5 h-5 text-red-500 fill-current" />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
      </div>
      <div className="p-3">
        <div className="flex flex-wrap gap-1 mb-2">
          {photo.tags.slice(0, 2).map((tag, index) => (
            <span 
              key={index}
              className={`tag-chip ${tagColors[tag] || 'bg-neutral-100 text-neutral-700'}`}
            >
              {tag}
            </span>
          ))}
          {photo.tags.length > 2 && (
            <span className="tag-chip bg-neutral-100 text-neutral-500">
              +{photo.tags.length - 2}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>{photo.date}</span>
          <span className="flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {photo.location}
          </span>
        </div>
      </div>
    </div>
  );

  const Sidebar = ({ className = '' }) => (
    <div className={`bg-white border-r border-neutral-200 ${className}`}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-8">PhotoGal</h1>
        <nav className="space-y-2">
          {sidebarSections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                onClick={() => {
                  setSelectedSection(section.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`sidebar-item ${selectedSection === section.id ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="flex-1">{section.label}</span>
                <span className="text-sm bg-neutral-100 px-2 py-1 rounded-full">
                  {section.count}
                </span>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-64 h-full">
            <Sidebar />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-neutral-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden lg:block w-64 flex-shrink-0" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-neutral-200 px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-neutral-500 hover:text-neutral-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search photos by tags, date, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Filter buttons */}
              <div className="hidden md:flex items-center space-x-2">
                <button className="flex items-center px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
                <button className="flex items-center px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date
                </button>
                <button className="flex items-center px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                  <Tag className="w-4 h-4 mr-2" />
                  Tags
                </button>
              </div>
            </div>
          </header>

          {/* Gallery */}
          <main className="flex-1 overflow-auto p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                {sidebarSections.find(s => s.id === selectedSection)?.label}
              </h2>
              <p className="text-neutral-600">
                {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'} found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredPhotos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} />
              ))}
            </div>

            {filteredPhotos.length === 0 && (
              <div className="text-center py-12">
                <div className="text-neutral-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-neutral-500 text-lg">No photos found</p>
                <p className="text-neutral-400">Try adjusting your search or filters</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Floating Upload Button */}
      <button className="fixed bottom-6 right-6 bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <Upload className="w-6 h-6" />
      </button>
    </div>
  );
};

export default SmartPhotoOrganizer;
