# Building APK for Android

This guide explains how to build and install the IIIT-NR Attendance app as an APK on your Android phone while keeping the AI features working.

## Prerequisites

1. **Node.js and npm** installed
2. **Android Studio** installed (for Android SDK)
3. **Java Development Kit (JDK)** 11 or higher

## Setup Steps

### 1. Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

### 2. Initialize Capacitor

```bash
npx cap init "IIIT-NR Attendance" "com.iiitnr.attendance" --web-dir=dist
```

### 3. Update Your Network IP

Your current local IP is: **10.25.196.34**

If your IP changes (when you reconnect to WiFi), update `.env.production`:

```bash
# Find your current IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Update .env.production with your new IP
echo "VITE_API_URL=http://YOUR_NEW_IP:5001/api" > .env.production
```

### 4. Build the Web App

```bash
npm run build
```

This builds the app using `.env.production` which points to your network IP.

### 5. Add Android Platform

```bash
npx cap add android
```

### 6. Configure Android Permissions

Edit `android/app/src/main/AndroidManifest.xml` and add these permissions:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
```

Also add this inside the `<application>` tag to allow HTTP connections:

```xml
<application
    android:usesCleartextTraffic="true"
    ...>
```

### 7. Sync Capacitor

```bash
npx cap sync android
```

### 8. Open in Android Studio

```bash
npx cap open android
```

### 9. Build APK in Android Studio

1. In Android Studio, go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Wait for the build to complete
3. Click "locate" in the notification to find the APK file
4. The APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

### 10. Install on Your Phone

**Option A: USB Transfer**
1. Connect your phone via USB
2. Copy the APK to your phone
3. Open the APK file and install (you may need to enable "Install from Unknown Sources")

**Option B: ADB Install**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Running the Backend

When using the app on your phone, make sure:

1. **Your phone and computer are on the SAME WiFi network**
2. **Backend is running on your computer:**
   ```bash
   cd backend
   python3 app_mongodb.py
   ```
3. **Ollama is running:**
   ```bash
   ollama serve
   ```

The app will connect to `http://10.25.196.34:5001/api` to use the AI features.

## Troubleshooting

### App can't connect to backend

1. Check if phone and computer are on same WiFi
2. Verify your IP hasn't changed: `ifconfig | grep "inet "`
3. Test backend from phone's browser: open `http://10.25.196.34:5001/api/health`
4. Check firewall isn't blocking port 5001

### IP Address Changed

If you reconnect to WiFi and your IP changes:

1. Find new IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
2. Update `.env.production` with new IP
3. Rebuild: `npm run build`
4. Sync: `npx cap sync android`
5. Rebuild APK in Android Studio

## Quick Rebuild Commands

After making changes to the web app:

```bash
# Rebuild web app
npm run build

# Sync to Android
npx cap sync android

# Open in Android Studio to rebuild APK
npx cap open android
```

## Alternative: Using ngrok (for remote access)

If you want to access the backend from anywhere (not just local WiFi):

1. Install ngrok: `brew install ngrok`
2. Start ngrok tunnel:
   ```bash
   ngrok http 5001
   ```
3. Copy the https URL (e.g., `https://abc123.ngrok.io`)
4. Update `.env.production`:
   ```
   VITE_API_URL=https://abc123.ngrok.io/api
   ```
5. Rebuild the app

**Note:** Ngrok free tier has session limits and URLs change on restart.
