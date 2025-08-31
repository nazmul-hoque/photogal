import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, MapPin, Calendar, Users, Download, Share, Globe } from 'lucide-react';
import TagBadge from './TagBadge';
import GoogleMap from './ui/GoogleMap';
import { getLocationCoordinates } from '../services/locationService';

const PhotoModal = ({ photo, isOpen, onClose }) => {
  const [locationData, setLocationData] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const panelRef = useRef(null);
  const touchStartYRef = useRef(null);
  const touchDeltaYRef = useRef(0);

  const handlePanelTouchStart = (e) => {
    touchStartYRef.current = e.touches && e.touches[0] && e.touches[0].clientY;
    touchDeltaYRef.current = 0;
    if (panelRef.current) panelRef.current.style.transition = 'none';
  };

  const handlePanelTouchMove = (e) => {
    if (touchStartYRef.current == null) return;
    const currentY = e.touches && e.touches[0] && e.touches[0].clientY;
    const delta = Math.max(0, currentY - touchStartYRef.current);
    touchDeltaYRef.current = delta;
    if (panelRef.current) {
      panelRef.current.style.transform = `translateY(${delta}px)`;
      panelRef.current.style.opacity = `${Math.max(0, 1 - delta / 300)}`;
    }
  };

  const handlePanelTouchEnd = () => {
    const delta = touchDeltaYRef.current || 0;
    if (panelRef.current) panelRef.current.style.transition = '';
    // if swiped down far enough, close
    if (delta > 80) {
      setShowMap(false);
    }
    // reset transform
    if (panelRef.current) {
      panelRef.current.style.transform = '';
      panelRef.current.style.opacity = '';
    }
    touchStartYRef.current = null;
    touchDeltaYRef.current = 0;
  };

  useEffect(() => {
    if (photo && photo.location) {
      getLocationCoordinates(photo.location).then(coords => {
        setLocationData(coords);
      });
    }
  }, [photo]);

  if (!isOpen || !photo) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = () => {
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
      navigator.clipboard.writeText(photo.url);
      alert('Photo URL copied to clipboard!');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative">
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
        <div className="flex flex-col" style={{ paddingBottom: showMap ? 220 : undefined }}>
          <div className="flex">
            <div className="flex-1">
              <img
                src={photo.mediumUrl || photo.url}
                alt={photo.originalFilename || `Image ${photo.id}`}
                className="w-full h-auto max-h-[50vh] object-contain"
              />
            </div>

            {/* Sidebar with details */}
            <div className="w-80 p-6 border-l border-neutral-200 overflow-y-auto">
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

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {photo.tags.map((tag, index) => (
                    <TagBadge key={index} tag={tag} />
                  ))}
                </div>
              </div>

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

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location
                </h3>
                <p className="text-sm text-neutral-600 mb-3">{photo.location}</p>

                {locationData && (
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    {showMap ? 'Hide Map' : 'Show Map'}
                  </button>
                )}
              </div>

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

          {/* bottom-anchored map panel (absolute) */}
          {locationData && (
            <div
              ref={panelRef}
              onTouchStart={handlePanelTouchStart}
              onTouchMove={handlePanelTouchMove}
              onTouchEnd={handlePanelTouchEnd}
              className={`absolute left-0 right-0 bottom-0 border-t border-neutral-200 bg-white p-6 transform transition-transform duration-300 ${showMap ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'} shadow-lg`}
              style={{ height: 200 }}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                  Photo Location
                </h3>
                <p className="text-sm text-neutral-600">This photo was taken at {photo.location}</p>
              </div>
              <GoogleMap
                location={{ name: photo.location, coordinates: locationData }}
                height="140px"
                className="rounded-lg overflow-hidden"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
