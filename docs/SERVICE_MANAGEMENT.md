# Service Management Guide

## Quick Start Commands

### Start All Services
```bash
./start-all.sh
```
This will:
- Stop any existing services on ports 5001 and 3001
- Start the backend (Flask + MongoDB + Gemini)
- Start the frontend (React + Vite)
- Show access URLs and process information

### Check Status
```bash
./check-status.sh
```
Shows:
- Backend status and health check
- Frontend status and serving check
- Gemini environment validation
- Access URLs

### Stop All Services
```bash
./stop-all.sh
```
Cleanly stops both backend and frontend services.

---

## Individual Service Management

### Backend Only
```bash
./start-backend.sh
```
Starts backend with auto-restart on crash.

### Frontend Only
```bash
./start-frontend.sh
```
Starts frontend with auto-restart on crash.

---

## Access URLs

### Local Development
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5001/api/health

### Network Access (Mobile Testing)
To access from mobile devices, find your computer's IP:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'
```
Then access at `http://YOUR_IP:3001` and `http://YOUR_IP:5001/api/health`

---

## Logs

### View Backend Logs
```bash
tail -f backend.log
```

### View Frontend Logs
```bash
tail -f frontend.log
```

### Clear Logs
```bash
rm backend.log frontend.log
```

---

## Troubleshooting

### Services Won't Start
1. Check if ports are already in use:
   ```bash
   lsof -ti:5001  # Backend
   lsof -ti:3001  # Frontend
   ```

2. Kill processes manually if needed:
   ```bash
   lsof -ti:5001 | xargs kill -9
   lsof -ti:3001 | xargs kill -9
   ```

3. Try starting again:
   ```bash
   ./start-all.sh
   ```

### Gemini API Issues
1. Confirm `GEMINI_API_KEY` is configured in `backend/.env` or your shell environment.
2. Ensure the key has access to the configured model (`GEMINI_MODEL`).
3. Review backend logs for detailed error messages returned by the Gemini SDK.

### MongoDB Connection Issues
- Check your `.env` file in the `backend/` directory
- Verify MongoDB Atlas connection string is correct
- Ensure network access is allowed in MongoDB Atlas

### Frontend Not Accessible on Network
1. Check macOS firewall settings:
   ```bash
   /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
   ```

2. Make sure your device is on the same WiFi network

3. Hard refresh browser (Cmd+Shift+R)

---

## Configuration Files

### Backend Configuration
- **Location**: `backend/.env`
- **Required Variables**:
   - `GEMINI_API_KEY=your_api_key`
   - `GEMINI_MODEL=gemini-2.5-flash`
  - `PORT=5001`
  - `MONGODB_URI=mongodb+srv://...`
  - `MONGODB_DB_NAME=attendance_db`

### Frontend Configuration
- **Development**: `.env.local`
  - `VITE_API_URL=http://localhost:5001/api`
- **Production/APK**: `.env.production`
  - `VITE_API_URL=http://YOUR_IP:5001/api` (update with your IP for mobile)

---

## Process Information

### Backend
- **Port**: 5001
- **Host**: 0.0.0.0 (accessible from network)
- **Process**: Python Flask app with threading enabled
- **PID File**: `backend.pid`

### Frontend
- **Port**: 3001
- **Host**: 0.0.0.0 (accessible from network)
- **Process**: Node/Vite dev server
- **PID File**: `frontend.pid`

---

## Features Fixed

✅ **Auto-Restart**: Services automatically restart if they crash  
✅ **Error Handling**: Better error messages and logging  
✅ **Process Management**: PID tracking for easy stopping  
✅ **Health Checks**: Automatic verification of service status  
✅ **Network Access**: Both services accessible from mobile devices  
✅ **Stable Backend**: No more crashes from Flask debug mode  
✅ **Gemini Integration**: AI features fully working via Google Generative AI  
✅ **MongoDB**: Atlas integration with all CRUD operations  

---

## Development Workflow

1. **Start services**:
   ```bash
   ./start-all.sh
   ```

2. **Develop and test**:
   - Access frontend at http://localhost:3001
   - Backend API at http://localhost:5001/api/health
   - Check logs: `tail -f backend.log frontend.log`

3. **Mobile testing**:
   - Update `.env.production` with your network IP
   - Build APK: `npm run build && npx cap sync android`
   - Install APK on device

4. **When done**:
   ```bash
   ./stop-all.sh
   ```

---

## Support

If services keep crashing:
1. Check logs in `backend.log` and `frontend.log`
2. Verify Gemini credentials are loaded in the backend environment
3. Test MongoDB connection in backend logs
4. Ensure no other apps are using ports 5001 or 3001
5. Run `./check-status.sh` to diagnose issues
