# Deployment Guide - IIIT-NR Attendance

This guide walks you through deploying the app to free cloud platforms.

## Prerequisites

- ✅ GitHub account
- ✅ Code pushed to GitHub repository
- ✅ MongoDB Atlas account (already configured)
- ✅ Gemini API key (already have)

## Step 1: Deploy Backend to Render

### 1.1 Sign Up for Render

1. Go to [render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with GitHub

### 1.2 Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `AdityaaTyagi56/iiit-nr-attendance2`
3. Configure the service:
   - **Name**: `iiit-nr-attendance-backend`
   - **Region**: Oregon (Free)
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn app_mongodb:app --bind 0.0.0.0:$PORT --timeout 120 --workers 2`
   - **Plan**: Free

### 1.3 Add Environment Variables

Click "Advanced" → "Add Environment Variable" and add these:

```
GEMINI_API_KEY = AIzaSyDK_fzHOcONcMw1rQn_pImcppDdxTbfpVc
GEMINI_MODEL = gemini-2.0-flash
MONGODB_URI = mongodb+srv://Aditya:Aditya56at@cluster0.2knnowq.mongodb.net/attendance_db?appName=Cluster0
MONGODB_DB_NAME = attendance_db
FLASK_ENV = production
```

### 1.4 Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Once deployed, copy your backend URL (e.g., `https://iiit-nr-attendance-backend.onrender.com`)

### 1.5 Test Backend

Visit: `https://your-backend-url.onrender.com/api/health`

You should see:
```json
{
  "status": "ok",
  "ai_status": "ok",
  "ai_provider": "gemini-2.0-flash",
  "mongodb_status": "ok"
}
```

## Step 2: Deploy Frontend to Vercel

### 2.1 Update Environment Variable

First, update `.env.production` with your backend URL:

```bash
VITE_API_URL=https://your-backend-url.onrender.com/api
```

Commit and push this change to GitHub.

### 2.2 Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with GitHub

### 2.3 Import Project

1. Click "Add New..." → "Project"
2. Import `AdityaaTyagi56/iiit-nr-attendance2`
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.4 Add Environment Variable

1. Go to "Environment Variables"
2. Add:
   ```
   VITE_API_URL = https://your-backend-url.onrender.com/api
   ```
3. Select all environments (Production, Preview, Development)

### 2.5 Deploy

1. Click "Deploy"
2. Wait for deployment (2-3 minutes)
3. Once deployed, you'll get a URL like: `https://iiit-nr-attendance2.vercel.app`

## Step 3: Test the Deployed App

### 3.1 Access Frontend

1. Visit your Vercel URL
2. App should load successfully
3. Check if it connects to backend (should show "Connected" status)

### 3.2 Test Features

- ✅ View students
- ✅ View courses
- ✅ View attendance records
- ✅ Test AI features (summaries, predictions)

### 3.3 Test from Different Networks

1. Open on your phone (using mobile data, not WiFi)
2. Share URL with friends
3. Access from different city/country

## Troubleshooting

### Backend Issues

**Problem**: Backend shows "Service Unavailable"
- **Solution**: Render free tier sleeps after 15 min inactivity. First request wakes it up (may take 30-60 seconds)

**Problem**: MongoDB connection failed
- **Solution**: Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0 in Network Access)

**Problem**: Gemini API errors
- **Solution**: Verify API key is correct in Render environment variables

### Frontend Issues

**Problem**: "Cannot connect to backend"
- **Solution**: Verify `VITE_API_URL` is set correctly in Vercel
- **Solution**: Check backend health endpoint is accessible

**Problem**: 404 on page refresh
- **Solution**: `vercel.json` should handle SPA routing (already configured)

## Important Notes

### Free Tier Limitations

**Render**:
- Service sleeps after 15 minutes of inactivity
- 750 hours/month (enough for one service)
- First request after sleep takes 30-60 seconds

**Vercel**:
- 100GB bandwidth/month
- Unlimited deployments
- Fast global CDN

**MongoDB Atlas**:
- 512MB storage
- Shared cluster
- Good for development/testing

### Automatic Deployments

Both platforms auto-deploy when you push to GitHub:
- Push to `main` branch → automatic deployment
- See deployment logs in dashboard
- Rollback available if needed

## URLs Summary

After deployment, save these URLs:

- **Frontend**: `https://iiit-nr-attendance2.vercel.app`
- **Backend**: `https://iiit-nr-attendance-backend.onrender.com`
- **Backend Health**: `https://iiit-nr-attendance-backend.onrender.com/api/health`

## Next Steps

1. Share the frontend URL with users
2. Test all features thoroughly
3. Monitor usage in dashboards
4. Set up custom domain (optional, available on both platforms)
