// Fix: Removed circular import of 'Branch' which was causing a declaration conflict.
export type Branch = 'DSAI';

export interface Student {
  id: string;
  name: string;
  studentId: string;
  photo?: string;
  email: string;
  password: string;
  branch: Branch;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  password: string;
  branch: Branch;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  studentIds: string[];
  branch: Branch;
}

export interface AttendanceRecord {
  id?: string;
  courseId: string;
  date: string; // YYYY-MM-DD
  presentStudentIds: string[];
  timestamp?: number;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  STUDENTS = 'STUDENTS',
  COURSES = 'COURSES',
  TAKE_ATTENDANCE = 'TAKE_ATTENDANCE',
  REPORTS = 'REPORTS',
}

export type User = {
  type: 'teacher';
  email: string;
  branch: Branch;
} | {
  type: 'student';
  email: string;
};

export interface AttendanceReportData {
  overallAttendancePercentage: number;
  atRiskStudents: Array<{
    name: string;
    studentId: string;
    attendancePercentage: number;
  }>;
  notableTrends: string[];
  concludingRemark: string;
  actionableInsight: string;
  attendanceDistribution: {
    perfect: number; // 100%
    good: number;    // 75-99%
    atRisk: number;  // 50-74%
    critical: number;// <50%
  };
}