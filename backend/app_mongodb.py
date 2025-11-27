"""
Flask backend with MongoDB integration and Ollama Llama 3
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os
from typing import Dict, Any, List
from dotenv import load_dotenv
import database as db

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS - Allow all origins for mobile app
# Capacitor apps use capacitor://localhost and ionic://localhost
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173", 
            "http://localhost:3000", 
            "http://localhost:3001", 
            "http://192.168.0.217:3000", 
            "http://192.168.0.217:3001",
            "http://172.16.201.77:3000",
            "http://172.16.201.77:3001",
            "http://172.16.204.75:3000",
            "http://172.16.204.75:3001",
            "capacitor://localhost",
            "ionic://localhost",
            "http://localhost"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": False
    }
})

# Additional CORS for root path
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    # Allow Capacitor and local origins
    if origin and (origin.startswith('capacitor://') or 
                   origin.startswith('ionic://') or 
                   origin.startswith('http://localhost') or
                   origin.startswith('http://192.168.') or
                   origin.startswith('http://172.16.') or
                   origin.startswith('http://10.')):
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'false')
    return response

# Ollama configuration
OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'llama3')


def call_ollama(prompt: str, temperature: float = 0.2, max_tokens: int = 1024) -> str:
    """Call Ollama API and return the generated text"""
    try:
        print(f"[Ollama] Calling model {OLLAMA_MODEL} with prompt length: {len(prompt)} chars")
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "temperature": temperature,
                "stream": False,
                "options": {
                    "num_predict": max_tokens,
                    "num_ctx": 2048,  # Context window
                    "num_thread": 4   # Use 4 threads for faster generation
                }
            },
            timeout=180  # Increased to 3 minutes
        )
        response.raise_for_status()
        
        data = response.json()
        result = data.get('response', '')
        print(f"[Ollama] Response received: {len(result)} chars")
        return result
    except requests.exceptions.Timeout as e:
        error_msg = f"Ollama timeout after 180 seconds: {str(e)}"
        print(f"[Ollama] {error_msg}")
        raise Exception("Ollama is taking too long to respond. Try using a smaller/faster model.")
    except requests.exceptions.ConnectionError as e:
        error_msg = f"Cannot connect to Ollama at {OLLAMA_URL}"
        print(f"[Ollama] {error_msg}: {e}")
        raise Exception(f"Ollama service not reachable. Make sure it's running: ollama serve")
    except requests.exceptions.RequestException as e:
        error_msg = f"Error calling Ollama: {str(e)}"
        print(f"[Ollama] {error_msg}")
        raise Exception(f"Failed to call Ollama: {str(e)}")
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        print(f"[Ollama] {error_msg}")
        raise


@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        "message": "IIIT-NR Attendance Backend is running",
        "status": "online",
        "docs": "/api/health"
    })


# ============= HEALTH & INFO ENDPOINTS =============

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        ollama_status = "ok" if response.ok else "error"
    except:
        ollama_status = "unreachable"
    
    mongodb_status = "ok" if db.db is not None else "disconnected"
    
    return jsonify({
        "status": "ok",
        "ollama_status": ollama_status,
        "mongodb_status": mongodb_status,
        "ollama_url": OLLAMA_URL,
        "model": OLLAMA_MODEL
    })


# ============= STUDENT ENDPOINTS =============

@app.route('/api/students', methods=['GET'])
def get_students():
    """Get all students"""
    try:
        students = db.get_all_students()
        return jsonify(students)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/students', methods=['POST'])
def create_student():
    """Create a new student"""
    try:
        student_data = request.json
        result = db.create_student(student_data)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/students/<student_id>', methods=['GET'])
def get_student(student_id):
    """Get student by ID"""
    try:
        student = db.get_student_by_id(student_id)
        if student:
            return jsonify(student)
        return jsonify({"error": "Student not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/students/<student_id>', methods=['PUT'])
def update_student(student_id):
    """Update student"""
    try:
        update_data = request.json
        success = db.update_student(student_id, update_data)
        if success:
            return jsonify({"message": "Student updated successfully"})
        return jsonify({"error": "Student not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/students/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    """Delete student"""
    try:
        success = db.delete_student(student_id)
        if success:
            return jsonify({"message": "Student deleted successfully"})
        return jsonify({"error": "Student not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============= COURSE ENDPOINTS =============

@app.route('/api/courses', methods=['GET'])
def get_courses():
    """Get all courses"""
    try:
        courses = db.get_all_courses()
        return jsonify(courses)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/courses', methods=['POST'])
def create_course():
    """Create a new course"""
    try:
        course_data = request.json
        result = db.create_course(course_data)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/courses/<course_id>', methods=['GET'])
def get_course(course_id):
    """Get course by ID"""
    try:
        course = db.get_course_by_id(course_id)
        if course:
            return jsonify(course)
        return jsonify({"error": "Course not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/courses/<course_id>', methods=['PUT'])
def update_course(course_id):
    """Update course"""
    try:
        update_data = request.json
        success = db.update_course(course_id, update_data)
        if success:
            return jsonify({"message": "Course updated successfully"})
        return jsonify({"error": "Course not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/courses/<course_id>', methods=['DELETE'])
def delete_course(course_id):
    """Delete course"""
    try:
        success = db.delete_course(course_id)
        if success:
            return jsonify({"message": "Course deleted successfully"})
        return jsonify({"error": "Course not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============= ATTENDANCE ENDPOINTS =============

@app.route('/api/attendance', methods=['GET'])
def get_attendance_records():
    """Get all attendance records"""
    try:
        course_id = request.args.get('courseId')
        if course_id:
            records = db.get_attendance_by_course(course_id)
        else:
            records = db.get_all_attendance_records()
        return jsonify(records)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/attendance', methods=['POST'])
def create_attendance():
    """Create a new attendance record"""
    try:
        record_data = request.json
        result = db.create_attendance_record(record_data)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/attendance/<record_id>', methods=['PUT'])
def update_attendance(record_id):
    """Update attendance record"""
    try:
        update_data = request.json
        success = db.update_attendance_record(record_id, update_data)
        if success:
            return jsonify({"message": "Attendance record updated successfully"})
        return jsonify({"error": "Record not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/attendance/<record_id>', methods=['DELETE'])
def delete_attendance(record_id):
    """Delete attendance record"""
    try:
        success = db.delete_attendance_record(record_id)
        if success:
            return jsonify({"message": "Attendance record deleted successfully"})
        return jsonify({"error": "Record not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============= AI-POWERED ENDPOINTS =============

@app.route('/api/attendance/summary', methods=['POST'])
def generate_attendance_summary():
    """Generate AI-powered attendance summary for a course"""
    try:
        data = request.json
        course = data['course']
        all_students = data['students']
        records = data['records']
        
        enrolled_students = [s for s in all_students if s['id'] in course['studentIds']]
        course_records = [r for r in records if r['courseId'] == course['id']]
        
        if not course_records:
            return jsonify({"error": "No attendance records found for this course"}), 400
        
        prompt = f"""You are an analytical assistant. Produce ONLY valid JSON (no explanatory text) matching this exact schema:
{{
  "overallAttendancePercentage": number,
  "atRiskStudents": [{{"name": string, "studentId": string, "attendancePercentage": number}}],
  "notableTrends": [string],
  "concludingRemark": string,
  "attendanceDistribution": {{"perfect": number, "good": number, "atRisk": number, "critical": number}},
  "actionableInsight": string
}}

