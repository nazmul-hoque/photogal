const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const { analyzeImageWithVision } = require('../services/visionService');
const { validateImageFile } = require('../middleware/validation');
const StorageService = require('../services/storageService');

const router = express.Router();

// Initialize storage service
const storageService = new StorageService({
  storageType: process.env.STORAGE_TYPE || 'local'
});

// Configure multer for file upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedFormats = (process.env.ALLOWED_FORMATS || 'jpg,jpeg,png,gif,webp').split(',');
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (allowedFormats.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file format. Allowed formats: ${allowedFormats.join(', ')}`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: fileFilter
});

/**
 * POST /api/upload/image
 * Upload an image and analyze it with Google Vision API
 */
router.post('/image', upload.single('image'), validateImageFile, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided',
        message: 'Please upload an image file'
      });
    }

    const imageId = uuidv4();
    
    // Upload photo with multiple variants
    console.log('Uploading photo with multiple size variants...');
    const photoData = await storageService.uploadPhoto(req.file, {
      id: imageId,
      location: req.body.location || 'Unknown',
      date: new Date().toISOString().split('T')[0]
    });

    // Analyze image with AI
    console.log('Analyzing image with Google Vision API...');
    const analysis = await analyzeImageWithVision(req.file.buffer);

    // Combine photo data with AI analysis
    const result = {
      ...photoData,
      tags: analysis.labels || [],
      faces: analysis.faces || [],
      landmarks: analysis.landmarks || [],
      text: analysis.text || [],
      objects: analysis.objects || [],
      isFavorite: false,
      people: [] // Can be populated later by face recognition
    };

    console.log('Photo upload and analysis completed successfully');
    
    res.status(200).json({
      success: true,
      message: 'Image uploaded and analyzed successfully',
      data: result
    });

  } catch (error) {
    console.error('Upload/analysis error:', error);
    
    res.status(500).json({
      error: 'Upload failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/upload/batch
 * Upload multiple images for batch processing
 */
router.post('/batch', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No image files provided',
        message: 'Please upload at least one image file'
      });
    }

    console.log(`📦 Processing batch of ${req.files.length} images...`);
    
    const results = [];
    const errors = [];

    // Process each image
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        const imageId = uuidv4();
        const imageMetadata = await sharp(file.buffer).metadata();
        const visionResults = await analyzeImageWithVision(file.buffer);

        results.push({
          imageId,
          originalFilename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          dimensions: {
            width: imageMetadata.width,
            height: imageMetadata.height
          },
          analysis: visionResults,
          uploadedAt: new Date().toISOString()
        });

      } catch (error) {
        console.error(`❌ Error processing ${file.originalname}:`, error.message);
        errors.push({
          filename: file.originalname,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Batch processing completed. ${results.length} successful, ${errors.length} failed.`,
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: req.files.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Batch processing error:', error);
    res.status(500).json({
      error: 'Batch processing failed',
      message: error.message
    });
  }
});

module.exports = router;
