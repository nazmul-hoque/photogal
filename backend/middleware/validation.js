/**
 * Middleware to validate uploaded image files
 */
function validateImageFile(req, res, next) {
  try {
    // Check if file exists
    if (!req.file && !req.files) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select an image file to upload'
      });
    }

    // For single file upload
    if (req.file) {
      const validationResult = validateSingleFile(req.file);
      if (!validationResult.isValid) {
        return res.status(400).json({
          error: 'Invalid file',
          message: validationResult.message
        });
      }
    }

    // For multiple file upload
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const validationResult = validateSingleFile(file);
        if (!validationResult.isValid) {
          return res.status(400).json({
            error: 'Invalid file',
            message: `${file.originalname}: ${validationResult.message}`
          });
        }
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Validation error',
      message: error.message
    });
  }
}

/**
 * Validate a single image file
 */
function validateSingleFile(file) {
  // Check file size
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default
  if (file.size > maxSize) {
    return {
      isValid: false,
      message: `File size too large. Maximum allowed size is ${Math.round(maxSize / (1024 * 1024))}MB`
    };
  }

  // Check MIME type
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      message: `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`
    };
  }

  // Check if file has content
  if (!file.buffer || file.buffer.length === 0) {
    return {
      isValid: false,
      message: 'File appears to be empty'
    };
  }

  // Basic file signature validation
  const signature = file.buffer.toString('hex', 0, 4).toUpperCase();
  const validSignatures = {
    'FFD8FFE0': 'jpeg',
    'FFD8FFE1': 'jpeg',
    'FFD8FFE2': 'jpeg',
    'FFD8FFE3': 'jpeg',
    'FFD8FFE8': 'jpeg',
    '89504E47': 'png',
    '47494638': 'gif',
    '52494646': 'webp'
  };

  const detectedType = validSignatures[signature];
  if (!detectedType) {
    return {
      isValid: false,
      message: 'File does not appear to be a valid image'
    };
  }

  return {
    isValid: true,
    message: 'File is valid'
  };
}

/**
 * Middleware to validate request parameters
 */
function validateRequestParams(req, res, next) {
  // Add any additional request validation here
  // For example, checking API keys, user authentication, etc.
  
  next();
}

module.exports = {
  validateImageFile,
  validateRequestParams,
  validateSingleFile
};
