#!/bin/bash

# Migrate LocalStorage Data to MongoDB
# This script helps transfer existing localStorage data to MongoDB

echo "===================================="
echo "LocalStorage to MongoDB Migration"
echo "===================================="
echo ""

API_URL="${1:-http://localhost:5001/api}"

echo "Using API URL: $API_URL"
echo ""
echo "This script will help you migrate your localStorage data to MongoDB."
echo "The migration should be done through the browser console."
echo ""
echo "Steps:"
echo "1. Open your app in the browser"
echo "2. Open Developer Tools (F12 or Cmd+Option+I)"
echo "3. Go to the Console tab"
echo "4. Copy and paste the following code:"
echo ""
echo "----------------------------------------"
cat << 'EOF'
// Migration Script
(async function() {
  const API_URL = 'http://localhost:5001/api';
  
  // Get data from localStorage
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');
  const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
  
  console.log(`Found ${students.length} students, ${courses.length} courses, ${attendance.length} attendance records`);
  
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
        console.log(`✓ Migrated student: ${student.name}`);
      } else {
        const error = await response.json();
        console.error(`✗ Failed to migrate ${student.name}:`, error);
      }
    } catch (error) {
      console.error(`✗ Error migrating ${student.name}:`, error);
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
        console.log(`✓ Migrated course: ${course.name}`);
      } else {
        const error = await response.json();
        console.error(`✗ Failed to migrate ${course.name}:`, error);
      }
    } catch (error) {
      console.error(`✗ Error migrating ${course.name}:`, error);
    }
  }
  
  // Migrate attendance
  console.log('Migrating attendance records...');
  for (const record of attendance) {
    try {
      const response = await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (response.ok) {
        console.log(`✓ Migrated attendance record`);
      } else {
        const error = await response.json();
        console.error(`✗ Failed to migrate record:`, error);
      }
    } catch (error) {
      console.error(`✗ Error migrating record:`, error);
    }
  }
  
  console.log('Migration complete!');
  console.log('You can now refresh the page to use MongoDB data.');
})();
EOF
echo "----------------------------------------"
echo ""
echo "5. Press Enter to execute the script"
echo "6. Wait for the migration to complete"
echo "7. Refresh the page"
echo ""
echo "Note: Make sure the backend is running before migration!"
