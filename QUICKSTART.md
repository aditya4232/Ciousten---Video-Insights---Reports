# 🚀 Ciousten V1.2 - Quick Start Guide

**Get up and running with Ciousten V1.2 in minutes!**

---

## ⚡ 30-Second Overview

Ciousten is a **production-ready video analytics platform** that uses AI (SAM2 + YOLO + OpenRouter) to analyze videos, detect objects, identify anomalies, and generate professional reports.

**V1.2 Features**:
- 📊 Real-time system monitoring
- 📈 API usage analytics
- 🔒 Production-grade security
- 🚀 Optimized deployment
- 📚 Comprehensive documentation

---

## 🎯 Choose Your Path

### Option 1: Use the Live Demo (Fastest)
**Time**: 2 minutes

1. Visit: https://ciousten-frontend-1.vercel.app
2. Click "Start Analyzing"
3. Upload a video or use sample
4. View results!

### Option 2: Deploy Your Own (Recommended)
**Time**: 10 minutes

1. Fork the repository
2. Deploy to Vercel + Render (free)
3. Add your OpenRouter API key
4. Start analyzing!

### Option 3: Run Locally with Docker
**Time**: 5 minutes

1. Clone repository
2. Run `docker-compose up`
3. Open http://localhost:3000
4. Start analyzing!

---

## 🚀 Quick Deploy (Production)

### Prerequisites
- GitHub account
- Vercel account (free)
- Render account (free)
- OpenRouter API key (free)

### Step 1: Get OpenRouter API Key (2 min)

1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up (free)
3. Navigate to "API Keys"
4. Create new key
5. Copy the key (starts with `sk-or-v1-...`)

### Step 2: Deploy Backend to Render (3 min)

