/**
 * API service for photo uploads and analysis
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Upload a single image file and get AI analysis
 * @param {File} file - The image file to upload
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} - Photo object with analysis
 */
export async function uploadImage(file, metadata = {}) {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    // Add metadata if provided
    if (metadata.location) {
      formData.append('location', metadata.location);
    }

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const result = await response.json();
    
    // Transform the response to match frontend photo structure
    const photoData = result.data;
    return {
      id: photoData.id,
      url: photoData.urls?.original || photoData.url, // Fallback for compatibility
      thumbnailUrl: photoData.urls?.thumbnail,
      mediumUrl: photoData.urls?.medium,
      originalFilename: photoData.originalFilename,
      tags: photoData.tags || [],
      faces: photoData.faces || [],
      landmarks: photoData.landmarks || [],
      text: photoData.text || [],
      objects: photoData.objects || [],
      date: photoData.metadata?.uploadedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
      location: photoData.location || metadata.location || 'Unknown',
      isFavorite: false,
      people: photoData.people || [],
      metadata: photoData.metadata || {}
    };
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
    
    Array.from(files).forEach((file) => {
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
      message: `Invalid file type. Allowed types: JPEG, PNG, GIF, WebP` 
    };
  }
  
  return { isValid: true, message: 'File is valid' };
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
 * Convert API analysis to app photo format
 * @param {Object} analysisData - API response data
 * @param {File} originalFile - Original uploaded file
 * @returns {Object} - Photo object for the app
 */
export function convertToPhotoObject(analysisData, originalFile) {
  // Create object URL for the uploaded image
  const imageUrl = URL.createObjectURL(originalFile);
  
  // Extract tags from labels with high confidence
  const tags = analysisData.analysis.labels
    .filter(label => label.score > 0.6)
    .slice(0, 5) // Limit to top 5 tags
    .map(label => label.description.toLowerCase());

  // Extract location from landmarks
  let location = 'Unknown';
  if (analysisData.analysis.landmarks && analysisData.analysis.landmarks.length > 0) {
    location = analysisData.analysis.landmarks[0].description;
  }

  // Check if there are people in the photo
  const peopleCount = analysisData.analysis.faces ? analysisData.analysis.faces.length : 0;
  const people = peopleCount > 0 ? [`Person ${peopleCount > 1 ? '1' : ''}`, ...(peopleCount > 1 ? [`Person 2`] : [])] : [];

  return {
    id: analysisData.imageId,
    url: imageUrl,
    tags: tags.length > 0 ? tags : ['photo'],
    date: new Date().toISOString().split('T')[0], // Today's date
    location: location,
    isFavorite: false,
    people: people,
    analysis: analysisData.analysis, // Store full analysis data
    originalFilename: analysisData.originalFilename,
    size: analysisData.size,
    dimensions: analysisData.dimensions
  };
}
