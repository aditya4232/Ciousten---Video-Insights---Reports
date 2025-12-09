# 🔒 Security Features

## Overview

Ciousten implements comprehensive security measures to protect against DDoS attacks, bot abuse, and resource exhaustion.

---

## 🛡️ Security Layers

### 1. **Rate Limiting (IP-Based)**

All API endpoints are protected with IP-based rate limiting using SlowAPI.

#### Rate Limits by Endpoint

| Endpoint | Limit | Purpose |
|----------|-------|---------|
| **Video Upload** | 5 per hour | Prevent mass upload attacks |
| **Sample Video** | 10 per hour | Prevent sample abuse |
| **Session Creation** | 20 per minute | Prevent session spam |
| **AI Analysis** | 10 per hour | Protect expensive AI operations |
| **Report Generation** | 20 per hour | Limit resource-intensive operations |
| **General API** | 100 per hour | Default protection |

#### How It Works

- **IP Tracking**: Each client IP is tracked separately
- **Automatic Reset**: Limits reset after the time window
- **429 Response**: Clients exceeding limits receive HTTP 429 (Too Many Requests)
- **In-Memory Storage**: Rate limit data stored in memory (resets on server restart)

---

### 2. **Request Size Limiting**

**Maximum Request Size**: 550MB

- Prevents memory exhaustion attacks
- Protects against large file uploads
- Returns error before processing oversized requests

**Implementation**:
```python
@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    max_size = 550 * 1024 * 1024  # 550MB
    content_length = request.headers.get("content-length")
    
    if content_length and int(content_length) > max_size:
        return {"detail": "Request too large. Maximum size: 500MB"}
```

---

### 3. **File Upload Validation**

#### File Type Validation
- **Allowed Extensions**: `.mp4`, `.mov`, `.avi`, `.mkv`
- **Validation**: Checked before processing
- **Rejection**: Invalid files rejected with 400 error

#### File Size Validation
- **Maximum Size**: 500MB (configurable)
- **Check**: After upload, before processing
- **Cleanup**: Oversized files automatically deleted

**Code**:
```python
# Validate file type
allowed_extensions = ['.mp4', '.mov', '.avi', '.mkv']
file_ext = Path(file.filename).suffix.lower()

if file_ext not in allowed_extensions:
    raise HTTPException(status_code=400, detail="Invalid file type")

# Check file size
max_size_bytes = settings.max_video_size_mb * 1024 * 1024
if file_size > max_size_bytes:
    shutil.rmtree(project_dir)  # Cleanup
    raise HTTPException(status_code=400, detail="File too large")
```

---

### 4. **CORS Configuration**

**Current Setup**: Allow all origins (for public API)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Production Recommendation**: Restrict to specific domains
```python
allow_origins=[
    "https://ciousten-frontend-1.vercel.app",
    "https://yourdomain.com"
]
```

---

### 5. **Database Protection**

#### SQLite Limitations
- **Ephemeral Storage**: Database resets on deployment (Render free tier)
- **Error Handling**: Graceful handling of empty/missing database
- **No Sensitive Data**: No user passwords or sensitive information stored

#### Future: PostgreSQL
- **Persistent Storage**: Data survives restarts
- **Better Concurrency**: Handle multiple requests
- **Production Ready**: Suitable for production use

---

## 🚨 Attack Prevention

### DDoS Protection

**Rate Limiting**:
- Prevents single IP from overwhelming server
- Limits: 5 uploads/hour, 100 API calls/hour
- Automatic blocking after limit exceeded

**Request Size Limiting**:
- Prevents memory exhaustion
- Rejects oversized requests early
- Protects server resources

### Bot Attack Prevention

**Session Rate Limiting**:
- 20 session creations per minute per IP
- Prevents automated session spam
- Tracks IP addresses

**Upload Rate Limiting**:
- 5 video uploads per hour per IP
- Prevents mass upload attacks
- Protects storage and processing resources

