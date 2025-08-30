/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err);

  // Multer errors
  if (err instanceof Error && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      message: `File size exceeds the maximum limit of ${Math.round(parseInt(process.env.MAX_FILE_SIZE || 10485760) / (1024 * 1024))}MB`
    });
  }

  if (err instanceof Error && err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Too many files',
      message: 'Maximum number of files exceeded'
    });
  }

  if (err instanceof Error && err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Unexpected file field',
      message: 'Invalid file field name'
    });
  }

  // Google Vision API errors
  if (err.code === 3) { // INVALID_ARGUMENT
    return res.status(400).json({
      error: 'Invalid image',
      message: 'The uploaded image format is not supported or the image is corrupted'
    });
  }

  if (err.code === 7) { // PERMISSION_DENIED
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'Vision API access denied. Please check configuration.'
    });
  }

  if (err.code === 8) { // RESOURCE_EXHAUSTED
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Vision API quota exceeded. Please try again later.'
    });
  }

  // File validation errors
  if (err.message && err.message.includes('Invalid file format')) {
    return res.status(400).json({
      error: 'Invalid file format',
      message: err.message
    });
  }

  // Network/timeout errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'Unable to connect to external services. Please try again later.'
    });
  }

  // JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON'
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal server error' : 'Request failed',
    message: statusCode === 500 && !isDevelopment ? 'Something went wrong' : err.message,
    ...(isDevelopment && { 
      stack: err.stack,
      details: err 
    })
  });
}

module.exports = errorHandler;
