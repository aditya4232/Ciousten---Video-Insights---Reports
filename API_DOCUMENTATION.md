# 📚 Ciousten API Documentation - V1.2

**Complete API Reference for Video Insights & Reports**

---

## 🌐 Base URLs

- **Production**: `https://ciousten-video-insights-reports.onrender.com`
- **Development**: `http://localhost:8000`
- **Interactive Docs**: `{BASE_URL}/docs`
- **OpenAPI Schema**: `{BASE_URL}/openapi.json`

---

## 🔑 Authentication

Currently, the API is **publicly accessible** without authentication. Rate limiting is applied per IP address.

### Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Video Upload | 5 requests | 1 hour |
| Sample Video | 10 requests | 1 hour |
| Session Creation | 20 requests | 1 minute |
| AI Analysis | 10 requests | 1 hour |
| Report Generation | 20 requests | 1 hour |
| General API | 100 requests | 1 hour |

---

## 📡 Core Endpoints

### System & Health

#### GET `/`
Get API information and version.

**Response**:
```json
{
  "message": "Ciousten - Video Insights & Reports API",
  "version": "1.2.0",
  "status": "production",
  "author": "Aditya Shenvi @2025",
  "website": "www.adityacuz.dev",
  "docs": "/docs",
  "health": "/health"
}
```

#### GET `/health`
Comprehensive health check with system metrics.

**Response**:
```json
{
  "status": "healthy",
  "version": "1.2.0",
  "timestamp": "2025-12-10T10:27:03.123456",
  "system": {
    "cpu_percent": 15.2,
    "memory_percent": 45.8,
    "memory_available_mb": 256.5,
    "disk_percent": 35.2,
    "disk_free_gb": 8.5
  },
  "services": {
    "database": "healthy",
    "data_directory": "ok",
    "reports_directory": "ok"
  },
  "sessions": {
    "active_count": 3
  },
  "environment": "production"
}
```

#### GET `/api/stats`
Get API usage statistics and performance metrics.

**Response**:
```json
{
  "timestamp": "2025-12-10T10:27:03.123456",
  "uptime": {
    "seconds": 86400,
    "formatted": "24h 0m"
  },
  "requests": {
    "total": 1523,
    "by_endpoint": {
      "/api/projects": 450,
      "/api/upload": 123,
      "/health": 950
    }
  },
  "errors": {
    "total": 15,
    "by_endpoint": {
      "/api/upload": 5,
      "/api/analyze": 10
    },
    "error_rates": {
      "/api/upload": 4.07,
      "/api/analyze": 2.5
    }
  },
  "performance": {
    "avg_response_times": {
      "/api/projects": {
        "avg_ms": 45.2,
        "min_ms": 12.5,
        "max_ms": 234.8,
        "count": 450
      }
    }
  },
  "top_endpoints": [
    {"endpoint": "/health", "calls": 950},
    {"endpoint": "/api/projects", "calls": 450}
  ]
}
```

---

### Session Management

#### POST `/api/session`
Create a new user session.

**Request Body**:
```json
{
  "name": "John Doe",
  "device": "Chrome on Windows",
  "timezone": "America/New_York",
  "user_agent": "Mozilla/5.0..."
}
```

**Response**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "device": "Chrome on Windows",
  "timezone": "America/New_York",
  "created_at": "2025-12-10T10:27:03.123456",
  "message": "Welcome, John Doe! Session created."
}
```

#### GET `/api/session/{session_id}`
Get session information.

**Response**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "device": "Chrome on Windows",
  "timezone": "America/New_York",
  "user_agent": "Mozilla/5.0...",
  "ip": "192.168.1.1",
  "created_at": "2025-12-10T10:27:03.123456"
}
```

#### DELETE `/api/session/{session_id}`
Delete a session.

**Response**:
```json
{
  "message": "Goodbye, John Doe! Session deleted.",
  "success": true
}
```

#### GET `/api/sessions/active`
Get active sessions count.

**Response**:
```json
{
  "active_sessions": 5,
  "sessions": [
    {
      "name": "John Doe",
      "device": "Chrome on Windows",
      "timezone": "America/New_York"
    }
  ]
}
```

---

### Project Management

#### GET `/api/projects`
List all projects.

**Response**:
```json
[
  {
    "project_id": "proj_123",
    "video_filename": "traffic_video.mp4",
    "status": "completed",
    "created_at": "2025-12-10T10:00:00",
    "frame_count": 120,
    "object_count": 450
  }
]
```

#### GET `/api/projects/{project_id}`
Get project details.

**Response**:
```json
{
  "project_id": "proj_123",
  "video_filename": "traffic_video.mp4",
  "status": "completed",
  "created_at": "2025-12-10T10:00:00",
  "frame_count": 120,
  "object_count": 450,
  "analysis": {
    "summary": "Traffic analysis complete",
    "anomalies": 3,
    "activities": 5
  }
}
```

---

### Video Upload

#### POST `/api/upload`
Upload a video file for processing.

**Request**: Multipart form data
- `file`: Video file (MP4, MOV, AVI, MKV)
- Max size: 500MB

**Response**:
```json
{
  "project_id": "proj_123",
  "video_filename": "traffic_video.mp4",
  "file_size_mb": 45.2,
  "message": "Video uploaded successfully"
}
```

