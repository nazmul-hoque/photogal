import React from 'react';
import { Heart, MapPin } from 'lucide-react';
import TagBadge from './TagBadge';

const PhotoCard = ({ photo, onClick }) => (
  <div className="photo-card group" onClick={() => onClick && onClick(photo)}>
    <div className="relative">
      <img 
        src={photo.thumbnailUrl || photo.url} 
        alt={`${photo.id}`}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      {photo.isFavorite && (
        <Heart className="absolute top-2 right-2 w-5 h-5 text-red-500 fill-current" />
      )}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
    </div>
    <div className="p-3">
      <div className="flex flex-wrap gap-1 mb-2">
        {photo.tags.slice(0, 2).map((tag, index) => (
          <TagBadge key={index} tag={tag} />
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
      <div className={`${className}`}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            {getSectionLabel(selectedSection)}
          </h2>
          <p className="text-neutral-600">
            No photos found{searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>
        
        <div className="text-center py-12">
          <div className="text-neutral-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-neutral-500 text-lg">No photos found</p>
          <p className="text-neutral-400">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          {getSectionLabel(selectedSection)}
        </h2>
        <p className="text-neutral-600">
          {photos.length} {photos.length === 1 ? 'photo' : 'photos'} found
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {photos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} onClick={onPhotoClick} />
        ))}
      </div>
    </div>
  );
};

export default PhotoGrid;
