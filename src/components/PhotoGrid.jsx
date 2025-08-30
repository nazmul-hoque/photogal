import React from 'react';
import { Heart, MapPin, Calendar } from 'lucide-react';
import TagBadge from './TagBadge';

const PhotoCard = ({ photo, onClick }) => (
  <div 
    className="photo-card group relative bg-white rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-500 overflow-hidden cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1" 
    onClick={() => onClick && onClick(photo)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick && onClick(photo);
      }
    }}
    role="button"
    tabIndex={0}
    aria-label={`Photo: ${photo.tags.join(', ')} taken at ${photo.location}`}
  >
    {/* Image Container */}
    <div className="relative overflow-hidden">
      <img 
        src={photo.thumbnailUrl || photo.url} 
        alt={`${photo.id}`}
        className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Favorite Badge */}
      {photo.isFavorite && (
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg">
          <Heart className="w-4 h-4 text-red-500 fill-current" />
        </div>
      )}
      
      {/* Quick Actions Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    {/* Content */}
    <div className="p-4">
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {photo.tags.slice(0, 2).map((tag, index) => (
          <TagBadge key={index} tag={tag} />
        ))}
        {photo.tags.length > 2 && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
            +{photo.tags.length - 2}
          </span>
        )}
      </div>
      
      {/* Meta Information */}
      <div className="flex items-center justify-between text-sm text-neutral-600">
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <span className="font-medium">{photo.date}</span>
        </div>
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-neutral-400" />
          <span className="font-medium truncate max-w-[120px]" title={photo.location}>
            {photo.location}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const PhotoGrid = ({ 
  photos, 
  selectedSection, 
  searchQuery, 
  onPhotoClick, 
  className = '' 
}) => {
  const getSectionLabel = (sectionId) => {
    const sectionLabels = {
      recent: 'Recently Added',
      favorites: 'Favorites',
      people: 'People',
      places: 'Places',
      albums: 'Auto Albums'
    };
    return sectionLabels[sectionId] || 'Photos';
  };

  if (photos.length === 0) {
    return (
      <div className={`${className}`} role="region" aria-label={`${getSectionLabel(selectedSection)} section`}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            {getSectionLabel(selectedSection)}
          </h2>
          <p className="text-neutral-600">
            No photos found{searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>
        
        <div className="text-center py-16">
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-neutral-800 mb-2">No photos found</h3>
          <p className="text-neutral-500 mb-6 max-w-md mx-auto">
            {searchQuery 
              ? `We couldn't find any photos matching "${searchQuery}". Try adjusting your search terms or filters.`
              : "Get started by uploading your first photo or adjusting your current filters."
            }
          </p>
          <div className="flex items-center justify-center space-x-3">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`} role="region" aria-label={`${getSectionLabel(selectedSection)} section`}>
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              {getSectionLabel(selectedSection)}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-neutral-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {photos.length} {photos.length === 1 ? 'photo' : 'photos'} found
              </span>
              {searchQuery && (
                <>
                  <span className="text-neutral-300">•</span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    "{searchQuery}"
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        role="grid"
        aria-label={`${getSectionLabel(selectedSection)} photos`}
      >
        {photos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} onClick={onPhotoClick} />
        ))}
      </div>
    </div>
  );
};

export default PhotoGrid;
