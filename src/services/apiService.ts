/**
 * API Service for backend communication
 * Handles all CRUD operations with MongoDB via Flask backend
 */

import { getApiUrl } from '../utils/config';

export const API_URL = getApiUrl();

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ============= STUDENT API =============

export async function fetchStudents() {
  return apiCall<any[]>('/students');
}

export async function createStudent(student: any) {
  return apiCall<any>('/students', {
    method: 'POST',
    body: JSON.stringify(student),
  });
}

export async function updateStudent(studentId: string, updateData: any) {
  return apiCall<any>(`/students/${studentId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}

export async function deleteStudent(studentId: string) {
  return apiCall<{ message: string }>(`/students/${studentId}`, {
    method: 'DELETE',
  });
}

// ============= COURSE API =============

export async function fetchCourses() {
  return apiCall<any[]>('/courses');
}

export async function createCourse(course: any) {
  return apiCall<any>('/courses', {
    method: 'POST',
    body: JSON.stringify(course),
  });
}

export async function updateCourse(courseId: string, updateData: any) {
  return apiCall<any>(`/courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}

export async function deleteCourse(courseId: string) {
  return apiCall<{ message: string }>(`/courses/${courseId}`, {
    method: 'DELETE',
  });
}

// ============= ATTENDANCE API =============

export async function fetchAttendance(courseId?: string) {
  const query = courseId ? `?courseId=${courseId}` : '';
  return apiCall<any[]>(`/attendance${query}`);
}

export async function createAttendance(record: any) {
  return apiCall<any>('/attendance', {
    method: 'POST',
    body: JSON.stringify(record),
  });
}

export async function updateAttendance(recordId: string, updateData: any) {
  return apiCall<any>(`/attendance/${recordId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}

export async function deleteAttendance(recordId: string) {
  return apiCall<{ message: string }>(`/attendance/${recordId}`, {
    method: 'DELETE',
  });
}

// ============= HEALTH CHECK =============

export async function checkHealth() {
  return apiCall<{
    status: string;
    ai_status: string;
    ai_provider?: string;
    mongodb_status: string;
  }>('/health');
}