**Error Responses**:
- `400`: Invalid file type or size
- `429`: Rate limit exceeded
- `500`: Server error

---

### Segmentation

#### POST `/api/segment/{project_id}`
Run video segmentation with SAM2 + YOLO.

**Response**:
```json
{
  "project_id": "proj_123",
  "status": "processing",
  "message": "Segmentation started",
  "estimated_time_minutes": 5
}
```

#### GET `/api/segment/{project_id}/status`
Check segmentation status.

**Response**:
```json
{
  "project_id": "proj_123",
  "status": "completed",
  "progress": 100,
  "frame_count": 120,
  "object_count": 450,
  "processing_time_seconds": 245
}
```

---

### AI Analysis

#### POST `/api/analyze/{project_id}`
Run AI analysis on segmented video.

**Request Body**:
```json
{
  "model": "deepseek/deepseek-chat-free",
  "domain": "traffic",
  "options": {
    "detect_anomalies": true,
    "classify_activities": true
  }
}
```

**Response**:
```json
{
  "project_id": "proj_123",
  "analysis_id": "analysis_456",
  "status": "completed",
  "summary": "Traffic congestion detected...",
  "findings": [
    "Peak traffic at 5 PM",
    "3 anomalies detected"
  ],
  "kpis": {
    "avg_vehicle_count": 45,
    "peak_count": 78,
    "congestion_percentage": 35
  }
}
```

---

### Reports

#### POST `/api/reports/{project_id}/excel`
Generate Excel report.

**Response**:
```json
{
  "project_id": "proj_123",
  "report_type": "excel",
  "download_url": "/api/reports/download/report_123.xlsx",
  "file_size_mb": 2.5
}
```

#### POST `/api/reports/{project_id}/pdf`
Generate PDF report.

**Response**:
```json
{
  "project_id": "proj_123",
  "report_type": "pdf",
  "download_url": "/api/reports/download/report_123.pdf",
  "file_size_mb": 1.8
}
```

#### GET `/api/reports/download/{filename}`
Download generated report.

**Response**: File download

---

### Sample Video

#### GET `/api/sample/video`
Get a sample video for testing.

**Response**: Video file download

---

## 🔧 Error Handling

### Error Response Format

```json
{
  "detail": "Error message",
  "error_code": "ERROR_CODE",
  "timestamp": "2025-12-10T10:27:03.123456"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_FILE_TYPE` | 400 | Unsupported file format |
| `FILE_TOO_LARGE` | 400 | File exceeds 500MB limit |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `PROJECT_NOT_FOUND` | 404 | Project doesn't exist |
| `PROCESSING_ERROR` | 500 | Internal processing error |
| `API_KEY_INVALID` | 401 | Invalid OpenRouter API key |

---

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## 🚀 Quick Start Examples

### Python

```python
import requests

# Health check
response = requests.get("https://your-api.onrender.com/health")
print(response.json())

# Create session
session_data = {
    "name": "Test User",
    "device": "Python Script",
    "timezone": "UTC"
}
response = requests.post(
    "https://your-api.onrender.com/api/session",
    json=session_data
)
session = response.json()

# Upload video
with open("video.mp4", "rb") as f:
    files = {"file": f}
    response = requests.post(
        "https://your-api.onrender.com/api/upload",
        files=files
    )
project = response.json()
```

### JavaScript

```javascript
// Health check
const health = await fetch('https://your-api.onrender.com/health');
const healthData = await health.json();
console.log(healthData);

// Create session
const sessionResponse = await fetch('https://your-api.onrender.com/api/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    device: 'Browser',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
});
const session = await sessionResponse.json();

// Upload video
const formData = new FormData();
formData.append('file', videoFile);

const uploadResponse = await fetch('https://your-api.onrender.com/api/upload', {
  method: 'POST',
  body: formData
});
const project = await uploadResponse.json();
```

### cURL

```bash
# Health check
curl https://your-api.onrender.com/health

# Create session
curl -X POST https://your-api.onrender.com/api/session \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","device":"cURL","timezone":"UTC"}'

# Upload video
curl -X POST https://your-api.onrender.com/api/upload \
  -F "file=@video.mp4"

# Get statistics
curl https://your-api.onrender.com/api/stats
```

---

## 📝 Best Practices

### 1. Rate Limiting
- Implement exponential backoff on 429 errors
- Cache responses when possible
- Use batch operations where available

### 2. Error Handling
- Always check response status codes
- Implement retry logic for 5xx errors
- Log errors for debugging

### 3. File Uploads
- Validate file size before upload
- Check supported formats
- Show upload progress to users

### 4. Performance
- Use compression for large payloads
- Implement request timeouts
- Monitor API response times

---

## 🔗 Additional Resources

- **Interactive API Docs**: `/docs`
- **OpenAPI Schema**: `/openapi.json`
- **GitHub Repository**: [Ciousten](https://github.com/aditya4232/Ciousten---Video-Insights---Reports)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Security Guide**: [SECURITY.md](SECURITY.md)

---

**Made by Aditya Shenvi @2025**  
**Version**: 1.2.0  
**Status**: Production Ready ✅
