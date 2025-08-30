// Application constants
export const APP_NAME = 'PhotoGal';

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
};

// File upload configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILES_PER_BATCH: 10
};

// Photo sections
export const PHOTO_SECTIONS = {
  RECENT: 'recent',
  FAVORITES: 'favorites',
  PEOPLE: 'people',
  PLACES: 'places',
  ALBUMS: 'albums'
};

// Filter options
export const SORT_OPTIONS = {
  DATE: 'date',
  NAME: 'name',
  LOCATION: 'location'
};

export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc'
};

// UI constants
export const UI = {
  SIDEBAR_WIDTH: '16rem', // 256px
  HEADER_HEIGHT: '4rem',  // 64px
  ANIMATION_DURATION: 300,
  GRID_COLUMNS: {
    SM: 1,
    MD: 2,
    LG: 3,
    XL: 4,
    '2XL': 5
  }
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};
