#!/bin/bash

# Start Backend with Auto-Restart
# This script keeps the backend running even if it crashes

cd "$(dirname "$0")/../backend"

while true; do
    echo "[$(date)] Starting backend server..."
    python3 app_mongodb.py 2>&1 | tee -a ../logs/backend.log
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo "[$(date)] Backend stopped cleanly"
        break
    else
        echo "[$(date)] Backend crashed with exit code $EXIT_CODE. Restarting in 5 seconds..."
        sleep 5
    fi
done
