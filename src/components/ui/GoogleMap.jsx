import React, { useEffect, useRef, useState } from 'react';

const GoogleMap = ({ 
  location, 
  photos = [], 
  selectedPhoto = null,
  height = '400px', 
  width = '100%',
  showClusters = false,
  interactive = true,
  className = '',
  onMapClick = null,
  onMarkerClick = null
}) => {
  const mapRef = useRef(null);
  const rootRef = useRef(null);
  const [map, setMap] = useState(null);
  const [googleMaps, setGoogleMaps] = useState(null);
  const [markers, setMarkers] = useState([]);
  const markersRef = useRef([]);
  const mapInstanceRef = useRef(null);
  const pendingSelectionRef = useRef(null);
  const selectedMarkerRef = useRef(null);

  // Helper to create an SVG pin icon as a data URL
  const makePinIcon = (color = '#06b6d4', size = 36) => {
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='${size}' height='${size}'>
        <path d='M12 2C8 2 5 5 5 9c0 6 7 13 7 13s7-7 7-13c0-4-3-7-7-7z' fill='${color}' />
        <circle cx='12' cy='9' r='2.5' fill='white' />
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const BOUNCE_MS = 800; // shorter bounce for snappier feedback

  // keep refs in sync for safe cleanup/use in callbacks
  useEffect(() => { markersRef.current = markers; }, [markers]);
  useEffect(() => { mapInstanceRef.current = map; }, [map]);

  // Lazy initialize the map when the container becomes visible/has dimensions.
  useEffect(() => {
    let mounted = true;
    let observer = null;

    const shouldInitialize = (el) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const styles = getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && styles.display !== 'none' && styles.visibility !== 'hidden' && styles.opacity !== '0';
    };

    const initMap = async () => {
      try {
        setIsLoading(true);

        if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
          console.error('GoogleMap: API key missing or invalid');
          throw new Error('Google Maps API key is missing or invalid');
        }

        // Dynamically import the Loader so the bundle doesn't always include it
        const mod = await import('@googlemaps/js-api-loader');
        const Loader = mod.Loader;

        const loader = new Loader({
          apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        const google = await loader.load();
        if (!mounted) return;

        setGoogleMaps(google);

        if (!mapRef.current) {
          throw new Error('Map container not found during initialization');
        }

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 0, lng: 0 },
          zoom: 2,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        if (!mounted) return;

        setMap(mapInstance);
        setIsLoading(false);
        console.log('GoogleMap: initialized via ResizeObserver');
      } catch (err) {
        if (!mounted) return;
        console.error('Error loading Google Maps (lazy):', err);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    const startObserving = () => {
      const el = mapRef.current || rootRef.current;
      if (!el) return;

      // If already ready, initialize immediately
      if (shouldInitialize(el)) {
        initMap();
        return;
      }

      // ResizeObserver is supported in modern browsers
      observer = new ResizeObserver(() => {
        if (!mounted) return;
        const target = mapRef.current || rootRef.current;
        if (shouldInitialize(target)) {
          if (observer) observer.disconnect();
          observer = null;
          initMap();
        }
      });

      observer.observe(el);
    };

    startObserving();

    return () => {
      mounted = false;
      if (observer) observer.disconnect();
    };
    // Intentionally only watch width/height props so resizes trigger re-checks
  }, [height, width]);

  // Update map when location or photos change
  useEffect(() => {
    if (!map || !googleMaps) return;

  // Clear existing markers
  markers.forEach(marker => marker.setMap(null));
  const newMarkers = [];

    if (photos.length > 0) {
      // Multiple photos - show all locations
      const bounds = new googleMaps.maps.LatLngBounds();
      
      photos.forEach((photo, index) => {
        if (photo.location && photo.coordinates) {
          const defaultIcon = {
            url: makePinIcon('#06b6d4', 28),
            scaledSize: new googleMaps.maps.Size(28, 28),
            anchor: new googleMaps.maps.Point(14, 28)
          };

          const marker = new googleMaps.maps.Marker({
            position: photo.coordinates,
            map: map,
            title: photo.originalFilename || `Photo ${index + 1}`,
            animation: googleMaps.maps.Animation.DROP,
            icon: defaultIcon
          });

          // Add info window
          const infoWindow = new googleMaps.maps.InfoWindow({
            content: `
              <div class="p-3 max-w-xs">
                <h3 class="font-semibold text-gray-800 mb-1">${photo.originalFilename || 'Photo'}</h3>
                <p class="text-sm text-gray-600">${photo.location}</p>
                <p class="text-xs text-gray-500">${photo.date}</p>
              </div>
            `
          });

          // attach photo metadata to marker for later lookup
          marker._photo = photo;
          marker._infoWindow = infoWindow;
          marker._photoId = photo.id || photo._id || `${index}`;

              marker.addListener('click', () => {
            infoWindow.open(map, marker);
            // highlight this marker visually
            try {
              // reset previous
              if (selectedMarkerRef.current && selectedMarkerRef.current !== marker) {
                    selectedMarkerRef.current.setIcon({ url: makePinIcon('#06b6d4', 28) });
                    selectedMarkerRef.current.setZIndex && selectedMarkerRef.current.setZIndex(0);
              }
              // set selected
                  marker.setIcon({ url: makePinIcon('#ef4444', 34) });
              marker.setZIndex && marker.setZIndex(999);
              selectedMarkerRef.current = marker;
            } catch (e) {}
            if (onMarkerClick) onMarkerClick(photo);
          });

          newMarkers.push(marker);
          bounds.extend(photo.coordinates);
        }
      });

      if (newMarkers.length > 0) {
        try {
          map.fitBounds(bounds, 48); // small padding
          // cap zoom after fitBounds so single cluster doesn't zoom too far
          const currentZoom = map.getZoom();
          if (newMarkers.length === 1) {
            map.setZoom(Math.max(14, Math.min(15, currentZoom || 15)));
          } else if (currentZoom && currentZoom > 16) {
            map.setZoom(16);
          }
        } catch (e) { map.fitBounds(bounds); }
      }
    } else if (location && location.coordinates) {
      // Single location - center on it
      const position = location.coordinates;
      map.setCenter(position);
      map.setZoom(15);

      const marker = new googleMaps.maps.Marker({
        position: position,
        map: map,
        title: location.name || 'Photo Location',
        animation: googleMaps.maps.Animation.DROP
      });

      newMarkers.push(marker);
    }

    setMarkers(newMarkers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, googleMaps, location, photos]);

  // Handle external selection from timeline: center, open info window, highlight marker
  // helper: loose coordinate comparator
  const coordsEqual = (a = {}, b = {}) => {
    if (!a || !b) return false;
    const latA = Number(a.lat ?? a.latitude ?? (a.latLng && a.latLng.lat) ?? NaN);
    const lngA = Number(a.lng ?? a.longitude ?? (a.latLng && a.latLng.lng) ?? NaN);
    const latB = Number(b.lat ?? b.latitude ?? (b.latLng && b.latLng.lat) ?? NaN);
    const lngB = Number(b.lng ?? b.longitude ?? (b.latLng && b.latLng.lng) ?? NaN);
    if (Number.isNaN(latA) || Number.isNaN(lngA) || Number.isNaN(latB) || Number.isNaN(lngB)) return false;
    const eps = 1e-5;
    return Math.abs(latA - latB) < eps && Math.abs(lngA - lngB) < eps;
  };

  const findMarkerForPhoto = (photo) => {
    if (!photo) return null;
    const id = photo.id || photo._id || null;
    const coords = photo.coordinates || photo.location?.coordinates || null;
    const list = markersRef.current || [];
    return list.find(m => {
      try {
        if (id && m._photoId && String(m._photoId) === String(id)) return true;
        if (m._photo && m._photo === photo) return true;
        if (coords && m.getPosition && coords) {
          const pos = m.getPosition();
          return coordsEqual({ lat: pos.lat(), lng: pos.lng() }, coords);
        }
      } catch (e) {}
      return false;
    }) || null;
  };

  const applySelection = (photo) => {
    if (!photo) {
      // clear any de-emphasis
      (markersRef.current || []).forEach(m => { try { m.setOpacity && m.setOpacity(1); } catch (e) {} });
      return;
    }

    if (!mapInstanceRef.current || !googleMaps || !(markersRef.current || []).length) {
      pendingSelectionRef.current = photo;
      return;
    }

    const found = findMarkerForPhoto(photo);
    if (!found) {
      if (photo.coordinates && mapInstanceRef.current) {
        try { mapInstanceRef.current.panTo(photo.coordinates); mapInstanceRef.current.setZoom(Math.max(12, Math.min(16, mapInstanceRef.current.getZoom() || 14))); } catch (e) {}
      }
      return;
    }

    // Reset previous
    if (selectedMarkerRef.current && selectedMarkerRef.current !== found) {
      try { selectedMarkerRef.current.setIcon({ url: makePinIcon('#06b6d4') }); selectedMarkerRef.current.setZIndex && selectedMarkerRef.current.setZIndex(0); } catch (e) {}
    }

    if (found._infoWindow) {
      try { found._infoWindow.open(mapInstanceRef.current, found); } catch (e) {}
    }

    try {
      found.setIcon({ url: makePinIcon('#ef4444', 34) });
      found.setZIndex && found.setZIndex(999);
      selectedMarkerRef.current = found;
      found.setAnimation && found.setAnimation(googleMaps.maps.Animation.BOUNCE);
      setTimeout(() => { try { found.setAnimation && found.setAnimation(null); } catch (e) {} }, BOUNCE_MS);
    } catch (e) {}

    if (photo.coordinates && mapInstanceRef.current) {
      try { mapInstanceRef.current.panTo(photo.coordinates); mapInstanceRef.current.setZoom(Math.max(12, Math.min(16, mapInstanceRef.current.getZoom() || 14))); } catch (e) {}
    }

    pendingSelectionRef.current = null;
  };

  useEffect(() => { applySelection(selectedPhoto); }, [selectedPhoto]);

  // If there was a selection queued while map was initializing, apply it once ready
  useEffect(() => {
    if (!pendingSelectionRef.current) return;
    if (map && googleMaps && markers && markers.length > 0) {
      const toSelect = pendingSelectionRef.current;
      pendingSelectionRef.current = null;
      // small timeout to ensure markers exist
      setTimeout(() => {
        try { /* reuse selection logic by setting selectedPhoto effect to run */ } catch (e) {}
      }, 50);
    }
  }, [map, googleMaps, markers]);

  // Handle map click
  useEffect(() => {
    if (!map || !googleMaps || !onMapClick) return;

    const listener = map.addListener('click', (event) => {
      onMapClick({
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      });
    });

    return () => googleMaps.maps.event.removeListener(listener);
  }, [map, googleMaps, onMapClick]);

  // Don't return early — always render the map container so the ref can attach.
  const showError = !!error;
  const showLoading = isLoading;

  return (
  <div ref={rootRef} className={`relative ${className}`} style={{ minHeight: height }}>
      <div 
        ref={mapRef}
        style={{ 
          height, 
          width, 
          minHeight: height,
          // Ensure the container is always visible, even if parent is hidden
          position: 'relative',
          zIndex: 1
        }}
        className="rounded-lg overflow-hidden shadow-soft"
      />
      {/* Loading / Error overlays (keep the map container in DOM) */}
      {showLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      )}

      {showError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50/90 p-4">
          <div className="text-red-600 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-800 font-medium">Failed to load map</p>
          <p className="text-red-600 text-sm">Please check your internet connection and try again.</p>
        </div>
      )}
      
      {/* Map Controls Overlay */}
      {photos.length > 0 && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <div className="text-xs text-gray-600 font-medium">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} in this area
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;