Now analyze the course: "{course['name']} ({course['code']})".
Enrolled students: {len(enrolled_students)}.
Sessions recorded: {len(course_records)}.

Enrolled Students List:
{chr(10).join([f"- {s['name']} ({s['studentId']})" for s in enrolled_students])}

Raw Attendance Data (present student IDs per date):
{chr(10).join([f"Date: {r['date']}, Present IDs: [{', '.join(r['presentStudentIds'])}]" for r in course_records])}

Return strictly the JSON object described above. No additional text."""
        
        response_text = call_ollama(prompt, temperature=0.0, max_tokens=800)
        
        try:
            if '```json' in response_text:
                json_str = response_text.split('```json')[1].split('```')[0].strip()
            elif '```' in response_text:
                json_str = response_text.split('```')[1].split('```')[0].strip()
            else:
                json_str = response_text.strip()
            
            result = json.loads(json_str)
            return jsonify(result)
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON: {response_text}")
            return jsonify({
                "error": "Failed to parse AI response",
                "details": str(e),
                "raw_response": response_text
            }), 500
            
    except KeyError as e:
        return jsonify({"error": f"Missing required field: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/student/summary', methods=['POST'])
def generate_student_summary():
    """Generate AI-powered summary for a student"""
    try:
        data = request.json
        student = data['student']
        courses = data['courses']
        records = data['records']
        
        student_courses = [c for c in courses if student['id'] in c['studentIds']]
        
        total_classes = 0
        present_classes = 0
        course_details = []
        
        for course in student_courses:
            course_records = [r for r in records if r['courseId'] == course['id']]
            course_total = len(course_records)
            
            if course_total == 0:
                course_details.append({"name": course['name'], "percentage": 100})
                continue
            
            course_present = len([r for r in course_records if student['id'] in r['presentStudentIds']])
            total_classes += course_total
            present_classes += course_present
            
            course_details.append({
                "name": course['name'],
                "percentage": round((course_present / course_total) * 100)
            })
        
        overall_percentage = 100 if total_classes == 0 else round((present_classes / total_classes) * 100)
        
        prompt = f"""You are an encouraging academic advisor. Write a short (2-3 sentence) supportive summary for {student['name']}.
