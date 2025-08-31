import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Camera, ChevronRight } from 'lucide-react';
import GoogleMap from './ui/GoogleMap';
import { getTravelTimeline, formatLocation } from '../services/locationService';

const TravelTimeline = ({ photos, className = '', selectedPhoto: controlledSelectedPhoto = null, onPhotoSelect = null, isPhotoModalOpen = false }) => {
  const [timeline, setTimeline] = useState([]);
  const [selectedPhotoInternal, setSelectedPhotoInternal] = useState(null);
  const selectedPhoto = controlledSelectedPhoto || selectedPhotoInternal;
  const listContainerRef = useRef(null);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' or 'map'

  useEffect(() => {
    if (photos && photos.length > 0) {
      const timelineData = getTravelTimeline(photos);
      setTimeline(timelineData);
      if (timelineData.length > 0) {
        const firstPhoto = timelineData[0]?.photo || null;
        if (onPhotoSelect) onPhotoSelect(firstPhoto);
        else setSelectedPhotoInternal(firstPhoto);
      }
    } else {
      setTimeline([]);
      if (onPhotoSelect) onPhotoSelect(null);
      else setSelectedPhotoInternal(null);
    }
  }, [photos]);

  // Auto-scroll the selected photo into view inside the timeline list
  useEffect(() => {
    if (!selectedPhoto || !listContainerRef.current) return;

    const id = selectedPhoto.id || selectedPhoto._id || null;
    if (!id) return;

    const node = listContainerRef.current.querySelector(`[data-photo-id="${id}"]`);
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedPhoto]);

  if (!timeline || timeline.length === 0) {
    return (
      <div className={`bg-white rounded-2xl shadow-soft p-8 text-center ${className}`}>
        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-800 mb-2">No Travel Data</h3>
        <p className="text-neutral-600">
          Photos with location information will appear here in chronological order.
        </p>
      </div>
    );
  }

  const handlePhotoSelect = (photo) => {
    if (onPhotoSelect) onPhotoSelect(photo);
    else setSelectedPhotoInternal(photo);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`bg-white rounded-2xl shadow-soft overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Travel Timeline</h2>
              <p className="text-sm text-neutral-600">
                {timeline.length} location{timeline.length !== 1 ? 's' : ''} • {formatDate(timeline[0]?.date)} - {formatDate(timeline[timeline.length - 1]?.date)}
              </p>
            </div>
          </div>
          
          {/* Tab Toggle */}
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'timeline'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'map'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              Map View
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex">
        {/* Timeline Sidebar */}
        <div className={`w-80 border-r border-neutral-200 ${activeTab === 'timeline' ? 'block' : 'hidden lg:block'}`}>
          <div ref={listContainerRef} className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {timeline.map((item, index) => (
              <div
                key={index}
                data-photo-id={(item.photo && (item.photo.id || item.photo._id)) || `${index}`}
                onClick={() => handlePhotoSelect(item.photo)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedPhoto?.id === item.photo.id
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-neutral-50 border border-transparent'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Date Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {formatLocation(item.location)}
                    </p>
                    <p className="text-xs text-neutral-500 mb-2">
                      {formatDate(item.date)}
                    </p>
                    
                    {/* Photo Preview */}
                    <div className="flex items-center space-x-2">
                      <img
                        src={item.photo.url || '/images/mock/beach-sunset.jpg'}
                        alt={item.photo.originalFilename || 'Photo'}
                        className="w-8 h-8 rounded object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ci8+CjxwYXRoIGQ9Ik0yMCAyNUMxNy4yMzg2IDI1IDE1IDIyLjc2MTQgMTUgMjBDMTUgMTcuMjM4NiAxNy4yMzg2IDE1IDIwIDE1QzIyLjc2MTQgMTUgMjUgMTcuMjM4NiAyNSAyMEMyNSAyMi43NjE0IDIyLjc2MTQgMjUgMjAgMjVaIiBmaWxsPSIjOTNBM0I4Ci8+Cjwvc3ZnPgo=';
                        }}
                      />
                      <span className="text-xs text-neutral-600">
                        {item.photo.tags ? item.photo.tags.slice(0, 2).join(', ') : 'No tags'}
                        {item.photo.tags && item.photo.tags.length > 2 && '...'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map View */}
        <div className={`flex-1 ${activeTab === 'map' ? 'block' : 'hidden lg:block'}`}>
          <div className="p-4">
            <GoogleMap
              photos={timeline.map(item => item.photo)}
              selectedPhoto={selectedPhoto}
              height="400px"
              onMarkerClick={handlePhotoSelect}
            />
          </div>
        </div>
      </div>

      {/* Selected Photo Details - dim/blur when main PhotoModal is open */}
      {selectedPhoto && (
        <div
          className={`p-6 bg-gradient-to-r from-neutral-50 to-primary-50 border-t border-neutral-200 transition-all ${
            isPhotoModalOpen ? 'opacity-40 blur-sm pointer-events-none' : ''
          }`}
          aria-hidden={isPhotoModalOpen}
        >
          <div className="flex items-center space-x-4">
            <img
              src={selectedPhoto.url || '/images/mock/beach-sunset.jpg'}
              alt={selectedPhoto.originalFilename || 'Selected Photo'}
              className="w-20 h-20 rounded-lg object-cover shadow-sm"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ci8+CjxwYXRoIGQ9Ik0yMCAyNUMxNy4yMzg2IDI1IDE1IDIyLjc2MTQgMTUgMjBDMTUgMTcuMjM4NiAxNy4yMzg2IDE1IDIwIDE1QzIyLjc2MTQgMTUgMjUgMTcuMjM4NiAyNSAyMEMyNSAyMi43NjE0IDIyLjc2MTQgMjUgMjAgMjVaIiBmaWxsPSIjOTNBM0I4Ci8+Cjwvc3ZnPgo=';
              }}
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                {selectedPhoto.originalFilename || 'Photo'}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-neutral-600">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {formatLocation(selectedPhoto.location)}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(selectedPhoto.date)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedPhoto.tags ? (
                  <>
                    {selectedPhoto.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/80 backdrop-blur-sm border border-white/50"
                      >
                        #{tag}
                      </span>
                    ))}
                    {selectedPhoto.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/80 backdrop-blur-sm border border-white/50">
                        +{selectedPhoto.tags.length - 3}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-neutral-500">No tags available</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelTimeline;
