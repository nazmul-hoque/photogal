# Smart Photo Organizer Backend

Express.js backend API with Google Vision AI integration for intelligent photo analysis and organization.

## Features

- **Image Upload**: Multipart/form-data file upload with validation
- **Google Vision AI**: Comprehensive image analysis including:
  - Label detection (objects, scenes, activities)
  - Face detection with emotions and attributes
  - Landmark recognition
  - Text extraction (OCR)
  - Object localization
  - Color analysis
  - Safe search detection
- **Batch Processing**: Upload and analyze multiple images
- **Image Processing**: Automatic thumbnail generation
- **Security**: Rate limiting, CORS, input validation
- **Error Handling**: Comprehensive error responses

## Setup

### Prerequisites

- Node.js (v16 or higher)
- Google Cloud Platform account
- Google Vision API enabled

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up Google Cloud credentials:
   - Create a service account in Google Cloud Console
   - Download the JSON key file
   - Set the environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/key.json"
   ```

4. Copy environment variables:
```bash
cp .env.example .env
```

5. Update `.env` with your configuration:
```env
PORT=3001
GOOGLE_APPLICATION_CREDENTIALS=./path/to/your/google-cloud-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
MAX_FILE_SIZE=10485760
CORS_ORIGIN=http://localhost:3000
```

### Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-07-26T10:00:00.000Z",
  "uptime": 123.456
}
```

### Single Image Upload
```
POST /api/upload/image
Content-Type: multipart/form-data

Field: image (file)
```

Response:
```json
{
  "success": true,
  "message": "Image uploaded and analyzed successfully",
  "data": {
    "imageId": "uuid-string",
    "originalFilename": "photo.jpg",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "analysis": {
      "labels": [
        {
          "description": "Dog",
          "score": 0.95,
          "confidence": "VERY_HIGH"
        }
      ],
      "faces": [
        {
          "id": "face_1",
          "confidence": 0.98,
          "emotions": {
            "joy": "VERY_LIKELY",
            "sorrow": "VERY_UNLIKELY"
          }
        }
      ],
      "landmarks": [],
      "text": {
        "fullText": "Welcome Home",
        "confidence": 0.92
      },
      "objects": [
        {
          "name": "Dog",
          "score": 0.89,
          "confidence": "HIGH"
        }
      ],
      "colors": {
        "dominant": [
          {
            "color": { "red": 120, "green": 85, "blue": 60 },
            "hex": "#78553c",
            "score": 0.4
          }
        ]
      },
      "safeSearch": {
        "adult": "VERY_UNLIKELY",
        "violence": "VERY_UNLIKELY",
        "overall": "SAFE"
      }
    }
  }
}
```

### Batch Image Upload
```
POST /api/upload/batch
Content-Type: multipart/form-data

Field: images (multiple files, max 10)
```

Response:
```json
{
  "success": true,
  "message": "Batch processing completed. 3 successful, 0 failed.",
  "data": {
    "successful": [...],
    "failed": [],
    "summary": {
      "total": 3,
      "successful": 3,
      "failed": 0
    }
  }
}
```

## Analysis Features

### Label Detection
- Identifies objects, animals, activities, scenes
- Confidence scores and topicality ratings
- Up to 20 labels per image

### Face Detection
- Face bounding boxes and landmarks
- Emotion detection (joy, sorrow, anger, surprise)
- Face attributes (headwear, blur, exposure)
- Face angles (roll, pan, tilt)

### Landmark Recognition
- Famous landmarks and locations
- Geographic coordinates when available
- Confidence scores

### Text Extraction (OCR)
- Full text extraction from images
- Individual text block localization
- Language detection
- Confidence scores

### Object Localization
- Precise object detection with bounding boxes
- Object names and confidence scores
- Normalized coordinates

### Color Analysis
- Dominant color extraction
- Full color palette
- RGB and hex color values
- Pixel fraction analysis

### Safe Search
- Adult content detection
- Violence detection
- Medical content identification
- Overall safety rating

## File Validation

- **Supported formats**: JPEG, PNG, GIF, WebP
- **Maximum file size**: 10MB (configurable)
- **File signature validation**: Checks magic numbers
- **MIME type validation**: Server-side verification

## Security Features

- **Rate limiting**: Configurable request limits
- **CORS protection**: Configurable origins
- **Input validation**: Comprehensive file validation
- **Error handling**: Secure error responses
- **Helmet.js**: Security headers

## Error Handling

The API provides detailed error responses:

```json
{
  "error": "Invalid file format",
  "message": "Allowed formats: jpg, jpeg, png, gif, webp"
}
```

Common error codes:
- `400`: Bad request (invalid file, format, size)
- `429`: Too many requests (rate limit)
- `500`: Internal server error
- `503`: Service unavailable (Vision API issues)

## Development

### Project Structure
```
backend/
├── server.js              # Main server file
├── routes/
│   └── upload.js          # Upload endpoints
├── services/
│   └── visionService.js   # Google Vision API integration
├── middleware/
│   ├── validation.js      # File validation
│   └── errorHandler.js    # Error handling
└── package.json
```

### Testing

Run tests:
```bash
npm test
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Google Cloud key | Required |
| `GOOGLE_CLOUD_PROJECT_ID` | Google Cloud project ID | Required |
| `MAX_FILE_SIZE` | Maximum file size in bytes | 10485760 |
| `ALLOWED_FORMATS` | Comma-separated file formats | jpg,jpeg,png,gif,webp |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |
| `RATE_LIMIT_WINDOW` | Rate limit window in minutes | 15 |
| `RATE_LIMIT_MAX` | Max requests per window | 100 |

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure Google Cloud credentials
3. Set up proper CORS origins
4. Configure rate limiting
5. Use a process manager (PM2)
6. Set up monitoring and logging

## License

MIT License
