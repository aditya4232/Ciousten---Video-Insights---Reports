# 🚀 Ciousten - Video Insights & Reports
## Complete Deployment Guide (Free & Open Source)

This guide covers deploying Ciousten to **free cloud providers** for a fully working production environment.

---

## 🎯 Deployment Options

| Frontend | Backend | Cost | Difficulty |
|----------|---------|------|------------|
| Vercel | Railway | FREE | Easy |
| Vercel | Render | FREE | Easy |
| Netlify | Railway | FREE | Medium |
| Docker (Self-hosted) | Docker | Self-hosted | Medium |

---

## 📋 Prerequisites

1. **GitHub Account** - Push your code to a GitHub repository
2. **OpenRouter API Key** - Get free from [openrouter.ai](https://openrouter.ai)
3. Accounts on your chosen platforms (all free tier available)

---

## 🌐 Option 1: Vercel (Frontend) + Railway (Backend)

### Step 1: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `Ciousten---Video-Insights---Reports` repository
4. Railway will auto-detect the Dockerfile in `/backend`
5. Add environment variables:
   - `OPENROUTER_API_KEY` = your API key
   - `PORT` = 8000 (Railway sets this automatically)
6. Click **Deploy**
7. Copy your Railway URL (e.g., `https://your-app.up.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **"Import Project"** → Select your repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = Your Railway backend URL
5. Click **Deploy**

### Step 3: Update CORS (Optional)

Update `backend/app/main.py` to include your Vercel domain:

```python
allow_origins=[
    "http://localhost:3000",
    "https://your-app.vercel.app",  # Add your Vercel URL
]
```

---

## 🌐 Option 2: Vercel + Render

### Step 1: Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign up
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: ciousten-api
   - **Root Directory**: backend
   - **Environment**: Docker
   - **Region**: Oregon (or closest)
5. Add environment variables:
   - `OPENROUTER_API_KEY` = your key
   - `PORT` = 8000
6. Click **Create Web Service**
7. Copy your Render URL

### Step 2: Deploy Frontend to Vercel

Same as Option 1, Step 2 - use Render URL for `NEXT_PUBLIC_API_URL`

---

## 🐳 Option 3: Docker Self-Hosted

### Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/Ciousten---Video-Insights---Reports.git
cd Ciousten---Video-Insights---Reports

# Configure environment
cd backend
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# Deploy with Docker
cd ..
docker-compose up --build -d
```

### Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## ⚙️ Environment Variables

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | OpenRouter API key | Yes |
| `PORT` | Server port (default: 8000) | No |
| `FRAME_EXTRACTION_FPS` | Frames per second to process | No |
| `YOLO_CONFIDENCE` | Detection confidence (0-1) | No |

### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes (for production) |

---

## ✅ Post-Deployment Verification

1. **Check Backend Health**:
   ```bash
   curl https://your-backend-url/health
   # Should return: {"status": "healthy"}
   ```

2. **Check API**:
   ```bash
   curl https://your-backend-url/api/projects
   # Should return: []
   ```

3. **Test Frontend**: Visit your Vercel URL and try:
   - Upload a video
   - Run segmentation
   - Run AI analysis
   - Generate reports

---

## 🔧 Troubleshooting

### Backend won't start

- Check logs for missing dependencies
- Verify `OPENROUTER_API_KEY` is set
- Ensure `PORT` is correctly configured

### Frontend can't reach backend

- Verify `NEXT_PUBLIC_API_URL` in Vercel settings
- Check CORS configuration in backend
- Ensure backend is running and healthy

### API returns 500 errors

- Check backend logs for Python errors
- Verify OpenRouter API key is valid
- Ensure all environment variables are set

---

## 📊 Recommended Free Tier Limits

| Service | Free Tier |
|---------|-----------|
| Railway | 500 hours/month, $5 credit |
| Render | 750 hours/month |
| Vercel | Unlimited (hobby) |
| OpenRouter | Free models available |

---

## 🔒 Security Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use environment variables** for all secrets
3. **Enable HTTPS** - All recommended platforms provide this
4. **Update CORS** for production domains only

---

## 🆘 Support

- **Documentation**: Check [README.md](README.md)
- **Issues**: Create a GitHub issue
- **Author**: [Aditya Shenvi](https://www.adityacuz.dev)

---

**Made with ❤️ by Aditya Shenvi @2025**
