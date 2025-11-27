#!/bin/bash

# Test if phone can connect to backend
echo "🔍 Testing backend connectivity..."
echo ""
echo "Backend is running at: http://10.25.196.34:5001"
echo ""
echo "Test from your phone's browser:"
echo "  http://10.25.196.34:5001/api/health"
echo ""
echo "If it doesn't work, check:"
echo ""
echo "1. Are you on the same WiFi?"
echo "   - Computer WiFi: $(networksetup -getairportnetwork en0 | cut -d ':' -f2)"
echo ""
echo "2. Is the firewall blocking Python?"
echo "   Go to: System Settings > Network > Firewall"
echo "   Make sure Python is allowed"
echo ""
echo "3. Test with curl from this computer:"
curl -s http://10.25.196.34:5001/api/health | python3 -m json.tool
echo ""
