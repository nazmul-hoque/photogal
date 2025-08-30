import React from 'react';
import { X, Heart, MapPin, Calendar, Users, Download, Share } from 'lucide-react';
import TagBadge from './TagBadge';

const PhotoModal = ({ photo, isOpen, onClose }) => {
  if (!isOpen || !photo) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = () => {
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `photo-${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Photo from ${photo.location}`,
          text: `Check out this photo with tags: ${photo.tags.join(', ')}`,
          url: photo.url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(photo.url);
      alert('Photo URL copied to clipboard!');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-neutral-500" />
            <span className="text-sm text-neutral-600">{photo.date}</span>
            <MapPin className="w-5 h-5 text-neutral-500 ml-4" />
            <span className="text-sm text-neutral-600">{photo.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Download photo"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Share photo"
            >
              <Share className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Photo Content */}
        <div className="flex">
          {/* Main Photo */}
          <div className="flex-1">
            <img 
              src={photo.mediumUrl || photo.url} 
              alt={`Photo ${photo.id}`}
              className="w-full h-auto max-h-[60vh] object-contain"
            />
          </div>

          {/* Sidebar with details */}
          <div className="w-80 p-6 border-l border-neutral-200 overflow-y-auto">
            {/* Favorite status */}
            <div className="flex items-center mb-4">
              {photo.isFavorite ? (
                <Heart className="w-6 h-6 text-red-500 fill-current mr-2" />
              ) : (
                <Heart className="w-6 h-6 text-neutral-400 mr-2" />
              )}
              <span className="text-sm text-neutral-600">
                {photo.isFavorite ? 'Added to favorites' : 'Not in favorites'}
              </span>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {photo.tags.map((tag, index) => (
                  <TagBadge key={index} tag={tag} />
                ))}
              </div>
            </div>

            {/* People */}
            {photo.people && photo.people.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  People
                </h3>
                <div className="space-y-2">
                  {photo.people.map((person, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {person.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-neutral-700">{person}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location
              </h3>
              <p className="text-sm text-neutral-600">{photo.location}</p>
            </div>

            {/* Photo details */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Details</h3>
              <div className="space-y-2 text-sm text-neutral-600">
                <div className="flex justify-between">
                  <span>Photo ID:</span>
                  <span>{photo.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date taken:</span>
                  <span>{photo.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tags:</span>
                  <span>{photo.tags.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>People:</span>
                  <span>{photo.people ? photo.people.length : 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
