#!/bin/bash

# Start Both Frontend and Backend
# This script manages both services with proper logging and error handling

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_LOG="$PROJECT_DIR/backend.log"
FRONTEND_LOG="$PROJECT_DIR/frontend.log"
BACKEND_PID_FILE="$PROJECT_DIR/backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/frontend.pid"

echo "===================================="
echo "IIIT-NR Attendance System Launcher"
echo "===================================="
echo ""

# Check/Start Ollama
echo "Checking Ollama Service..."
if ! lsof -ti:11434 > /dev/null 2>&1; then
    echo "Ollama is not running. Starting Ollama..."
    nohup ollama serve > /dev/null 2>&1 &
    echo "Waiting for Ollama to initialize..."
    sleep 5
    echo "✓ Ollama started"
else
    echo "✓ Ollama is already running"
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

# Wait for backend to start
sleep 3

# Verify backend is running
if ! lsof -ti:5001 > /dev/null 2>&1; then
    echo "❌ ERROR: Backend failed to start!"
    echo "Check logs: tail -f $BACKEND_LOG"
    exit 1
fi
echo "✓ Backend is running on port 5001"

# Start Frontend
echo ""
echo "Starting Frontend..."
cd "$PROJECT_DIR"
nohup npm run dev -- --host 0.0.0.0 --port 3001 </dev/null > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$FRONTEND_PID_FILE"
echo "Frontend started with PID: $FRONTEND_PID"

# Wait for frontend to start
sleep 5

# Verify frontend is running
if ! lsof -ti:3001 > /dev/null 2>&1; then
    echo "❌ ERROR: Frontend failed to start!"
    echo "Check logs: tail -f $FRONTEND_LOG"
    exit 1
fi
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
