#!/bin/bash

# Start Both Frontend and Backend
# This script manages both services with proper logging and error handling

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_LOG="$PROJECT_DIR/logs/backend.log"
FRONTEND_LOG="$PROJECT_DIR/logs/frontend.log"
BACKEND_PID_FILE="$PROJECT_DIR/logs/backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/logs/frontend.pid"
ENV_FILE="$PROJECT_DIR/backend/.env"

# Load backend environment variables so GEMINI_* settings are available
if [ -f "$ENV_FILE" ]; then
    set -a
    # shellcheck source=/dev/null
    source "$ENV_FILE"
    set +a
fi

echo "===================================="
echo "IIIT-NR Attendance System Launcher"
echo "===================================="
echo ""

# Verify Gemini API key
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠ GEMINI_API_KEY is not set. AI features will fail until you export it."
else
    echo "✓ GEMINI_API_KEY detected"
fi

# Kill existing processes on ports
echo "Checking for existing processes..."
if lsof -ti:5001 > /dev/null 2>&1; then
    echo "Stopping existing backend on port 5001..."
    lsof -ti:5001 | xargs kill -9 2>/dev/null
    sleep 2
fi

if lsof -ti:3001 > /dev/null 2>&1; then
    echo "Stopping existing frontend on port 3001..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Start Backend
echo ""
echo "Starting Backend..."
cd "$PROJECT_DIR/backend"
nohup python3 app_mongodb.py > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$BACKEND_PID_FILE"
echo "Backend started with PID: $BACKEND_PID"

# Wait for backend to start (up to 30 seconds)
echo "Waiting for backend to initialize..."
MAX_RETRIES=30
COUNT=0
while ! lsof -ti:5001 > /dev/null 2>&1; do
    sleep 1
    COUNT=$((COUNT+1))
    if [ $COUNT -ge $MAX_RETRIES ]; then
        echo "❌ ERROR: Backend failed to start after $MAX_RETRIES seconds!"
        echo "Check logs: tail -f $BACKEND_LOG"
        exit 1
    fi
done
echo "✓ Backend is running on port 5001"

# Start Frontend
echo ""
echo "Starting Frontend..."
cd "$PROJECT_DIR"
nohup npm run dev -- --host 0.0.0.0 --port 3001 </dev/null > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$FRONTEND_PID_FILE"
echo "Frontend started with PID: $FRONTEND_PID"

# Wait for frontend to start (up to 30 seconds)
echo "Waiting for frontend to initialize..."
MAX_RETRIES=30
COUNT=0
while ! lsof -ti:3001 > /dev/null 2>&1; do
    sleep 1
    COUNT=$((COUNT+1))
    if [ $COUNT -ge $MAX_RETRIES ]; then
        echo "❌ ERROR: Frontend failed to start after $MAX_RETRIES seconds!"
        echo "Check logs: tail -f $FRONTEND_LOG"
        exit 1
    fi
done
echo "✓ Frontend is running on port 3001"

# Get network IP
NETWORK_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo ""
echo "===================================="
echo "✅ ALL SERVICES RUNNING"
echo "===================================="
echo ""
echo "📱 Access URLs:"
echo "   Frontend: http://$NETWORK_IP:3001"
echo "   Backend:  http://$NETWORK_IP:5001/api/health"
echo ""
echo "📊 Process IDs:"
echo "   Backend:  $BACKEND_PID (saved to backend.pid)"
echo "   Frontend: $FRONTEND_PID (saved to frontend.pid)"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f $BACKEND_LOG"
echo "   Frontend: tail -f $FRONTEND_LOG"
echo ""
echo "🛑 To stop services:"
echo "   ./stop-all.sh"
echo ""
