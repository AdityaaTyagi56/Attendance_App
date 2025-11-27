#!/bin/bash

# Start Frontend with Auto-Restart
# This script keeps the frontend running even if it crashes

cd "$(dirname "$0")"

while true; do
    echo "[$(date)] Starting frontend server on port 3001..."
    npm run dev -- --host 0.0.0.0 --port 3001 2>&1 | tee -a frontend.log
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo "[$(date)] Frontend stopped cleanly"
        break
    else
        echo "[$(date)] Frontend crashed with exit code $EXIT_CODE. Restarting in 5 seconds..."
        sleep 5
    fi
done
