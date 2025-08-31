import React, { useState, useEffect } from 'react';
import { MapPin, Camera, Search, Filter } from 'lucide-react';
import GoogleMap from './ui/GoogleMap';
import { groupPhotosByLocation, findPhotosNearLocation, formatLocation } from '../services/locationService';

const LocationDiscovery = ({ photos, className = '' }) => {
  const [locationGroups, setLocationGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRadius, setFilterRadius] = useState(5);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  useEffect(() => {
    if (photos && photos.length > 0) {
      const groups = groupPhotosByLocation(photos, filterRadius);
      setLocationGroups(groups);
      if (groups.length > 0) {
        setSelectedGroup(groups[0]);
      }
    } else {
      setLocationGroups([]);
      setSelectedGroup(null);
    }
  }, [photos, filterRadius]);

  const filteredGroups = locationGroups.filter(group => 
    group.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  const handleMapClick = (coordinates) => {
    // Find photos near the clicked location
    const nearbyPhotos = findPhotosNearLocation(photos, coordinates, filterRadius);
    if (nearbyPhotos.length > 0) {
      // Create a temporary group for the clicked location
      const tempGroup = {
        center: coordinates,
        location: 'Selected Area',
        photos: nearbyPhotos,
        count: nearbyPhotos.length
      };
      setSelectedGroup(tempGroup);
    }
  };

  if (!photos || photos.length === 0) {
    return (
      <div className={`bg-white rounded-2xl shadow-soft p-8 text-center ${className}`}>
        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-800 mb-2">No Location Data</h3>
        <p className="text-neutral-600">
          Photos with location information will appear here grouped by proximity.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-soft overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Location Discovery</h2>
              <p className="text-sm text-neutral-600">
                {locationGroups.length} location{locationGroups.length !== 1 ? 's' : ''} • {photos.length} photos
              </p>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              Map
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select
              value={filterRadius}
              onChange={(e) => setFilterRadius(Number(e.target.value))}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            >
              <option value={1}>1 km radius</option>
              <option value={5}>5 km radius</option>
              <option value={10}>10 km radius</option>
              <option value={25}>25 km radius</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex">
        {/* Location Groups Sidebar */}
        <div className={`w-80 border-r border-neutral-200 ${viewMode === 'grid' ? 'block' : 'hidden lg:block'}`}>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {filteredGroups.map((group, index) => (
              <div
                key={index}
                onClick={() => handleGroupSelect(group)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedGroup?.location === group.location
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-neutral-50 border border-transparent'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Location Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary-100 to-accent-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-secondary-600" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 mb-1 truncate">
                      {formatLocation(group.location)}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-2">
                      {group.count} photo{group.count !== 1 ? 's' : ''}
                    </p>
                    
                    {/* Photo Previews */}
                    <div className="flex space-x-1">
                      {group.photos.slice(0, 4).map((photo, photoIndex) => (
                        <img
                          key={photoIndex}
                          src={photo.url || '/images/mock/beach-sunset.jpg'}
                          alt={photo.originalFilename || 'Photo'}
                          className="w-8 h-8 rounded object-cover border-2 border-white shadow-sm"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ci8+CjxwYXRoIGQ9Ik0yMCAyNUMxNy4yMzg2IDI1IDE1IDIyLjc2MTQgMTUgMjBDMTUgMTcuMjM4NiAxNy4yMzg2IDE1IDIwIDE1QzIyLjc2MTQgMTUgMjUgMTcuMjM4NiAyNSAyMEMyNSAyMi43NjE0IDIyLjc2MTQgMjUgMjAgMjVaIiBmaWxsPSIjOTNBM0I4Ci8+Cjwvc3ZnPgo=';
                          }}
                        />
                      ))}
                      {group.photos.length > 4 && (
                        <div className="w-8 h-8 bg-neutral-100 rounded flex items-center justify-center border-2 border-white shadow-sm">
                          <span className="text-xs font-medium text-neutral-600">
                            +{group.photos.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map View */}
        <div className={`flex-1 ${viewMode === 'map' ? 'block' : 'hidden lg:block'}`}>
          <div className="p-4">
            {/* Always render GoogleMap to ensure ref attachment, but control visibility via parent */}
            <GoogleMap
              photos={selectedGroup ? selectedGroup.photos : []}
              height="400px"
              onMapClick={handleMapClick}
            />
          </div>
        </div>
      </div>

      {/* Selected Group Details */}
      {selectedGroup && (
        <div className="p-6 bg-gradient-to-r from-neutral-50 to-secondary-50 border-t border-neutral-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              {formatLocation(selectedGroup.location)}
            </h3>
            <p className="text-sm text-neutral-600">
              {selectedGroup.count} photo{selectedGroup.count !== 1 ? 's' : ''} in this area
            </p>
          </div>
          
          {/* Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {selectedGroup.photos.map((photo, index) => (
              <div key={index} className="group relative">
                <img
                  src={photo.url || '/images/mock/beach-sunset.jpg'}
                  alt={photo.originalFilename || 'Photo'}
                  className="w-full h-20 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow duration-200"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ci8+CjxwYXRoIGQ9Ik0yMCAyNUMxNy4yMzg2IDI1IDE1IDIyLjc2MTQgMTUgMjBDMTUgMTcuMjM4NiAxNy4yMzg2IDE1IDIwIDE1QzIyLjc2MTQgMTUgMjUgMTcuMjM4NiAyNSAyMEMyNSAyMi43NjE0IDIyLjc2MTQgMjUgMjAgMjVaIiBmaWxsPSIjOTNBM0I4Ci8+Cjwvc3ZnPgo=';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDiscovery;