Overall Attendance: {overall_percentage}%
Total Classes Attended: {present_classes} out of {total_classes}
Course-specific percentages:
{chr(10).join([f"- {c['name']}: {c['percentage']}%" for c in course_details])}

Keep tone positive and encouraging. Do not exceed 3 sentences."""
        
        response_text = call_ollama(prompt, temperature=0.3, max_tokens=200)
        return jsonify({"summary": response_text.strip()})
        
    except KeyError as e:
        return jsonify({"error": f"Missing required field: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/student/goal', methods=['POST'])
def generate_attendance_goal():
    """Generate attendance goal for a student"""
    try:
        data = request.json
        student_name = data['studentName']
        course_name = data['courseName']
        current_percentage = data['currentPercentage']
        
        prompt = f"""You are a motivational academic coach. For {student_name} in {course_name} with current attendance {current_percentage}%, suggest a realistic attendance goal for the next month and give 2-3 short actionable tips. Keep under 100 words and format using Markdown with a bulleted list for tips."""
        
        response_text = call_ollama(prompt, temperature=0.4, max_tokens=200)
        return jsonify({"goal": response_text.strip()})
        
    except KeyError as e:
        return jsonify({"error": f"Missing required field: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/student/prediction', methods=['POST'])
def predict_attendance_performance():
    """Predict student attendance performance"""
    try:
        data = request.json
        student_name = data['studentName']
        course_name = data['courseName']
        recent_records = data['recentRecords']
        
        attendance_string = '\n'.join([f"- {r['date']}: {'Present' if r['isPresent'] else 'Absent'}" for r in recent_records])
        
        prompt = f"""You are an analytical academic advisor. For {student_name} in {course_name}, here is recent attendance:
{attendance_string}

Provide a one-sentence prediction of likely end-of-semester attendance if this pattern continues, and one-sentence observation about recent performance. Keep under 75 words."""
        
        response_text = call_ollama(prompt, temperature=0.2, max_tokens=150)
        return jsonify({"prediction": response_text.strip()})
        
    except KeyError as e:
        return jsonify({"error": f"Missing required field: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/chat', methods=['POST'])
def chat():
    """Chatbot endpoint for general queries"""
    try:
        data = request.json
        prompt = data['prompt']
        
        response_text = call_ollama(prompt, temperature=0.7, max_tokens=300)
        return jsonify({"response": response_text.strip()})
        
    except KeyError as e:
        return jsonify({"error": f"Missing required field: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Initialize MongoDB
    try:
        db_connected = db.init_db()
        if db_connected:
            print(f"✓ Connected to MongoDB")
        else:
            print(f"⚠ Warning: MongoDB connection failed")
    except Exception as e:
        print(f"⚠ Warning: MongoDB initialization error: {e}")
    
    # Check if Ollama is running
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        print(f"✓ Connected to Ollama at {OLLAMA_URL}")
        print(f"✓ Using model: {OLLAMA_MODEL}")
    except Exception as e:
        print(f"⚠ Warning: Cannot connect to Ollama at {OLLAMA_URL}")
        print("  Make sure Ollama is running: ollama serve")
        print(f"  And the model is available: ollama pull {OLLAMA_MODEL}")
    
    # Run Flask app with error handling
    port = int(os.getenv('PORT', 5001))
    print(f"\n🚀 Starting Flask backend on port {port}...")
    print(f"   Access at: http://0.0.0.0:{port}/api/health")
    
    try:
        # Disable debug mode to allow background execution
        # Use threaded=True for better stability
        app.run(host='0.0.0.0', port=port, debug=False, threaded=True)
    except KeyboardInterrupt:
        print("\n✓ Backend stopped by user")
    except Exception as e:
        print(f"\n❌ Backend error: {e}")
        import sys
        sys.exit(1)
