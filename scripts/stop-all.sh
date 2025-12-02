#!/bin/bash

# Stop All Services

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_PID_FILE="$PROJECT_DIR/logs/backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/logs/frontend.pid"

echo "Stopping all services..."

# Stop by PID files first
if [ -f "$BACKEND_PID_FILE" ]; then
    BACKEND_PID=$(cat "$BACKEND_PID_FILE")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
    fi
    rm "$BACKEND_PID_FILE"
fi

if [ -f "$FRONTEND_PID_FILE" ]; then
    FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
    fi
    rm "$FRONTEND_PID_FILE"
fi

# Kill by port as backup
if lsof -ti:5001 > /dev/null 2>&1; then
    echo "Force stopping backend on port 5001..."
    lsof -ti:5001 | xargs kill -9 2>/dev/null
fi

if lsof -ti:3001 > /dev/null 2>&1; then
    echo "Force stopping frontend on port 3001..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null
fi

echo "✓ All services stopped"
