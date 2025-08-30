const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

class StorageService {
  constructor(config = {}) {
    this.storageType = config.storageType || process.env.STORAGE_TYPE || 'local';
    this.config = config;
  }

  /**
   * Upload photo with multiple size variants
   */
  async uploadPhoto(file, metadata = {}) {
    const photoId = metadata.id || require('uuid').v4();
    const timestamp = Date.now();
    
    try {
      // Process image into multiple sizes
      const variants = await this.processImageVariants(file.buffer, photoId);
      
      // Upload all variants based on storage type
      const urls = await this.uploadVariants(variants, photoId);
      
      // Return structured photo object
      return {
        id: photoId,
        originalFilename: file.originalname,
        urls: urls,
        metadata: {
          size: file.size,
          mimetype: file.mimetype,
          dimensions: variants.original.metadata,
          uploadedAt: new Date(timestamp).toISOString()
        },
        ...metadata
      };
      
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload photo: ${error.message}`);
    }
  }

  /**
   * Process image into multiple size variants
   */
  async processImageVariants(buffer, photoId) {
    const variants = {};
    
    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    
    // Original (optimized)
    variants.original = {
      buffer: await sharp(buffer)
        .jpeg({ quality: 90, progressive: true })
        .toBuffer(),
      suffix: 'original',
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: 'jpeg'
      }
    };

    // Thumbnail (300x300)
    variants.thumbnail = {
      buffer: await sharp(buffer)
        .resize(300, 300, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toBuffer(),
      suffix: 'thumb',
      metadata: { width: 300, height: 300, format: 'jpeg' }
    };

    // Medium (800px max width/height)
    variants.medium = {
      buffer: await sharp(buffer)
        .resize(800, 800, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer(),
      suffix: 'medium',
      metadata: await this.getResizedMetadata(buffer, 800, 800)
    };

    return variants;
  }

  async getResizedMetadata(buffer, maxWidth, maxHeight) {
    const resized = sharp(buffer).resize(maxWidth, maxHeight, { 
      fit: 'inside',
      withoutEnlargement: true
    });
    const metadata = await resized.metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: 'jpeg'
    };
  }

  /**
   * Upload variants based on storage type
   */
  async uploadVariants(variants, photoId) {
    switch (this.storageType) {
      case 'local':
        return await this.uploadToLocal(variants, photoId);
      case 's3':
        return await this.uploadToS3(variants, photoId);
      case 'gcs':
        return await this.uploadToGCS(variants, photoId);
      default:
        throw new Error(`Unsupported storage type: ${this.storageType}`);
    }
  }

  /**
   * Local file system storage
   */
  async uploadToLocal(variants, photoId) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'photos');
    
    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    const urls = {};
    
    for (const [variant, data] of Object.entries(variants)) {
      const filename = `${photoId}-${data.suffix}.jpg`;
      const filepath = path.join(uploadDir, filename);
      
      await fs.writeFile(filepath, data.buffer);
      
      // Return relative URL for serving
      urls[variant] = `/uploads/photos/${filename}`;
    }
    
    return urls;
  }

  /**
   * AWS S3 storage (implementation example)
   */
  async uploadToS3(variants, photoId) {
    // Requires AWS SDK setup
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    
    const bucket = process.env.S3_BUCKET_NAME;
    const urls = {};
    
    for (const [variant, data] of Object.entries(variants)) {
      const key = `photos/${photoId}/${variant}.jpg`;
      
      const uploadParams = {
        Bucket: bucket,
        Key: key,
        Body: data.buffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
      };
      
      const result = await s3.upload(uploadParams).promise();
      urls[variant] = result.Location;
    }
    
    return urls;
  }

  /**
   * Google Cloud Storage (implementation example)
   */
  async uploadToGCS(variants, photoId) {
    const { Storage } = require('@google-cloud/storage');
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE
    });
    
    const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
    const urls = {};
    
    for (const [variant, data] of Object.entries(variants)) {
      const fileName = `photos/${photoId}/${variant}.jpg`;
      const file = bucket.file(fileName);
      
      await file.save(data.buffer, {
        metadata: {
          contentType: 'image/jpeg'
        }
      });
      
      // Make file public
      await file.makePublic();
      
      urls[variant] = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${fileName}`;
    }
    
    return urls;
  }

  /**
   * Delete photo and all its variants
   */
  async deletePhoto(photoId, urls) {
    switch (this.storageType) {
      case 'local':
        return await this.deleteFromLocal(photoId);
      case 's3':
        return await this.deleteFromS3(photoId);
      case 'gcs':
        return await this.deleteFromGCS(photoId);
    }
  }

  async deleteFromLocal(photoId) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'photos');
    const files = await fs.readdir(uploadDir);
    
    for (const file of files) {
      if (file.startsWith(photoId)) {
        await fs.unlink(path.join(uploadDir, file));
      }
    }
  }
}

module.exports = StorageService;
