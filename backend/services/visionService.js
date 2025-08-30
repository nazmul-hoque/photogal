const vision = require('@google-cloud/vision');

// Initialize the Vision API client
const client = new vision.ImageAnnotatorClient({
  // Credentials will be loaded from GOOGLE_APPLICATION_CREDENTIALS environment variable
  // or from Google Cloud SDK default credentials
});

/**
 * Analyze an image using Google Vision API
 * @param {Buffer} imageBuffer - The image buffer to analyze
 * @returns {Object} - Structured analysis results
 */
async function analyzeImageWithVision(imageBuffer) {
  try {
    console.log('🔍 Starting Google Vision API analysis...');
    
    // Prepare the image for Vision API
    const image = {
      content: imageBuffer.toString('base64')
    };

    // Define the features we want to detect
    const features = [
      { type: 'LABEL_DETECTION', maxResults: 20 },
      { type: 'FACE_DETECTION', maxResults: 10 },
      { type: 'LANDMARK_DETECTION', maxResults: 10 },
      { type: 'TEXT_DETECTION', maxResults: 1 },
      { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
      { type: 'IMAGE_PROPERTIES' },
      { type: 'SAFE_SEARCH_DETECTION' }
    ];

    // Make the API request
    const request = {
      image: image,
      features: features
    };

    const [result] = await client.annotateImage(request);
    
    // Process and structure the results
    const analysis = {
      labels: processLabels(result.labelAnnotations || []),
      faces: processFaces(result.faceAnnotations || []),
      landmarks: processLandmarks(result.landmarkAnnotations || []),
      text: processText(result.textAnnotations || []),
      objects: processObjects(result.localizedObjectAnnotations || []),
      colors: processColors(result.imagePropertiesAnnotation),
      safeSearch: processSafeSearch(result.safeSearchAnnotation),
      confidence: calculateOverallConfidence(result)
    };

    console.log('✅ Vision API analysis completed');
    return analysis;

  } catch (error) {
    console.error('❌ Vision API error:', error);
    throw error;
  }
}

/**
 * Process label detection results
 */
function processLabels(labelAnnotations) {
  return labelAnnotations.map(label => ({
    description: label.description,
    score: Math.round(label.score * 100) / 100,
    confidence: getConfidenceLevel(label.score),
    topicality: Math.round((label.topicality || 0) * 100) / 100
  })).sort((a, b) => b.score - a.score);
}

/**
 * Process face detection results
 */
function processFaces(faceAnnotations) {
  return faceAnnotations.map((face, index) => ({
    id: `face_${index + 1}`,
    confidence: Math.round(face.detectionConfidence * 100) / 100,
    boundingBox: {
      vertices: face.boundingPoly?.vertices || []
    },
    landmarks: face.landmarks?.map(landmark => ({
      type: landmark.type,
      position: landmark.position
    })) || [],
    emotions: {
      joy: face.joyLikelihood,
      sorrow: face.sorrowLikelihood,
      anger: face.angerLikelihood,
      surprise: face.surpriseLikelihood
    },
    attributes: {
      headwear: face.headwearLikelihood,
      blurred: face.blurredLikelihood,
      underExposed: face.underExposedLikelihood
    },
    angles: {
      roll: Math.round((face.rollAngle || 0) * 100) / 100,
      pan: Math.round((face.panAngle || 0) * 100) / 100,
      tilt: Math.round((face.tiltAngle || 0) * 100) / 100
    }
  }));
}

/**
 * Process landmark detection results
 */
function processLandmarks(landmarkAnnotations) {
  return landmarkAnnotations.map(landmark => ({
    description: landmark.description,
    score: Math.round(landmark.score * 100) / 100,
    confidence: getConfidenceLevel(landmark.score),
    boundingBox: {
      vertices: landmark.boundingPoly?.vertices || []
    },
    locations: landmark.locations?.map(location => ({
      latitude: location.latLng?.latitude,
      longitude: location.latLng?.longitude
    })) || []
  }));
}

/**
 * Process text detection results
 */
function processText(textAnnotations) {
  if (textAnnotations.length === 0) {
    return {
      fullText: '',
      blocks: [],
      confidence: 0
    };
  }

  const fullText = textAnnotations[0];
  const textBlocks = textAnnotations.slice(1);

  return {
    fullText: fullText.description || '',
    confidence: Math.round((fullText.confidence || 0) * 100) / 100,
    blocks: textBlocks.map(block => ({
      text: block.description,
      boundingBox: {
        vertices: block.boundingPoly?.vertices || []
      }
    })),
    language: detectLanguage(fullText.description || '')
  };
}

/**
 * Process object localization results
 */
function processObjects(objectAnnotations) {
  return objectAnnotations.map(object => ({
    name: object.name,
    score: Math.round(object.score * 100) / 100,
    confidence: getConfidenceLevel(object.score),
    boundingBox: {
      normalizedVertices: object.boundingPoly?.normalizedVertices || []
    }
  })).sort((a, b) => b.score - a.score);
}

/**
 * Process image properties (colors)
 */
function processColors(imageProperties) {
  if (!imageProperties?.dominantColors?.colors) {
    return {
      dominant: [],
      palette: []
    };
  }

  const colors = imageProperties.dominantColors.colors.map(color => ({
    color: {
      red: color.color?.red || 0,
      green: color.color?.green || 0,
      blue: color.color?.blue || 0
    },
    score: Math.round(color.score * 100) / 100,
    pixelFraction: Math.round(color.pixelFraction * 100) / 100,
    hex: rgbToHex(color.color?.red || 0, color.color?.green || 0, color.color?.blue || 0)
  }));

  return {
    dominant: colors.slice(0, 3),
    palette: colors
  };
}

/**
 * Process safe search detection results
 */
function processSafeSearch(safeSearchAnnotation) {
  if (!safeSearchAnnotation) {
    return {
      adult: 'UNKNOWN',
      medical: 'UNKNOWN',
      spoofed: 'UNKNOWN',
      violence: 'UNKNOWN',
      racy: 'UNKNOWN',
      overall: 'SAFE'
    };
  }

  return {
    adult: safeSearchAnnotation.adult,
    medical: safeSearchAnnotation.medical,
    spoofed: safeSearchAnnotation.spoof,
    violence: safeSearchAnnotation.violence,
    racy: safeSearchAnnotation.racy,
    overall: calculateSafeSearchOverall(safeSearchAnnotation)
  };
}

/**
 * Calculate overall confidence score
 */
function calculateOverallConfidence(result) {
  const scores = [];
  
  if (result.labelAnnotations?.length > 0) {
    scores.push(result.labelAnnotations[0].score);
  }
  
  if (result.faceAnnotations?.length > 0) {
    scores.push(result.faceAnnotations[0].detectionConfidence);
  }
  
  if (result.landmarkAnnotations?.length > 0) {
    scores.push(result.landmarkAnnotations[0].score);
  }

  if (scores.length === 0) return 0;
  
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Math.round(average * 100) / 100;
}

/**
 * Helper functions
 */
function getConfidenceLevel(score) {
  if (score >= 0.9) return 'VERY_HIGH';
  if (score >= 0.75) return 'HIGH';
  if (score >= 0.5) return 'MEDIUM';
  if (score >= 0.25) return 'LOW';
  return 'VERY_LOW';
}

function detectLanguage(text) {
  // Simple language detection - in production, you might want to use a proper language detection library
  if (/[а-яё]/i.test(text)) return 'ru';
  if (/[äöüß]/i.test(text)) return 'de';
  if (/[àâäéèêëïîôöùûüÿ]/i.test(text)) return 'fr';
  if (/[ñáéíóúü]/i.test(text)) return 'es';
  if (/[一-龯]/i.test(text)) return 'zh';
  if (/[ひらがなカタカナ]/i.test(text)) return 'ja';
  return 'en';
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function calculateSafeSearchOverall(safeSearch) {
  const levels = ['VERY_UNLIKELY', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'VERY_LIKELY'];
  const maxLevel = Math.max(
    levels.indexOf(safeSearch.adult),
    levels.indexOf(safeSearch.violence),
    levels.indexOf(safeSearch.racy)
  );
  
  if (maxLevel >= 3) return 'UNSAFE';
  if (maxLevel >= 2) return 'MODERATE';
  return 'SAFE';
}

module.exports = {
  analyzeImageWithVision
};
