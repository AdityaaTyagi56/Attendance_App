# IIIT-NR Attendance App - Quick Start Guide

## Integration Complete! 🎉

Your app now uses a Flask backend that integrates with Google Gemini 2.5 Flash. This architecture works for both web and mobile apps.

## Quick Start

### 1. Configure Gemini Access

1. Create an API key at [Google AI Studio](https://makersuite.google.com/app/apikey).
2. Add the key to `backend/.env` as `GEMINI_API_KEY`.
3. Optionally set `GEMINI_MODEL=gemini-2.5-flash` (default) or another supported Gemini model.

### 2. Start Flask Backend

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (first time only)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Run the backend
python app.py
```

The backend will start on `http://localhost:5001`

### 3. Start Frontend (Web App)

```bash
# In a new terminal, from the project root
npm install  # First time only
npm run dev
```

The frontend will start on `http://localhost:3000`

## Testing the Integration

1. Open `http://localhost:3000` in your browser
2. Login as a teacher
3. Try generating an attendance report (uses AI)
4. Login as a student
5. Try the "Get AI-Powered Summary" button

## For Mobile App Development

### React Native / Expo Setup

If you want to build a mobile app, the backend is already configured for mobile clients:

1. **Update API URL for mobile testing:**
   
   Find your computer's IP address:
   ```bash
   # macOS:
   ipconfig getifaddr en0
   # Or check System Preferences > Network
   ```

2. **Update `.env.local` for mobile:**
   ```env
   VITE_API_URL=http://YOUR_IP_ADDRESS:5000/api
   ```

3. **Create React Native app** (if needed):
   ```bash
   npx create-expo-app mobile-attendance
   cd mobile-attendance
   npm install axios
   ```

4. **Use the same API endpoints** from your mobile app:
   ```javascript
   // In your React Native app
   import axios from 'axios';

   const API_URL = 'http://YOUR_COMPUTER_IP:5001/api';

   async function getAttendanceSummary(course, students, records) {
     const response = await axios.post(`${API_URL}/attendance/summary`, {
       course,
       students,
       records,
     });
     return response.data;
   }
   ```

## Architecture Overview

```
┌─────────────────┐
│   Web/Mobile    │
│   Frontend      │
└────────┬────────┘
         │ HTTP/HTTPS
         ▼
┌─────────────────┐
│  Flask Backend  │
│   (Port 5000)   │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   Gemini API    │
│  (Google Cloud) │
└─────────────────┘
```

**Benefits:**
- ✅ No CORS issues
- ✅ Works for web and mobile
- ✅ Centralized AI logic
- ✅ Secure (API keys on backend only)
- ✅ Easy to deploy and scale

## Environment Variables

### Frontend (`.env.local`)
```env
VITE_API_URL=http://localhost:5001/api
```

### Backend (`backend/.env`)
```env
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.5-flash
PORT=5001
```

## Troubleshooting

### Backend won't start
- Make sure Python 3.8+ is installed: `python3 --version`
- Activate virtual environment: `source backend/venv/bin/activate`
- Install dependencies: `pip install -r backend/requirements.txt`

### Gemini API errors
- Ensure `GEMINI_API_KEY` is present in `backend/.env`
- Confirm the key has access to the Gemini model you're requesting
- Inspect backend logs for detailed error codes returned by the Gemini SDK

### Frontend can't connect to backend
- Verify backend is running on port 5001
- Check `VITE_API_URL` in `.env.local`
- Look for CORS errors in browser console

### Mobile app can't connect
- Use your computer's local IP, not `localhost`
- Ensure mobile device is on the same WiFi network
- Update CORS origins in `backend/app.py` if needed

## Next Steps

- [ ] Test all AI features in the web app
- [ ] Deploy backend to a cloud service (Railway, Render, etc.)
- [ ] Build React Native mobile app
- [ ] Add authentication to backend API
- [ ] Implement caching for faster responses

See `backend/README.md` for detailed backend documentation.
