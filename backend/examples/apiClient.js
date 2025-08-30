/**
 * Example client-side implementation for uploading images to the backend API
 */

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Upload a single image file
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} - Analysis results
 */
export async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let browser set it with boundary
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Upload multiple image files
 * @param {FileList|Array} files - Array of image files
 * @returns {Promise<Object>} - Batch analysis results
 */
export async function uploadImages(files) {
  try {
    const formData = new FormData();
    
    // Add each file to the form data
    Array.from(files).forEach((file, index) => {
      formData.append('images', file);
    });

    const response = await fetch(`${API_BASE_URL}/upload/batch`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Batch upload failed');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Batch upload error:', error);
    throw error;
  }
}

/**
 * Check API health
 * @returns {Promise<Object>} - Health status
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
}

/**
 * Process uploaded file and extract metadata
 * @param {File} file - The file to process
 * @returns {Object} - File metadata
 */
export function getFileMetadata(file) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    sizeFormatted: formatFileSize(file.size)
  };
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @returns {Object} - Validation result
 */
export function validateFile(file) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!file) {
    return { isValid: false, message: 'No file selected' };
  }
  
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      message: `File size too large. Maximum size is ${formatFileSize(maxSize)}` 
    };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }
  
  return { isValid: true, message: 'File is valid' };
}

/**
 * Create image preview URL
 * @param {File} file - Image file
 * @returns {string} - Object URL for preview
 */
export function createImagePreview(file) {
  return URL.createObjectURL(file);
}

/**
 * Cleanup image preview URL
 * @param {string} url - Object URL to cleanup
 */
export function cleanupImagePreview(url) {
  URL.revokeObjectURL(url);
}

/**
 * Extract useful tags from Vision API results
 * @param {Object} analysis - Vision API analysis results
 * @returns {Array} - Simplified tag array
 */
export function extractTags(analysis) {
  const tags = [];
  
  // Add labels as tags
  if (analysis.labels) {
    tags.push(...analysis.labels
      .filter(label => label.score > 0.6) // Only high confidence labels
      .map(label => label.description.toLowerCase())
    );
  }
  
  // Add detected objects as tags
  if (analysis.objects) {
    tags.push(...analysis.objects
      .filter(obj => obj.score > 0.7) // Only high confidence objects
      .map(obj => obj.name.toLowerCase())
    );
  }
  
  // Add landmark names as tags
  if (analysis.landmarks) {
    tags.push(...analysis.landmarks
      .filter(landmark => landmark.score > 0.5)
      .map(landmark => landmark.description.toLowerCase())
    );
  }
  
  // Remove duplicates and return
  return [...new Set(tags)];
}

/**
 * Extract location data from analysis
 * @param {Object} analysis - Vision API analysis results
 * @returns {Object|null} - Location data or null
 */
export function extractLocation(analysis) {
  if (analysis.landmarks && analysis.landmarks.length > 0) {
    const landmark = analysis.landmarks[0];
    if (landmark.locations && landmark.locations.length > 0) {
      const location = landmark.locations[0];
      return {
        name: landmark.description,
        latitude: location.latitude,
        longitude: location.longitude
      };
    }
  }
  return null;
}

/**
 * Extract people count from face detection
 * @param {Object} analysis - Vision API analysis results
 * @returns {number} - Number of detected faces
 */
export function extractPeopleCount(analysis) {
  return analysis.faces ? analysis.faces.length : 0;
}

/**
 * Check if image is safe for display
 * @param {Object} analysis - Vision API analysis results
 * @returns {boolean} - Whether image is safe
 */
export function isSafeImage(analysis) {
  if (!analysis.safeSearch) return true;
  
  const safeSearch = analysis.safeSearch;
  const unsafeResults = ['LIKELY', 'VERY_LIKELY'];
  
  return !(
    unsafeResults.includes(safeSearch.adult) ||
    unsafeResults.includes(safeSearch.violence) ||
    unsafeResults.includes(safeSearch.racy)
  );
}

// Example usage in a React component:
/*
import { uploadImage, validateFile, createImagePreview, extractTags } from './apiClient';

const handleFileUpload = async (file) => {
  const validation = validateFile(file);
  if (!validation.isValid) {
    alert(validation.message);
    return;
  }

  try {
    const analysis = await uploadImage(file);
    const tags = extractTags(analysis);
    console.log('Analysis complete:', { analysis, tags });
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};
*/
