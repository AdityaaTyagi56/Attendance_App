# Service Management Guide

## Quick Start Commands

### Start All Services
```bash
./start-all.sh
```
This will:
- Stop any existing services on ports 5001 and 3001
- Start the backend (Flask + MongoDB + Ollama)
- Start the frontend (React + Vite)
- Show access URLs and process information

### Check Status
```bash
./check-status.sh
```
Shows:
- Backend status and health check
- Frontend status and serving check
- Ollama availability
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
- **Frontend**: http://192.168.0.217:3001
- **Backend API**: http://192.168.0.217:5001/api/health

**Note**: Replace `192.168.0.217` with your current network IP if it changes.

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

### Ollama Not Working
1. Make sure Ollama is running:
   ```bash
   ollama serve
   ```

2. Check if the model is available:
   ```bash
   ollama list
   ```

3. Pull the model if missing:
   ```bash
   ollama pull llama3:latest
   ```

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
  - `OLLAMA_URL=http://localhost:11434`
  - `OLLAMA_MODEL=llama3:latest`
  - `PORT=5001`
  - `MONGODB_URI=mongodb+srv://...`
  - `MONGODB_DB_NAME=attendance_db`

### Frontend Configuration
- **Development**: `.env.local`
  - `VITE_API_URL=http://localhost:5001/api`
- **Production/APK**: `.env.production`
  - `VITE_API_URL=http://192.168.0.217:5001/api`

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
✅ **Ollama Integration**: Llama 3 AI features fully working  
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
   - Use network IP: http://192.168.0.217:3001
   - Build APK: `./build-apk.sh`
   - Install APK on device

4. **When done**:
   ```bash
   ./stop-all.sh
   ```

---

## Support

If services keep crashing:
1. Check logs in `backend.log` and `frontend.log`
2. Verify Ollama is running: `ollama list`
3. Test MongoDB connection in backend logs
4. Ensure no other apps are using ports 5001 or 3001
5. Run `./check-status.sh` to diagnose issues
