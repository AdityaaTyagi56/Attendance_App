#!/bin/bash

# IIIT-NR Attendance - APK Build Script

echo "🚀 Building APK for IIIT-NR Attendance App"
echo ""

# Check current IP
echo "📡 Checking network IP..."
CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "Current IP: $CURRENT_IP"
echo ""

# Check if IP in .env.production matches
if grep -q "$CURRENT_IP" .env.production; then
    echo "✅ IP matches .env.production"
else
    echo "⚠️  IP changed! Updating .env.production..."
    echo "VITE_API_URL=http://$CURRENT_IP:5001/api" > .env.production
    echo "Updated to: http://$CURRENT_IP:5001/api"
fi
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
