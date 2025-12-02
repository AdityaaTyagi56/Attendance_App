"""
Flask backend for IIIT-NR Attendance App with Gemini 2.5 Flash integration
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from typing import Dict, Any, List

import google.generativeai as genai
from dotenv import load_dotenv

import database

load_dotenv()

app = Flask(__name__)

# Configure CORS to allow requests from any origin (for mobile dev)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash')

if not GEMINI_API_KEY:
    raise RuntimeError('GEMINI_API_KEY is not set. Add it to backend/.env or your environment.')

genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel(GEMINI_MODEL)


def call_gemini(prompt: str, temperature: float = 0.2, max_tokens: int = 1024) -> str:
    """Call Gemini API and return the generated text"""
    try:
        print(f"[Gemini] Calling model {GEMINI_MODEL} with prompt length: {len(prompt)} chars")
        
        response = gemini_model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            ),
        )

        text_response = ''

        # Extract text from candidates - handle empty parts list properly
        for candidate in getattr(response, 'candidates', []) or []:
            content = getattr(candidate, 'content', None)
            if not content:
                continue
            parts = getattr(content, 'parts', []) or []
            for part in parts:
                part_text = getattr(part, 'text', '')
                if part_text:
                    text_response += part_text
            if text_response:
                break

        # Fallback to response.text if available
        if not text_response:
            try:
                text_response = response.text or ''
            except Exception:
                pass

        if not text_response:
            print(f"[Gemini] Empty response. Candidates: {len(getattr(response, 'candidates', []))}")
            if hasattr(response, 'candidates') and response.candidates:
                for i, cand in enumerate(response.candidates):
                    print(f"[Gemini] Candidate {i} finish_reason: {getattr(cand, 'finish_reason', 'unknown')}")
            raise Exception('Received empty response from Gemini')

        print(f"[Gemini] Response received: {len(text_response)} chars")
        return text_response.strip()
    except Exception as e:
        print(f"[Gemini] Error: {e}")
        raise Exception(f"Failed to call Gemini: {str(e)}")


@app.route('/api/chat', methods=['POST'])
def chat_with_ai():
    """
    Chat with the AI assistant
    Expected JSON body:
    {
        "prompt": str
    }
    """
    try:
        data = request.json
        prompt = data.get('prompt')
        
        if not prompt:
            return jsonify({"error": "Missing prompt"}), 400
            
        response_text = call_gemini(prompt, temperature=0.7, max_tokens=500)
        return jsonify({"response": response_text.strip()})
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    ai_status = "ok"
    mongodb_status = "ok" if getattr(database, 'db', None) is not None else "disconnected"

    return jsonify({
        "status": "ok",
        "ai_status": ai_status,
        "ai_provider": GEMINI_MODEL,
        "mongodb_status": mongodb_status
    })


@app.route('/api/attendance/summary', methods=['POST'])
def generate_attendance_summary():
    """
    Generate AI-powered attendance summary for a course
    Expected JSON body:
    {
        "course": {"name": str, "code": str, "id": str, "studentIds": [str]},
        "students": [{"id": str, "name": str, "studentId": str}],
        "records": [{"courseId": str, "date": str, "presentStudentIds": [str]}]
    }
    """
    try:
        data = request.json
        course = data['course']
        all_students = data['students']
        records = data['records']
        
        # Filter enrolled students
        enrolled_students = [s for s in all_students if s['id'] in course['studentIds']]
        course_records = [r for r in records if r['courseId'] == course['id']]
        
        if not course_records:
            return jsonify({"error": "No attendance records found for this course"}), 400
        
        # Build prompt
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
        
        response_text = call_gemini(prompt, temperature=0.0, max_tokens=800)
        
        # Try to extract JSON from response
        try:
            # Sometimes the model adds markdown code blocks
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


# ============= STUDENT ENDPOINTS =============

@app.route('/api/students', methods=['GET'])
def get_students():
    """Get all students"""
    try:
        students = database.get_all_students()
        return jsonify(students)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/students', methods=['POST'])
def create_student():
    """Create a new student"""
    try:
        data = request.json
        result = database.create_student(data)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/students/<student_id>', methods=['PUT'])
def update_student(student_id):
    """Update a student"""
    try:
        data = request.json
        success = database.update_student(student_id, data)
        if success:
            return jsonify({"message": "Student updated successfully"})
        return jsonify({"error": "Student not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/students/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    """Delete a student"""
    try:
        success = database.delete_student(student_id)
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
        courses = database.get_all_courses()
        return jsonify(courses)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/courses', methods=['POST'])
def create_course():
    """Create a new course"""
    try:
        data = request.json
        result = database.create_course(data)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/courses/<course_id>', methods=['PUT'])
def update_course(course_id):
    """Update a course"""
    try:
        data = request.json
        success = database.update_course(course_id, data)
        if success:
            return jsonify({"message": "Course updated successfully"})
        return jsonify({"error": "Course not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/courses/<course_id>', methods=['DELETE'])
def delete_course(course_id):
    """Delete a course"""
    try:
        success = database.delete_course(course_id)
        if success:
            return jsonify({"message": "Course deleted successfully"})
        return jsonify({"error": "Course not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============= ATTENDANCE ENDPOINTS =============

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    """Get attendance records"""
    try:
        course_id = request.args.get('courseId')
        if course_id:
            records = database.get_attendance_by_course(course_id)
        else:
            records = database.get_all_attendance_records()
        return jsonify(records)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/attendance', methods=['POST'])
def create_attendance():
    """Create a new attendance record"""
    try:
        data = request.json
        result = database.create_attendance_record(data)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/attendance/<record_id>', methods=['PUT'])
def update_attendance(record_id):
    """Update an attendance record"""
    try:
        data = request.json
        success = database.update_attendance_record(record_id, data)
        if success:
            return jsonify({"message": "Attendance record updated successfully"})
        return jsonify({"error": "Attendance record not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/attendance/<record_id>', methods=['DELETE'])
def delete_attendance(record_id):
    """Delete an attendance record"""
    try:
        success = database.delete_attendance_record(record_id)
        if success:
            return jsonify({"message": "Attendance record deleted successfully"})
        return jsonify({"error": "Attendance record not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/student/summary', methods=['POST'])
def generate_student_summary():
    """
    Generate AI-powered summary for a student
    Expected JSON body:
    {
        "student": {"id": str, "name": str, "studentId": str},
        "courses": [{"id": str, "name": str, "code": str, "studentIds": [str]}],
        "records": [{"courseId": str, "date": str, "presentStudentIds": [str]}]
    }
    """
    try:
        data = request.json
        student = data['student']
        courses = data['courses']
        records = data['records']
        
        # Filter student courses
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
        
        response_text = call_gemini(prompt, temperature=0.3, max_tokens=200)
        return jsonify({"summary": response_text.strip()})
        
    except KeyError as e:
        return jsonify({"error": f"Missing required field: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/student/goal', methods=['POST'])
def generate_attendance_goal():
    """
    Generate attendance goal for a student
    Expected JSON body:
    {
        "studentName": str,
        "courseName": str,
        "currentPercentage": number
    }
    """
    try:
        data = request.json
        student_name = data['studentName']
        course_name = data['courseName']
        current_percentage = data['currentPercentage']
        
        prompt = f"""You are a motivational academic coach. For {student_name} in {course_name} with current attendance {current_percentage}%, suggest a realistic attendance goal for the next month and give 2-3 short actionable tips. Keep under 100 words and format using Markdown with a bulleted list for tips."""
        
        response_text = call_gemini(prompt, temperature=0.4, max_tokens=200)
        return jsonify({"goal": response_text.strip()})
        
    except KeyError as e:
        return jsonify({"error": f"Missing required field: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/student/prediction', methods=['POST'])
def predict_attendance_performance():
    """
    Predict student attendance performance
    Expected JSON body:
    {
        "studentName": str,
        "courseName": str,
        "recentRecords": [{"date": str, "isPresent": bool}]
    }
    """
    try:
        data = request.json
        student_name = data['studentName']
        course_name = data['courseName']
        recent_records = data['recentRecords']
        
        attendance_string = '\n'.join([f"- {r['date']}: {'Present' if r['isPresent'] else 'Absent'}" for r in recent_records])
        
        prompt = f"""You are an analytical academic advisor. For {student_name} in {course_name}, here is recent attendance:
{attendance_string}

Provide a one-sentence prediction of likely end-of-semester attendance if this pattern continues, and one-sentence observation about recent performance. Keep under 75 words."""
        
        response_text = call_gemini(prompt, temperature=0.2, max_tokens=150)
        return jsonify({"prediction": response_text.strip()})
        
    except KeyError as e:
        return jsonify({"error": f"Missing required field: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    try:
        gemini_model.count_tokens("health check")
        print(f"✓ Gemini model ready: {GEMINI_MODEL}")
    except Exception as error:
        print(f"⚠ Unable to validate Gemini connection: {error}")
        print("  Verify GEMINI_API_KEY and internet connectivity.")

    # Initialize database
    if database.init_db():
        print("✓ Database initialized successfully")
    else:
        print("⚠ Database initialization failed")

    # Run Flask app
    port = int(os.getenv('PORT', 5001))
    print(f"\n🚀 Starting Flask backend on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
