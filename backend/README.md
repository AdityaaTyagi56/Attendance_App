# Flask Backend for IIIT-NR Attendance App

This Flask backend integrates Ollama Llama 3 for AI-powered attendance analysis and provides API endpoints for both web and mobile clients.

## Prerequisites

1. **Python 3.8+** installed
2. **Ollama** installed and running with Llama 3 model

## Setup Instructions

### 1. Install Ollama and Llama 3

```bash
# Install Ollama (if not already installed)
# macOS/Linux:
curl -fsSL https://ollama.com/install.sh | sh

# Pull Llama 3 model
ollama pull llama3

# Start Ollama server (if not running)
ollama serve
```

### 2. Set Up Python Virtual Environment

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Edit the `.env` file if needed:
```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3
PORT=5000
```

### 4. Run the Backend

```bash
# Make sure virtual environment is activated
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```http
GET /api/health
```
Check if the backend and Ollama are running properly.

### Generate Attendance Summary
```http
POST /api/attendance/summary
Content-Type: application/json

{
  "course": {
    "id": "course1",
    "name": "Computer Science",
    "code": "CS101",
    "studentIds": ["student1", "student2"]
  },
  "students": [
    {"id": "student1", "name": "John Doe", "studentId": "2024001"}
  ],
  "records": [
    {"courseId": "course1", "date": "2024-01-15", "presentStudentIds": ["student1"]}
  ]
}
```

### Generate Student Summary
```http
POST /api/student/summary
Content-Type: application/json

{
  "student": {"id": "student1", "name": "John Doe", "studentId": "2024001"},
  "courses": [...],
  "records": [...]
}
```

### Generate Attendance Goal
```http
POST /api/student/goal
Content-Type: application/json

{
  "studentName": "John Doe",
  "courseName": "Computer Science",
  "currentPercentage": 75
}
```

### Predict Attendance Performance
```http
POST /api/student/prediction
Content-Type: application/json

{
  "studentName": "John Doe",
  "courseName": "Computer Science",
  "recentRecords": [
    {"date": "2024-01-15", "isPresent": true},
    {"date": "2024-01-16", "isPresent": false}
  ]
}
```

## Mobile App Integration

### For React Native / Expo Mobile App

```javascript
// API client for mobile app
const API_BASE_URL = 'http://10.25.196.34:5001/api'; // Use your server IP for mobile testing

// Example: Generate attendance summary
async function getAttendanceSummary(course, students, records) {
  const response = await fetch(`${API_BASE_URL}/attendance/summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ course, students, records }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate summary');
  }
  
  return await response.json();
}
```

### Testing with Mobile Device

When testing on a physical mobile device or emulator:

1. Find your computer's local IP address:
   ```bash
   # macOS/Linux:
   ifconfig | grep "inet "
   # or
   ipconfig getifaddr en0
   ```

2. Update the API URL in your mobile app:
   ```javascript
   const API_BASE_URL = 'http://10.25.196.34:5001/api';
   ```

3. Make sure your mobile device is on the same WiFi network as your computer

## Deployment

### For Production (e.g., Render, Railway, Heroku)

1. Add a `Procfile`:
   ```
   web: gunicorn app:app
   ```

2. Update `requirements.txt`:
   ```
   Flask==3.0.0
   flask-cors==4.0.0
   requests==2.31.0
   gunicorn==21.2.0
   ```

3. Set environment variables in your hosting platform:
   - `OLLAMA_URL`: URL of your Ollama instance (can be self-hosted)
   - `OLLAMA_MODEL`: `llama3`

## Troubleshooting

### Ollama Not Connected
- Ensure Ollama is running: `ollama serve`
- Check if Llama 3 is available: `ollama list`
- Verify OLLAMA_URL in `.env` is correct

### CORS Errors
- Update the `CORS` origins in `app.py` to include your frontend URL
- For mobile apps, ensure you're using the correct server IP address

### Slow Response Times
- Llama 3 inference can be slow on CPU
- Consider using a GPU-enabled server for production
- Adjust `max_tokens` parameter to reduce response length