### Resource Exhaustion Prevention

**File Size Limits**:
- Maximum 500MB per video
- Prevents storage overflow
- Automatic cleanup of oversized files

**Processing Limits**:
- AI analysis: 10 per hour
- Report generation: 20 per hour
- Prevents CPU/GPU exhaustion

---

## 📊 Monitoring & Logging

### Current Implementation

**Rate Limit Tracking**:
- In-memory storage
- Per-IP tracking
- Automatic cleanup

**Error Logging**:
- Rate limit exceeded: HTTP 429
- File too large: HTTP 400
- Invalid file type: HTTP 400

### Recommended Additions

1. **Error Tracking**: Integrate Sentry for error monitoring
2. **Analytics**: Track API usage patterns
3. **Alerting**: Alert on unusual activity
4. **Logging**: Structured logging for security events

---

## 🔧 Configuration

### Environment Variables

```env
# Backend Configuration
MAX_VIDEO_SIZE_MB=500
FRAME_EXTRACTION_FPS=2

# Rate Limiting (configured in code)
UPLOAD_RATE_LIMIT=5/hour
SAMPLE_RATE_LIMIT=10/hour
SESSION_RATE_LIMIT=20/minute
```

### Adjusting Rate Limits

Edit `backend/app/rate_limit.py`:

```python
RATE_LIMITS = {
    "upload": "5/hour",      # Adjust as needed
    "sample": "10/hour",
    "session": "20/minute",
    "analysis": "10/hour",
    "reports": "20/hour",
    "general": "100/hour",
}
```

---

## 🎯 Best Practices

### For Production

1. **Enable HTTPS**: Always use HTTPS in production
2. **Restrict CORS**: Limit to specific domains
3. **Use PostgreSQL**: Switch from SQLite
4. **Add Authentication**: Implement user authentication
5. **Monitor Logs**: Set up log monitoring
6. **Regular Updates**: Keep dependencies updated

### For Development

1. **Relaxed Limits**: Higher rate limits for testing
2. **Localhost CORS**: Allow localhost origins
3. **Detailed Logging**: Enable debug logging
4. **Test Rate Limits**: Verify limits work correctly

---

## 🚀 Deployment Security

### Render.com

**Free Tier Limitations**:
- Service spins down after 15 min inactivity
- Ephemeral filesystem (database resets)
- Limited resources

**Security Features**:
- HTTPS by default
- DDoS protection at infrastructure level
- Automatic SSL certificates

### Vercel

**Security Features**:
- Edge network protection
- Automatic HTTPS
- DDoS mitigation
- CDN caching

---

## 📝 Security Checklist

### Backend
- [x] Rate limiting on all endpoints
- [x] Request size limiting
- [x] File type validation
- [x] File size validation
- [x] CORS configuration
- [x] Error handling
- [ ] User authentication (future)
- [ ] API key authentication (future)
- [ ] PostgreSQL migration (future)

### Frontend
- [x] Environment variable configuration
- [x] Error handling
- [x] Input validation
- [ ] Content Security Policy (future)
- [ ] XSS protection (future)

---

## 🆘 Incident Response

### If Under Attack

1. **Check Logs**: Review error logs for patterns
2. **Identify Source**: Find attacking IP addresses
3. **Adjust Limits**: Temporarily lower rate limits
4. **Block IPs**: Add IP blocking if needed
5. **Contact Support**: Reach out to Render support

### Rate Limit Exceeded

**User Experience**:
- HTTP 429 response
- Clear error message
- Retry-After header (if configured)

**User Action**:
- Wait for rate limit to reset
- Reduce request frequency
- Contact support if legitimate use case

---

## 📚 Additional Resources

- [SlowAPI Documentation](https://slowapi.readthedocs.io/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [Render Security](https://render.com/docs/security)

---

**Made by Aditya Shenvi @2025** | [www.adityacuz.dev](https://www.adityacuz.dev)