1. Go to [render.com](https://render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Select `render.yaml`
5. Add environment variable:
   - Key: `OPENROUTER_API_KEY`
   - Value: Your API key from Step 1
6. Click "Apply"
7. Wait for deployment (2-3 minutes)
8. Copy your backend URL (e.g., `https://ciousten-api.onrender.com`)

### Step 3: Deploy Frontend to Vercel (2 min)

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your repository
4. Configure:
   - Root Directory: `frontend`
   - Framework: Next.js
5. Add environment variable:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: Your Render backend URL from Step 2
6. Click "Deploy"
7. Wait for deployment (1-2 minutes)
8. Visit your live site!

### Step 4: Verify Deployment (1 min)

```bash
# Test backend health
curl https://your-backend.onrender.com/health

# Should return:
{
  "status": "healthy",
  "version": "1.2.0",
  ...
}
```

✅ **Done!** Your Ciousten V1.2 is live!

---

## 🐳 Quick Start with Docker

### Prerequisites
- Docker installed
- Docker Compose installed

### Step 1: Clone Repository

```bash
git clone https://github.com/aditya4232/Ciousten---Video-Insights---Reports.git
cd Ciousten---Video-Insights---Reports
```

### Step 2: Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your OpenRouter API key:
```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### Step 3: Start Services

```bash
cd ..
docker-compose up --build
```

### Step 4: Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

✅ **Done!** Ciousten is running locally!

---

## 📱 First Steps After Setup

### 1. Check System Health

Visit the Dashboard to see:
- System metrics (CPU, memory, disk)
- Active sessions
- Service status

### 2. Upload Your First Video

1. Click "Annotate" or "Upload Video"
2. Select a video file (MP4, MOV, AVI)
3. Click "Start Segmentation"
4. Wait for processing (2-5 minutes)

### 3. Run AI Analysis

1. Go to "Analyze" page
2. Select your project
3. Choose domain mode (Traffic, Retail, Security)
4. Select AI model
5. Click "Run Advanced Analysis"
6. Review insights and anomalies

### 4. Generate Reports

1. Go to "Reports" page
2. Find your analyzed project
3. Click "Generate Reports"
4. Download Excel or PDF
5. Generate AI Dataset Card

---

## 🎓 Learning Path

### Beginner (Day 1)
1. ✅ Deploy or run locally
2. ✅ Upload sample video
3. ✅ Run basic analysis
4. ✅ Generate first report

### Intermediate (Day 2-3)
1. ✅ Try different domain modes
2. ✅ Explore anomaly detection
3. ✅ Test activity recognition
4. ✅ Generate dataset cards

### Advanced (Week 1)
1. ✅ Integrate with your workflow
2. ✅ Use API directly
3. ✅ Monitor system health
4. ✅ Optimize for your use case

---

## 📚 Essential Documentation

### Getting Started
- [README.md](README.md) - Complete overview
- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues

### Advanced
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Complete API reference
- [SECURITY.md](SECURITY.md) - Security features
- [V1.2_PRODUCTION_PLAN.md](V1.2_PRODUCTION_PLAN.md) - Future roadmap

### Operations
- [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) - Deployment checklist
- [V1.2_DEPLOYMENT_FIX.md](V1.2_DEPLOYMENT_FIX.md) - Deployment fixes

---

## 🔧 Common Tasks

### Check System Health
```bash
curl http://localhost:8000/health
```

### View API Statistics
```bash
curl http://localhost:8000/api/stats
```

### Test Video Upload
```bash
curl -X POST http://localhost:8000/api/upload \
  -F "file=@your-video.mp4"
```

### Create Session
```bash
curl -X POST http://localhost:8000/api/session \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","device":"Browser"}'
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check logs
docker-compose logs backend

# Verify environment variables
cat backend/.env

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Frontend Can't Reach Backend
```bash
# Check NEXT_PUBLIC_API_URL
cat frontend/.env.production

# Verify backend is running
curl http://localhost:8000/health

# Check CORS
# Should allow your frontend domain
```

### Video Upload Fails
- Check file size (max 500MB)
- Verify file type (MP4, MOV, AVI, MKV)
- Check available disk space
- Review backend logs

---

## 💡 Pro Tips

### 1. Use Sample Video
Start with the built-in sample video to test the system without uploading your own.

### 2. Monitor System Health
Keep an eye on the System Health Widget in the dashboard to ensure optimal performance.

### 3. Choose Right Domain Mode
- **Traffic**: For road/vehicle analysis
- **Retail**: For customer behavior
- **Security**: For surveillance
- **General**: For other use cases

### 4. Optimize Processing
- Use lower FPS for faster processing
- Process shorter videos first
- Use YOLO-only mode for speed

### 5. Leverage API
Use the API directly for automation and integration with your existing tools.

---

## 🎯 Next Steps

### After Setup
1. ✅ Explore all features
2. ✅ Read API documentation
3. ✅ Join community discussions
4. ✅ Star the repository
5. ✅ Share feedback

### Contribute
1. 📖 Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. 🐛 Report issues
3. 💡 Suggest features
4. 🔧 Submit pull requests
5. 📚 Improve documentation

---

## 📊 Quick Reference

### URLs (Local)
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health
- Stats: http://localhost:8000/api/stats

### URLs (Production)
- Frontend: https://ciousten-frontend-1.vercel.app
- Backend: https://ciousten-video-insights-reports.onrender.com
- API Docs: https://ciousten-video-insights-reports.onrender.com/docs

### Key Files
- Backend Config: `backend/.env`
- Frontend Config: `frontend/.env.production`
- Docker Compose: `docker-compose.yml`
- Render Config: `render.yaml`

### Commands
```bash
# Start
docker-compose up

# Stop
docker-compose down

# Rebuild
docker-compose build --no-cache

# Logs
docker-compose logs -f

# Health Check
curl http://localhost:8000/health
```

---

## 🆘 Get Help

### Documentation
- 📚 [Full Documentation](README.md)
- 🔧 [Troubleshooting](TROUBLESHOOTING.md)
- 📖 [API Reference](API_DOCUMENTATION.md)

### Community
- 🐛 [Report Issues](https://github.com/aditya4232/Ciousten---Video-Insights---Reports/issues)
- 💬 [Discussions](https://github.com/aditya4232/Ciousten---Video-Insights---Reports/discussions)
- ⭐ [Star on GitHub](https://github.com/aditya4232/Ciousten---Video-Insights---Reports)

### Contact
- 👨‍💻 Developer: Aditya Shenvi
- 🌐 Website: [www.adityacuz.dev](https://www.adityacuz.dev)

---

## ✅ Success Checklist

- [ ] Deployed or running locally
- [ ] Backend health check passes
- [ ] Frontend loads successfully
- [ ] Uploaded first video
- [ ] Ran segmentation
- [ ] Ran AI analysis
- [ ] Generated report
- [ ] Explored dashboard
- [ ] Checked system health
- [ ] Read documentation

---

**🎉 Welcome to Ciousten V1.2!**

You're all set to start analyzing videos with AI. If you have any questions, check the documentation or reach out to the community.

**Happy Analyzing! 🎥✨**

---

**Made by Aditya Shenvi @2025**  
**Version**: 1.2.0  
**License**: MIT  
**Status**: Production Ready ✅
