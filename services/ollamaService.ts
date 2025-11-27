import { Course, Student, AttendanceRecord, AttendanceReportData } from '../types';

// Backend API URL - uses environment variable or falls back to network IP
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://172.16.204.75:5001/api';

console.log('[OllamaService] API Base URL:', API_BASE_URL);

async function callBackend(endpoint: string, data: any) {
  try {
    console.log(`[OllamaService] Calling ${API_BASE_URL}${endpoint}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
      // Disable credentials for CORS
      credentials: 'omit',
    });

    clearTimeout(timeoutId);

    console.log(`[OllamaService] Response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[OllamaService] Error response:`, errorText);
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.error || `Backend request failed: ${res.status}`);
      } catch {
        throw new Error(`Backend request failed: ${res.status} - ${errorText}`);
      }
    }

    const result = await res.json();
    console.log(`[OllamaService] Success:`, result);
    return result;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.error('[OllamaService] Request timeout');
      throw new Error('Request timeout - AI is taking too long to respond. Please try again.');
    }
    console.error('[OllamaService] Backend call failed:', err);
    throw err;
  }
}

export const generateAttendanceSummary = async (
  course: Course,
  allStudents: Student[],
  records: AttendanceRecord[]
): Promise<AttendanceReportData> => {
  try {
    const result = await callBackend('/attendance/summary', {
      course,
      students: allStudents,
      records,
    });
    return result;
  } catch (error: any) {
    console.error('Error generating attendance summary:', error);
    throw new Error(error.message || 'Failed to generate summary. Please check your backend connection.');
  }
};

export const generateStudentSummary = async (
  student: Student,
  courses: Course[],
  records: AttendanceRecord[]
): Promise<string> => {
  try {
    const result = await callBackend('/student/summary', {
      student,
      courses,
      records,
    });
    return result.summary;
  } catch (error: any) {
    console.error('Error generating student summary:', error);
    throw new Error('Failed to generate student summary.');
  }
};

export const generateAttendanceGoal = async (
  studentName: string,
  courseName: string,
  currentPercentage: number
): Promise<string> => {
  try {
    const result = await callBackend('/student/goal', {
      studentName,
      courseName,
      currentPercentage,
    });
    return result.goal;
  } catch (error: any) {
    console.error('Error generating attendance goal:', error);
    throw new Error('Failed to generate goal.');
  }
};

export const predictAttendancePerformance = async (
  studentName: string,
  courseName: string,
  recentRecords: { date: string, isPresent: boolean }[]
): Promise<string> => {
  try {
    const result = await callBackend('/student/prediction', {
      studentName,
      courseName,
      recentRecords,
    });
    return result.prediction;
  } catch (error: any) {
    console.error('Error predicting attendance:', error);
    throw new Error('Failed to generate prediction.');
  }
};
