#!/bin/bash

# Check Status of Services

echo "===================================="
echo "Service Status Check"
echo "===================================="
echo ""

# Get network IP
NETWORK_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

# Check Backend
echo "Backend (Port 5001):"
if lsof -ti:5001 > /dev/null 2>&1; then
    BACKEND_PID=$(lsof -ti:5001)
    echo "  ✓ Running (PID: $BACKEND_PID)"
    echo "  URL: http://$NETWORK_IP:5001/api/health"
    
    # Test health endpoint
    if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
        echo "  ✓ Health check passed"
    else
        echo "  ⚠ Health check failed"
    fi
else
    echo "  ❌ Not running"
fi

echo ""

# Check Frontend
echo "Frontend (Port 3001):"
if lsof -ti:3001 > /dev/null 2>&1; then
    FRONTEND_PID=$(lsof -ti:3001 | head -1)
    echo "  ✓ Running (PID: $FRONTEND_PID)"
    echo "  URL: http://$NETWORK_IP:3001"
    
    # Test if serving content
    if curl -s http://localhost:3001 | grep -q "DOCTYPE" 2>/dev/null; then
        echo "  ✓ Serving content"
    else
        echo "  ⚠ Not responding properly"
    fi
else
    echo "  ❌ Not running"
fi

echo ""

# Check Ollama
echo "Ollama (Port 11434):"
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "  ✓ Running and accessible"
else
    echo "  ⚠ Not accessible (run: ollama serve)"
fi

echo ""
