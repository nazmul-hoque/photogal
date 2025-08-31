/**
 * Location service for handling photo locations and Google Maps integration
 */

// Mock coordinates for demo purposes - replace with real geocoding
const mockLocationCoordinates = {
  'Malibu Beach': { lat: 34.0259, lng: -118.7798 },
  'Central Park': { lat: 40.7829, lng: -73.9654 },
  'Downtown Restaurant': { lat: 34.0522, lng: -118.2437 },
  'Yosemite National Park': { lat: 37.8651, lng: -119.5383 },
  'Home': { lat: 34.0522, lng: -118.2437 },
  'New York City': { lat: 40.7128, lng: -74.0060 },
  'Office': { lat: 34.0522, lng: -118.2437 }
};

/**
 * Get coordinates for a location string
 * @param {string} location - Location name/address
 * @returns {Object|null} - Coordinates object with lat/lng or null
 */
export const getLocationCoordinates = async (location) => {
  if (!location) return null;

  // Check mock data first
  if (mockLocationCoordinates[location]) {
    return mockLocationCoordinates[location];
  }

  // TODO: Implement real Google Geocoding API
  // const response = await fetch(
  //   `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
  // );
  // const data = await response.json();
  // if (data.results && data.results[0]) {
  //   const { lat, lng } = data.results[0].geometry.location;
  //   return { lat, lng };
  // }

  return null;
};

/**
 * Get location name from coordinates (reverse geocoding)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string|null} - Location name or null
 */
export const getLocationName = async (lat, lng) => {
  if (!lat || !lng) return null;

  // TODO: Implement real Google Reverse Geocoding API
  // const response = await fetch(
  //   `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
  // );
  // const data = await response.json();
  // if (data.results && data.results[0]) {
  //   return data.results[0].formatted_address;
  // }

  return null;
};

/**
 * Calculate distance between two coordinates in kilometers
 * @param {Object} coord1 - First coordinates {lat, lng}
 * @param {Object} coord2 - Second coordinates {lat, lng}
 * @returns {number} - Distance in kilometers
 */
export const calculateDistance = (coord1, coord2) => {
  if (!coord1 || !coord2) return 0;

  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Group photos by location proximity
 * @param {Array} photos - Array of photo objects
 * @param {number} maxDistance - Maximum distance in km to group photos
 * @returns {Array} - Array of location groups
 */
export const groupPhotosByLocation = (photos, maxDistance = 5) => {
  const groups = [];
  const processed = new Set();

  photos.forEach((photo, index) => {
    if (processed.has(index) || !photo.coordinates) return;

    const group = [photo];
    processed.add(index);

    // Find nearby photos
    photos.forEach((otherPhoto, otherIndex) => {
      if (otherIndex === index || processed.has(otherIndex) || !otherPhoto.coordinates) return;

      const distance = calculateDistance(photo.coordinates, otherPhoto.coordinates);
      if (distance <= maxDistance) {
        group.push(otherPhoto);
        processed.add(otherIndex);
      }
    });

    if (group.length > 0) {
      groups.push({
        center: photo.coordinates,
        location: photo.location,
        photos: group,
        count: group.length
      });
    }
  });

  return groups;
};

/**
 * Get travel timeline from photos
 * @param {Array} photos - Array of photo objects
 * @returns {Array} - Timeline array with location and date info
 */
export const getTravelTimeline = (photos) => {
  return photos
    .filter(photo => photo.coordinates && photo.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(photo => ({
      date: photo.date,
      location: photo.location,
      coordinates: photo.coordinates,
      photo: photo
    }));
};

/**
 * Find photos near a specific location
 * @param {Array} photos - Array of photo objects
 * @param {Object} targetLocation - Target coordinates {lat, lng}
 * @param {number} radius - Search radius in kilometers
 * @returns {Array} - Array of nearby photos
 */
export const findPhotosNearLocation = (photos, targetLocation, radius = 10) => {
  if (!targetLocation || !targetLocation.lat || !targetLocation.lng) return [];

  return photos.filter(photo => {
    if (!photo.coordinates) return false;
    
    const distance = calculateDistance(targetLocation, photo.coordinates);
    return distance <= radius;
  });
};

/**
 * Format location for display
 * @param {string} location - Raw location string
 * @returns {string} - Formatted location
 */
export const formatLocation = (location) => {
  if (!location) return 'Unknown Location';
  
  // Remove common prefixes and format nicely
  return location
    .replace(/^at\s+/i, '')
    .replace(/^in\s+/i, '')
    .replace(/^near\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
};
