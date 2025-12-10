# 🚀 Render Deployment Guide - Ciousten V1.3

**Complete guide for deploying Ciousten backend on Render.com**

---

## 📋 **Prerequisites**

- GitHub repository with Ciousten code
- Render.com account (free tier works)
- OpenRouter API key (for AI features)

---

## 🎯 **Deployment Steps**

### 1. **Connect Repository**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Select `Ciousten---Video-Insights---Reports`

### 2. **Configure Environment Variables**

In Render dashboard, set these environment variables:

#### Required
```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

#### Auto-Configured (from render.yaml)
```
PORT=8000
PYTHONUNBUFFERED=1
ENVIRONMENT=production
DATA_DIR=/app/data
REPORTS_DIR=/app/reports
LOG_LEVEL=INFO
```

### 3. **Deploy**

1. Click "Apply" to deploy from blueprint
2. Wait 5-10 minutes for initial build
3. Check deployment logs for any errors

---

## ✅ **Verification**

### Health Check
```bash
curl https://your-app.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.3.0",
  "system": {
    "cpu_percent": 5.2,
    "memory_percent": 45.3,
    ...
  }
}
```

### API Docs
Visit: `https://your-app.onrender.com/docs`

### Root Endpoint
```bash
curl https://your-app.onrender.com/
```

---

## 🔧 **Configuration Details**

### Disk Storage
```yaml
disk:
  name: ciousten-data
  mountPath: /app/data
  sizeGB: 1  # Free tier limit
```

**What's stored**:
- Uploaded videos
- Processed frames
- Segmentation results
- Generated reports

**Note**: Free tier disk is ephemeral and resets on redeploy

### Health Checks
```yaml
healthCheckPath: /health
```

**Interval**: Every 30 seconds  
**Timeout**: 10 seconds  
**Start Period**: 40 seconds  
**Retries**: 3

### Auto Deploy
```yaml
autoDeploy: true
buildFilter:
  paths:
    - backend/**
    - render.yaml
```

**Triggers**: Only deploys when backend code or render.yaml changes

---

## 🚀 **Performance Optimizations**

### Multi-Stage Docker Build
```dockerfile
# Builder stage - compile dependencies
FROM python:3.10-slim as builder
RUN pip install --user -r requirements.txt

# Production stage - minimal image
FROM python:3.10-slim
COPY --from=builder /root/.local /root/.local
```

**Benefits**:
- Smaller image size (~500MB vs ~1GB)
- Faster deployments
- Better caching

### Uvicorn Configuration
```bash
uvicorn app.main:app \
  --host 0.0.0.0 \
  --port ${PORT} \
  --workers 1 \
  --log-level info
```

**Settings**:
- `workers 1`: Free tier has limited resources
- `log-level info`: Balanced logging
- Dynamic port binding

---

## 🔒 **Security Features**

### Environment Variables
- ✅ API keys not in code
- ✅ Secrets synced from dashboard
- ✅ Production environment flag

### CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configured for public API
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Rate Limiting
- Upload: 5 requests/hour
- Sample: 10 requests/hour
- Analysis: 10 requests/hour
- General: 100 requests/hour

---

## 📊 **Monitoring**

### Render Dashboard
- CPU usage
- Memory usage
- Request count
- Response times
- Error rates

### Application Logs
```bash
# View logs in Render dashboard
# Or use Render CLI
render logs -f
```

### Health Endpoint
Monitor at: `/health`

Returns:
- System metrics (CPU, memory, disk)
- Service status
- Active sessions
- Version info

### API Statistics
Monitor at: `/api/stats`

Returns:
- Total requests
- Requests per endpoint
- Error counts
- Response times
- Top endpoints

---

## 🐛 **Troubleshooting**

### Build Failures

**Issue**: Docker build fails  
**Solution**: Check Dockerfile syntax and paths

**Issue**: Dependency installation fails  
**Solution**: Verify requirements.txt versions

### Runtime Errors

**Issue**: Health check fails  
**Solution**: Check logs for startup errors

**Issue**: CORS errors  
**Solution**: Verify CORSMiddleware is first

**Issue**: Sample video not found  
**Solution**: Auto-download feature will handle this

### Performance Issues

**Issue**: Slow responses  
**Solution**: Check CPU/memory usage in dashboard

**Issue**: Timeouts  
**Solution**: Increase timeout in render.yaml

---

## 📈 **Scaling**

### Free Tier Limits
- **Memory**: 512 MB
- **CPU**: Shared
- **Disk**: 1 GB (ephemeral)
- **Bandwidth**: 100 GB/month
- **Build Minutes**: 500/month

### Upgrade Options

**Starter Plan** ($7/month):
- 512 MB RAM
- Persistent disk
- No sleep on inactivity

**Standard Plan** ($25/month):
- 2 GB RAM
- More CPU
- Better performance

---

## 🔄 **CI/CD Pipeline**

### Automatic Deployment
```
1. Push to GitHub main branch
2. Render detects changes
3. Builds Docker image
4. Runs health checks
5. Deploys to production
6. Verifies deployment
```

### Manual Deployment
```bash
# Trigger manual deploy
render deploy
```

### Rollback
```bash
# Rollback to previous version
render rollback
```

---

## 📚 **Environment Variables Reference**

### Required
| Variable | Description | Example |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | AI analysis API key | `sk-or-v1-...` |

### Optional
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |
| `ENVIRONMENT` | Environment name | `production` |
| `DATA_DIR` | Data storage path | `/app/data` |
| `REPORTS_DIR` | Reports path | `/app/reports` |
| `LOG_LEVEL` | Logging level | `INFO` |

---

## 🎯 **Best Practices**

### 1. Environment Variables
- ✅ Use Render dashboard for secrets
- ✅ Never commit API keys
- ✅ Use environment-specific configs

### 2. Logging
- ✅ Use structured logging
- ✅ Log important events
- ✅ Monitor error rates

### 3. Health Checks
- ✅ Implement comprehensive health endpoint
- ✅ Check all critical services
- ✅ Return detailed status

### 4. Error Handling
- ✅ Graceful degradation
- ✅ User-friendly error messages
- ✅ Automatic retry for transient errors

### 5. Performance
- ✅ Use multi-stage builds
- ✅ Minimize image size
- ✅ Cache dependencies
- ✅ Optimize database queries

---

## 🔗 **Useful Links**

- [Render Documentation](https://render.com/docs)
- [Render Status](https://status.render.com)
- [Render Community](https://community.render.com)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## ✅ **Deployment Checklist**

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] render.yaml configured
- [ ] Dockerfile optimized
- [ ] Environment variables set
- [ ] API keys added to Render

### Deployment
- [ ] Blueprint applied
- [ ] Build successful
- [ ] Health check passing
- [ ] Logs reviewed
- [ ] No errors in console

### Post-Deployment
- [ ] Test health endpoint
- [ ] Test API endpoints
- [ ] Verify CORS working
- [ ] Check sample video
- [ ] Monitor performance

### Production
- [ ] Set up monitoring
- [ ] Configure alerts
- [ ] Document deployment
- [ ] Train team
- [ ] Plan for scaling

---

## 🎉 **Success Metrics**

### Deployment
- ✅ Build time: < 5 minutes
- ✅ Deploy time: < 2 minutes
- ✅ Health check: Passing
- ✅ Uptime: > 99%

### Performance
- ✅ Response time: < 200ms
- ✅ Error rate: < 1%
- ✅ CPU usage: < 50%
- ✅ Memory usage: < 80%

---

**Status**: ✅ Production Ready  
**Version**: 1.3.0  
**Platform**: Render.com  
**Made by**: Aditya Shenvi @2025
