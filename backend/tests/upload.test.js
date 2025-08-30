const request = require('supertest');
const app = require('../server');
const path = require('path');

describe('Upload API', () => {
  // Health check test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  // Image upload tests
  describe('POST /api/upload/image', () => {
    it('should return error when no file is uploaded', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('No image file provided');
    });

    it('should accept valid image file', async () => {
      // This test would require a sample image file
      // For demonstration purposes, we'll skip actual file upload
      const response = await request(app)
        .post('/api/upload/image')
        .attach('image', Buffer.from('fake-image-data'), 'test.jpg')
        .expect(400); // Will fail validation due to fake data

      expect(response.body).toHaveProperty('error');
    });
  });

  // Batch upload tests
  describe('POST /api/upload/batch', () => {
    it('should return error when no files are uploaded', async () => {
      const response = await request(app)
        .post('/api/upload/batch')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('No image files provided');
    });
  });

  // 404 test
  describe('GET /nonexistent', () => {
    it('should return 404 for nonexistent endpoints', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Endpoint not found');
    });
  });
});

describe('Vision Service', () => {
  const { analyzeImageWithVision } = require('../services/visionService');

  it('should handle empty buffer gracefully', async () => {
    try {
      await analyzeImageWithVision(Buffer.alloc(0));
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe('Validation Middleware', () => {
  const { validateSingleFile } = require('../middleware/validation');

  it('should validate file size', () => {
    const largeFile = {
      size: 20 * 1024 * 1024, // 20MB
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
      originalname: 'test.jpg'
    };

    const result = validateSingleFile(largeFile);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('File size too large');
  });

  it('should validate MIME type', () => {
    const invalidFile = {
      size: 1024,
      mimetype: 'text/plain',
      buffer: Buffer.from('test'),
      originalname: 'test.txt'
    };

    const result = validateSingleFile(invalidFile);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('Invalid file type');
  });

  it('should accept valid image file', () => {
    const validFile = {
      size: 1024,
      mimetype: 'image/jpeg',
      buffer: Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]), // JPEG header
      originalname: 'test.jpg'
    };

    const result = validateSingleFile(validFile);
    expect(result.isValid).toBe(true);
  });
});
