# 📱 Quick APK Build & Deploy

## ✅ All Mobile Fixes Applied

### What Was Fixed:
1. **CORS for Mobile**: Added `capacitor://localhost` and dynamic network IP support
2. **Cleartext HTTP**: Configured Android to allow HTTP traffic
3. **API URLs**: Updated to use network IP (192.168.0.217) by default
4. **Error Handling**: Added comprehensive logging for debugging
5. **Network Access**: Backend accepts requests from mobile origins

---

## 🚀 Build APK Now

### 1. Verify Backend is Running
```bash
./check-status.sh
```
Expected output: ✓ Backend and Frontend running

### 2. Build APK (Two Options)

**Option A: Command Line (Faster)**
```bash
cd android
./gradlew assembleDebug
```

**Option B: Android Studio (Recommended)**
1. Open `android/` folder in Android Studio
2. Wait for Gradle sync
3. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
4. Find APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

### 3. Install on Phone
```bash
# If you have ADB setup
adb install android/app/build/outputs/apk/debug/app-debug.apk

# OR transfer APK to phone via:
# - Email attachment
# - Cloud storage
# - USB transfer
# Then install manually (enable "Install from Unknown Sources")
```

---

## 🧪 Test AI Features

### Prerequisites:
- ✅ Phone and laptop on **same WiFi network**
- ✅ Backend running: `./start-all.sh`
- ✅ Test backend from phone browser: `http://192.168.0.217:5001/api/health`

### Test These Features:
1. **Attendance Report** (Teacher → Course → Generate Report)
2. **Student Summary** (Teacher → Students → View Details)
3. **Chatbot** (Click chat icon)
4. **Attendance Prediction** (Student Dashboard)

---

## 🔧 If Your IP Changes

When you connect to different WiFi:

```bash
# 1. Get new IP
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'

# 2. Update .env.production
echo "VITE_API_URL=http://NEW_IP:5001/api" > .env.production

# 3. Rebuild
npm run build
npx cap sync android

# 4. Rebuild APK
cd android && ./gradlew assembleDebug
```

---

## 🐛 Debugging

### View Mobile Logs:
1. Connect phone via USB
2. Enable USB debugging on phone
3. Chrome → `chrome://inspect`
4. Click "Inspect" on your device
5. Check Console for logs like:
   - `[OllamaService] API Base URL: http://192.168.0.217:5001/api`
   - `[OllamaService] Response status: 200`

### Common Issues:

**"Failed to fetch"**
- Check phone is on same WiFi
- Test: `http://192.168.0.217:5001/api/health` in phone browser
- Restart backend: `./start-all.sh`

**"CORS error"**
- Already fixed! Backend now allows mobile origins

**"Too slow"**
- Ollama may be slow on first request (model loading)
- Wait 30-60 seconds for first AI response

---

## 📦 Current Configuration

**Backend**: http://192.168.0.217:5001
- ✅ CORS: Allows capacitor://, ionic://, and network IPs
- ✅ Cleartext: Enabled for HTTP
- ✅ MongoDB: Connected
- ✅ Ollama: llama3:latest ready

**Frontend**: Built with production config
- ✅ API URL: http://192.168.0.217:5001/api
- ✅ Capacitor: Android configured
- ✅ Logging: Console logs enabled

---

## ✅ Pre-Install Checklist

Before giving APK to someone:
- [ ] Backend running on your laptop
- [ ] Both devices on same WiFi
- [ ] Backend accessible: `curl http://192.168.0.217:5001/api/health`
- [ ] APK built successfully
- [ ] Tested on your own phone first

---

## 📍 File Locations

- **APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Backend**: `backend/app_mongodb.py` (running with PID in `backend.pid`)
- **Logs**: `backend.log` and `frontend.log`
- **Config**: `.env.production`, `capacitor.config.ts`

---

## 🆘 Need Help?

```bash
# Check everything
./check-status.sh

# View backend logs
tail -f backend.log

# Rebuild everything
./stop-all.sh
./start-all.sh
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

**APK is ready to install!** 🎉
Location: `android/app/build/outputs/apk/debug/app-debug.apk`
