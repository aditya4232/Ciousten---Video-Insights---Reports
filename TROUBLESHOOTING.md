# 🚀 Deployment Troubleshooting Guide

## Current Issues (Dec 9, 2025)

### Errors Observed:
1. ❌ **404 on `/api/session`** - Backend endpoint not responding
2. ❌ **CORS policy blocking** - Frontend can't reach backend
3. ❌ **ERR_FAILED on `/api/projects`** - API calls failing
4. ❌ **localhost:8000 connection refused** - Local backend not running

---

## 🔧 **Solution Steps**

### **Step 1: Verify Render Backend Deployment**

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Check `ciousten-api` service status**:
   - Should show "Live" (green)
   - If "Deploy failed" or "Build failed", check logs
3. **View Logs**:
   - Click on the service → "Logs" tab
   - Look for errors during startup
   - Verify it says: `✅ Database initialized` and `✅ Directories ready`

### **Step 2: Test Backend Directly**

Open these URLs in your browser to verify backend is working:

```
https://ciousten-video-insights-reports.onrender.com/
https://ciousten-video-insights-reports.onrender.com/health
https://ciousten-video-insights-reports.onrender.com/docs
```

**Expected Responses:**
- `/` → JSON with message, version, author
- `/health` → `{"status": "healthy"}`
- `/docs` → FastAPI Swagger UI

If these **don't work**, the backend isn't deployed properly.

---

### **Step 3: Fix Backend Deployment (if failing)**

#### **Common Issues:**

**A. Docker Image Too Large (>512MB on free tier)**
- Check Render logs for "image size exceeded"
- Solution: Optimize Dockerfile (already done in current version)

**B. Missing Environment Variables**
- Go to Render Dashboard → `ciousten-api` → Environment
- Ensure these are set:
  ```
  PORT=8000
  PYTHONUNBUFFERED=1
  OPENROUTER_API_KEY=<your-key>
  ```

**C. Health Check Failing**
- Render expects `/health` to return 200 OK
- Current config: `healthCheckPath: /health` in `render.yaml`
- Verify in logs that uvicorn starts successfully

**D. Build Timeout**
- Free tier has limited build time
- Check if build is timing out in logs
- Solution: Reduce dependencies or use pre-built images

---

### **Step 4: Configure Vercel Frontend**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (`ciousten-frontend-1`)
3. **Go to Settings → Environment Variables**
4. **Add this variable:**
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://ciousten-video-insights-reports.onrender.com
   Environment: Production
   ```
5. **Redeploy** the frontend:
   - Go to "Deployments" tab
   - Click "..." on latest deployment → "Redeploy"

---

### **Step 5: Verify CORS Configuration**

The backend already has CORS configured correctly in `backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ Allows all origins
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
```

**If still getting CORS errors:**
- Make sure backend is actually running (Step 2)
- Clear browser cache
- Try in incognito mode

---

### **Step 6: Test the Connection**

After fixing backend and redeploying frontend:

1. **Open your frontend**: https://ciousten-frontend-1.vercel.app
2. **Open Browser DevTools** (F12)
3. **Go to Console tab**
4. **Check for errors**:
   - Should NOT see CORS errors
   - Should NOT see 404 errors
   - API calls should succeed

---

## 🐛 **Debugging Commands**

### Test Backend Health (from terminal):
```bash
curl https://ciousten-video-insights-reports.onrender.com/health
```

### Test Backend API:
```bash
curl https://ciousten-video-insights-reports.onrender.com/api/projects
```

### Test CORS:
```bash
curl -H "Origin: https://ciousten-frontend-1.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://ciousten-video-insights-reports.onrender.com/api/projects
```

Expected response should include:
```
access-control-allow-origin: *
access-control-allow-methods: *
```

---

## 📋 **Checklist**

- [ ] Backend service is "Live" on Render
- [ ] `/health` endpoint returns 200 OK
- [ ] `/docs` shows FastAPI Swagger UI
- [ ] `NEXT_PUBLIC_API_URL` is set in Vercel
- [ ] Frontend redeployed after env var change
- [ ] No CORS errors in browser console
- [ ] API calls succeed from frontend

---

## 🆘 **If Still Not Working**

### Option 1: Redeploy Backend from Scratch
1. Delete the service on Render
2. Create new service using `render.yaml`
3. Wait for deployment to complete
4. Update Vercel env var with new URL

### Option 2: Use Railway Instead of Render
Railway has better free tier for Docker deployments:
1. Connect GitHub repo to Railway
2. Deploy backend service
3. Update `NEXT_PUBLIC_API_URL` in Vercel

### Option 3: Run Backend Locally (Development)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Then update frontend to use `http://localhost:8000`

---

## 📝 **Next Steps**

1. **Check Render Dashboard** - Is backend actually deployed?
2. **Test backend URLs** - Do they respond?
3. **Set Vercel env var** - Is `NEXT_PUBLIC_API_URL` configured?
4. **Redeploy frontend** - After env var change
5. **Test in browser** - Check DevTools console

---

**Made by Aditya Shenvi @2025** | [www.adityacuz.dev](https://www.adityacuz.dev)
