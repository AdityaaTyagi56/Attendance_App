# Quick Start Guide - Mobile APK Installation

## Your Setup
- **Backend IP**: 10.25.196.34
- **Backend Port**: 5001
- **Frontend Port**: 3001

## Step 1: Build the APK

Run the automated build script:

```bash
./build-apk.sh
```

Or manually:

```bash
# 1. Build web app (uses .env.production with your network IP)
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Open Android Studio
npx cap open android
```

## Step 2: Generate APK in Android Studio

1. Wait for Android Studio to open and Gradle sync to complete
2. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for build to complete (notification will appear)
4. Click **"locate"** in the notification
5. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

## Step 3: Install on Your Phone

### Method A: Direct Transfer
1. Copy `app-debug.apk` to your phone (via USB, email, or cloud)
2. Open the APK file on your phone
3. Allow installation from unknown sources if prompted
4. Install the app

### Method B: ADB (if connected via USB with USB Debugging enabled)
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Step 4: Start Backend Services

Before opening the app on your phone, start the backend:

```bash
# Terminal 1: Start backend
cd backend
python3 app_mongodb.py

# Terminal 2 (if needed): Start Ollama (if not already running)
ollama serve
```

You should see:
```
✓ Connected to MongoDB
✓ Connected to Ollama at http://localhost:11434
✓ Using model: llama3:latest
🚀 Starting Flask backend on port 5001...
 * Running on http://10.25.196.34:5001
```

## Step 5: Connect Your Phone

1. **Connect phone to the SAME WiFi network** as your computer
2. Open the IIIT-NR Attendance app on your phone
3. The app will connect to `http://10.25.196.34:5001/api`

## Testing the Connection

On your phone's browser, visit: `http://10.25.196.34:5001/api/health`

You should see:
```json
{
  "status": "ok",
  "ollama_status": "ok",
  "mongodb_status": "ok"
}
```

## If Your IP Changes

Your computer's IP may change when you reconnect to WiFi. To update:

1. Find new IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. Update `.env.production`:
   ```bash
   echo "VITE_API_URL=http://YOUR_NEW_IP:5001/api" > .env.production
   ```

3. Rebuild:
   ```bash
   ./build-apk.sh
   ```

4. Rebuild APK in Android Studio

5. Reinstall on phone

## Troubleshooting

### "Cannot connect to server"
- ✓ Phone and computer on same WiFi?
- ✓ Backend running? Check terminal for Flask output
- ✓ IP correct? Check backend logs for IP address
- ✓ Firewall blocking port 5001? (Temporarily disable to test)

### "AI features not working"
- ✓ Ollama running? `ollama list` to check
- ✓ Check backend logs for Ollama connection
- ✓ Test directly: `curl http://localhost:11434/api/tags`

### App installs but won't open
- ✓ Check Android version (needs Android 5.0+)
- ✓ Rebuild with: `npm run build && npx cap sync android`
- ✓ Check Android Studio build logs for errors

## Using on Different Networks

If you want to use the app when NOT on your home WiFi:

### Option 1: USB Tethering (Recommended for testing)
1. Enable USB tethering on your phone
2. Connect phone to computer via USB
3. Your computer will get internet through phone
4. The local network will still work

### Option 2: ngrok (Remote Access)
```bash
# Install ngrok
brew install ngrok

# Start tunnel
ngrok http 5001

# Update .env.production with ngrok URL
echo "VITE_API_URL=https://abc123.ngrok.io/api" > .env.production

# Rebuild
./build-apk.sh
```

**Note**: ngrok free tier URL changes every time you restart.

## Development Workflow

When making code changes:

```bash
# 1. Make changes to React components
# 2. Rebuild
npm run build

# 3. Sync to Android
npx cap sync android

# 4. Rebuild APK in Android Studio
# 5. Reinstall on phone
```

For backend changes, just restart the backend:
```bash
cd backend
python3 app_mongodb.py
```

## Current Status

✅ Backend configured for network access
✅ CORS configured for mobile requests
✅ Production environment file created
✅ Android project generated
✅ Permissions configured (Internet, Network, Camera)
✅ HTTP cleartext traffic enabled
✅ Build script created

**Ready to build APK!** Run `./build-apk.sh` to start.
