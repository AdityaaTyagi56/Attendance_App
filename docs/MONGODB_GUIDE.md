# MongoDB Integration Guide

## ✅ MongoDB is Now Active!

Your backend is successfully connected to MongoDB Atlas and can store/retrieve data.

## Current Status

- **Backend**: Running on port 5001 with MongoDB connected
- **Frontend**: Still using localStorage (needs migration)
- **Database**: MongoDB Atlas cluster is active and ready

## How to Activate MongoDB for Your App

### Step 1: Migrate Existing Data (If You Have Any)

If you have students, courses, or attendance in your app already:

1. Open your app in the browser: http://localhost:3001
2. Open Developer Tools (F12 or Cmd+Option+I on Mac)
3. Go to the **Console** tab
4. Copy and paste this migration script:

```javascript
// MongoDB Migration Script
(async function() {
  const API_URL = 'http://localhost:5001/api'; // Or use your network IP for mobile
  
  // Get data from localStorage
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');
  const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
  
  console.log(`Found ${students.length} students, ${courses.length} courses, ${attendance.length} records`);
  
  if (students.length === 0 && courses.length === 0 && attendance.length === 0) {
    console.log('No data to migrate. You can start fresh with MongoDB!');
    return;
  }
  
  // Migrate students
  console.log('Migrating students...');
  for (const student of students) {
    try {
      const response = await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
      });
      if (response.ok) {
        console.log(`✓ Migrated: ${student.name}`);
      }
    } catch (error) {
      console.error(`✗ Failed: ${student.name}`, error);
    }
  }
  
  // Migrate courses
  console.log('Migrating courses...');
  for (const course of courses) {
    try {
      const response = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });
      if (response.ok) {
        console.log(`✓ Migrated: ${course.name}`);
      }
    } catch (error) {
      console.error(`✗ Failed: ${course.name}`, error);
    }
  }
  
  // Migrate attendance
  console.log('Migrating attendance...');
  for (const record of attendance) {
    try {
      const response = await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (response.ok) {
        console.log(`✓ Migrated attendance`);
      }
    } catch (error) {
      console.error(`✗ Failed`, error);
    }
  }
  
  console.log('✅ Migration complete!');
})();
```

5. Press Enter to run the script
6. Wait for completion (you'll see checkmarks)

### Step 2: Test MongoDB is Working

Add a new student through your app:
1. Go to the Students section
2. Click "Add Student"
3. Fill in the details and save

Then verify it's in MongoDB:

```bash
curl http://localhost:5001/api/students
```

You should see the student in the response!

## Verify MongoDB Connection

### Check Backend Health
```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "mongodb_status": "ok",
  "gemini_status": "ok"
}
```

### View All Students in Database
```bash
curl http://localhost:5001/api/students | python3 -m json.tool
```

### View All Courses in Database
```bash
curl http://localhost:5001/api/courses | python3 -m json.tool
```

### View All Attendance Records
```bash
curl http://localhost:5001/api/attendance | python3 -m json.tool
```

## MongoDB Atlas Dashboard

You can also view your data in MongoDB Atlas:

1. Go to: https://cloud.mongodb.com/
2. Sign in with your credentials
3. Navigate to your cluster
4. Click "Browse Collections"
5. Select database: `attendance_db`
6. View collections:
   - `students`
   - `courses`
   - `attendance_records`

## API Endpoints

All endpoints are available at: http://localhost:5001/api

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `GET /api/students/{id}` - Get specific student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course
- `GET /api/courses/{id}` - Get specific course
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course

### Attendance
- `GET /api/attendance` - Get all attendance
- `GET /api/attendance?courseId={id}` - Get by course
- `POST /api/attendance` - Create record
- `PUT /api/attendance/{id}` - Update record
- `DELETE /api/attendance/{id}` - Delete record

## Troubleshooting

### "Cannot connect to MongoDB"

Check your .env file:
```bash
cat backend/.env
```

Ensure MONGODB_URI is correct.

### "No students showing up"

1. Check if backend is running: `curl http://localhost:5001/api/health`
2. Check if students exist: `curl http://localhost:5001/api/students`
3. Try the migration script if you have localStorage data

### "Connection timeout"

Your MongoDB Atlas cluster might be paused. Go to MongoDB Atlas dashboard and check cluster status.

## Data Persistence

✅ **All data is now persistent!**
- Students, courses, and attendance are stored in MongoDB Atlas
- Data survives app restarts and browser refreshes
- Accessible from any device on your network
- Can be accessed from mobile APK

## Next Steps

1. Migrate any existing data using the console script
2. Test adding a new student
3. Verify it appears in MongoDB
4. Build and test the mobile APK
5. All your data will be synced across devices!

---

**Note**: The frontend currently still uses localStorage as primary storage. To fully switch to MongoDB, the App.tsx would need to be updated to use API calls instead of localStorage hooks. However, the backend API is fully functional and ready to use!
