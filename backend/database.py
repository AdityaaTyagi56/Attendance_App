"""
MongoDB database connection and operations
"""
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from bson import ObjectId
import os
from typing import Dict, List, Optional
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB configuration
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
MONGODB_DB_NAME = os.getenv('MONGODB_DB_NAME', 'iiit_attendance')

# Global database connection
client = None
db = None


def init_db():
    """Initialize MongoDB connection"""
    global client, db
    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Test connection
        client.admin.command('ping')
        db = client[MONGODB_DB_NAME]
        
        # Create indexes for better performance
        db.students.create_index("studentId", unique=True)
        db.courses.create_index("code", unique=True)
        db.attendance_records.create_index([("courseId", 1), ("date", 1)])
        db.users.create_index("username", unique=True)
        
        print(f"✓ Connected to MongoDB at {MONGODB_URI}")
        print(f"✓ Using database: {MONGODB_DB_NAME}")
        return True
    except ConnectionFailure as e:
        print(f"⚠ Warning: Cannot connect to MongoDB at {MONGODB_URI}")
        print(f"  Error: {e}")
        return False


def get_db():
    """Get database instance"""
    if db is None:
        init_db()
    return db


# ============= STUDENT OPERATIONS =============

def create_student(student_data: Dict) -> Dict:
    """Create a new student"""
    student_data['createdAt'] = datetime.utcnow()
    student_data['updatedAt'] = datetime.utcnow()
    result = db.students.insert_one(student_data)
    student_data['_id'] = str(result.inserted_id)
    # Ensure every student document has a stable id field for the frontend/mobile app
    if 'id' not in student_data or not student_data['id']:
        student_data['id'] = student_data['_id']
    return student_data


def get_all_students() -> List[Dict]:
    """Get all students"""
    students = list(db.students.find())
    for student in students:
        student['_id'] = str(student['_id'])
        # Backfill id if older records were created without it
        if 'id' not in student or not student['id']:
            student['id'] = student['_id']
    return students


def get_student_by_id(student_id: str) -> Optional[Dict]:
    """Get student by ID"""
    student = db.students.find_one({"id": student_id})
    if not student:
        try:
            object_id = ObjectId(student_id)
            student = db.students.find_one({"_id": object_id})
            if student and ('id' not in student or not student['id']):
                db.students.update_one({"_id": object_id}, {"$set": {"id": student_id}})
        except Exception:
            student = None
    if student:
        student['_id'] = str(student['_id'])
        if 'id' not in student or not student['id']:
            student['id'] = student['_id']
    return student


def update_student(student_id: str, update_data: Dict) -> bool:
    """Update student"""
    update_data = {k: v for k, v in update_data.items() if k != '_id'}
    update_data['updatedAt'] = datetime.utcnow()
    result = db.students.update_one(
        {"id": student_id},
        {"$set": update_data}
    )

    if result.modified_count == 0:
        try:
            object_id = ObjectId(student_id)
            # When falling back to _id, also ensure the document now has the "id" field for future lookups
            fallback_update = {**update_data, "id": student_id}
            result = db.students.update_one(
                {"_id": object_id},
                {"$set": fallback_update}
            )
        except Exception:
            pass

    return result.modified_count > 0


def delete_student(student_id: str) -> bool:
    """Delete student"""
    result = db.students.delete_one({"id": student_id})
    return result.deleted_count > 0


# ============= COURSE OPERATIONS =============

def create_course(course_data: Dict) -> Dict:
    """Create a new course"""
    course_data['createdAt'] = datetime.utcnow()
    course_data['updatedAt'] = datetime.utcnow()
    result = db.courses.insert_one(course_data)
    course_data['_id'] = str(result.inserted_id)
    return course_data


def get_all_courses() -> List[Dict]:
    """Get all courses"""
    courses = list(db.courses.find())
    for course in courses:
        course['_id'] = str(course['_id'])
    return courses


def get_course_by_id(course_id: str) -> Optional[Dict]:
    """Get course by ID"""
    course = db.courses.find_one({"id": course_id})
    if course:
        course['_id'] = str(course['_id'])
    return course


def update_course(course_id: str, update_data: Dict) -> bool:
    """Update course"""
    update_data['updatedAt'] = datetime.utcnow()
    result = db.courses.update_one(
        {"id": course_id},
        {"$set": update_data}
    )
    return result.modified_count > 0


def delete_course(course_id: str) -> bool:
    """Delete course"""
    result = db.courses.delete_one({"id": course_id})
    return result.deleted_count > 0


# ============= ATTENDANCE OPERATIONS =============

def create_attendance_record(record_data: Dict) -> Dict:
    """Create a new attendance record"""
    record_data['createdAt'] = datetime.utcnow()
    record_data['updatedAt'] = datetime.utcnow()
    result = db.attendance_records.insert_one(record_data)
    record_data['_id'] = str(result.inserted_id)
    return record_data


def get_all_attendance_records() -> List[Dict]:
    """Get all attendance records"""
    records = list(db.attendance_records.find())
    for record in records:
        record['_id'] = str(record['_id'])
    return records


def get_attendance_by_course(course_id: str) -> List[Dict]:
    """Get attendance records for a specific course"""
    records = list(db.attendance_records.find({"courseId": course_id}))
    for record in records:
        record['_id'] = str(record['_id'])
    return records


def get_attendance_by_date(course_id: str, date: str) -> Optional[Dict]:
    """Get attendance record for a specific course and date"""
    record = db.attendance_records.find_one({"courseId": course_id, "date": date})
    if record:
        record['_id'] = str(record['_id'])
    return record


def update_attendance_record(record_id: str, update_data: Dict) -> bool:
    """Update attendance record"""
    update_data['updatedAt'] = datetime.utcnow()
    result = db.attendance_records.update_one(
        {"id": record_id},
        {"$set": update_data}
    )
    return result.modified_count > 0


def delete_attendance_record(record_id: str) -> bool:
    """Delete attendance record"""
    result = db.attendance_records.delete_one({"id": record_id})
    return result.deleted_count > 0


# ============= USER OPERATIONS =============

def create_user(user_data: Dict) -> Dict:
    """Create a new user"""
    user_data['createdAt'] = datetime.utcnow()
    user_data['updatedAt'] = datetime.utcnow()
    result = db.users.insert_one(user_data)
    user_data['_id'] = str(result.inserted_id)
    return user_data


def get_user_by_username(username: str) -> Optional[Dict]:
    """Get user by username"""
    user = db.users.find_one({"username": username})
    if user:
        user['_id'] = str(user['_id'])
    return user


def get_all_users() -> List[Dict]:
    """Get all users"""
    users = list(db.users.find())
    for user in users:
        user['_id'] = str(user['_id'])
    return users
