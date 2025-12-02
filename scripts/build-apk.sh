#!/bin/bash

# IIIT-NR Attendance - APK Build Script

echo "🚀 Building APK for IIIT-NR Attendance App"
echo ""

# Check current IP
echo "📡 Checking network IP..."
CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "Current IP: $CURRENT_IP"
echo ""

echo "⚠️  IMPORTANT: Ensure .env.production has the correct VITE_API_URL"
echo "   It should be: VITE_API_URL=http://$CURRENT_IP:5001/api"
echo "   Current content of .env.production:"
if [ -f .env.production ]; then
    cat .env.production
else
    echo "   (.env.production file not found)"
fi
echo ""
echo "Press ENTER to continue with build, or Ctrl+C to cancel and edit .env.production"
read -r
echo ""

# Build web app
echo "📦 Building web app..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo ""

# Sync to Android
echo "🔄 Syncing to Android..."
npx cap sync android
if [ $? -ne 0 ]; then
    echo "❌ Sync failed!"
    exit 1
fi
echo ""

echo "✅ Build complete!"
echo ""
echo "Next steps:"
echo "1. Open in Android Studio: npx cap open android"
echo "2. Build APK: Build > Build Bundle(s) / APK(s) > Build APK(s)"
echo "3. Find APK in: android/app/build/outputs/apk/debug/"
echo ""
echo "Make sure backend is running before installing on phone:"
echo "  cd backend && python3 app_mongodb.py"
echo ""
echo "Your phone must be on the same WiFi network!"
echo "Backend will be accessible at: http://$CURRENT_IP:5001"
