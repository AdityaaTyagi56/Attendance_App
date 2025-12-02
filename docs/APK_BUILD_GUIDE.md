# 📱 Quick APK Build & Deploy

## ✅ Mobile Setup Complete

### Features:
1. **CORS for Mobile**: Backend allows all origins for development
2. **Cleartext HTTP**: Configured Android to allow HTTP traffic
3. **Dynamic API URLs**: Configurable via environment variables
4. **Error Handling**: Comprehensive logging for debugging
5. **AI Integration**: Gemini API powered features

---

## 🚀 Build APK Now

### 1. Verify Backend is Running
```bash
./scripts/check-status.sh
```
Expected output: ✓ Backend and Frontend running

### 2. Configure API URL for Mobile

Edit `.env.production` with your computer's local IP:
```bash
# Find your IP
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'

# Update .env.production
echo "VITE_API_URL=http://YOUR_IP:5001/api" > .env.production
```

### 3. Build APK

**Option A: Command Line (Faster)**
```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

**Option B: Android Studio (Recommended)**
1. Run `npm run build && npx cap sync android`
2. Open `android/` folder in Android Studio
3. Wait for Gradle sync
4. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
5. Find APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

### 4. Install on Phone
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
- ✅ Backend running: `./scripts/start-all.sh`
- ✅ Test backend from phone browser: `http://YOUR_IP:5001/api/health`

### Test These Features:
1. **Attendance Report** (Teacher → Course → Generate Report)
2. **Student Summary** (Teacher → Students → View Details)
3. **Chatbot** (Click chat icon)
4. **Attendance Prediction** (Student Dashboard)

---

## 🐛 Debugging

### View Mobile Logs:
1. Connect phone via USB
2. Enable USB debugging on phone
3. Chrome → `chrome://inspect`
4. Click "Inspect" on your device
5. Check Console for API logs

### Common Issues:

**"Failed to fetch"**
- Check phone is on same WiFi as laptop
- Verify `.env.production` has correct IP
- Rebuild: `npm run build && npx cap sync android`

**"CORS error"**
- Backend allows all origins - restart backend if needed

**"Too slow"**
- First Gemini call may need a few extra seconds
- Wait 15-20 seconds for the initial AI response

---

## 📦 Current Configuration

**Backend**: Runs on port 5001
- ✅ CORS: Allows all origins
- ✅ MongoDB: Cloud connected
- ✅ Gemini: AI features ready

**Frontend**: Configurable via `.env.production`
- ✅ Capacitor: Android configured
- ✅ Logging: Console logs enabled

---

## 📍 File Locations

- **APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Backend**: `backend/app_mongodb.py`
- **Logs**: `logs/backend.log` and `logs/frontend.log`
- **Config**: `.env.production`, `capacitor.config.ts`

---

## 🆘 Need Help?

```bash
# Check everything
./scripts/check-status.sh

# View backend logs
tail -f logs/backend.log

# Rebuild everything
./scripts/stop-all.sh
./scripts/start-all.sh
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

**APK is ready to install!** 🎉
