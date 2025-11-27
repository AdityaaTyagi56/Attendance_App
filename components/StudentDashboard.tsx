import React, { useState, useEffect, useMemo } from 'react';
import { Student, Course, AttendanceRecord } from '../types';
import { LogOut, Sun, Moon, ChevronDown, UserCircle, ChevronLeft, ChevronRight, Sparkles, Target, TrendingUp, Clock } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';
import { generateStudentSummary, generateAttendanceGoal, predictAttendancePerformance } from '../services/ollamaService';
import PhotoViewerModal from './PhotoViewerModal';
import Modal from './Modal';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface StudentDashboardProps {
  student: Student;
  courses: Course[];
  attendanceRecords: AttendanceRecord[];
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const CircularProgress: React.FC<{ percentage: number; size?: number; strokeWidth?: number; }> = ({ percentage, size = 120, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const color = percentage >= 75 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-black/5 dark:text-white/5"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <span className="absolute text-2xl font-bold text-text">
        {percentage}<span className="text-base">%</span>
      </span>
    </div>
  );
};

const MiniCalendarHeatmap: React.FC<{
  studentId: string;
  courseId: string;
  attendanceRecords: AttendanceRecord[];
}> = ({ studentId, courseId, attendanceRecords }) => {
  const heatMapData = useMemo(() => {
    const data = [];
    const attendanceMap = new Map<string, boolean>();
    attendanceRecords
      .filter(r => r.courseId === courseId)
      .forEach(record => {
        attendanceMap.set(record.date, record.presentStudentIds.includes(studentId));
      });

    // Display last 35 days to form a 5x7 grid
    for (let i = 34; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      const status = attendanceMap.get(dateString);
      let finalStatus: 'present' | 'absent' | 'noclass' = 'noclass';

      if (status === true) {
        finalStatus = 'present';
      } else if (status === false) {
        finalStatus = 'absent';
      }

      data.push({ date: dateString, status: finalStatus });
    }
    return data;
  }, [studentId, courseId, attendanceRecords]);

  const statusToClass = {
    present: 'bg-success',
    absent: 'bg-danger',
    noclass: 'bg-white/5',
  };

  return (
    <div className="mt-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
        <span className="text-xs font-medium text-text-secondary self-start sm:self-center">Last 5 Weeks</span>
        <div className="flex items-center space-x-2 text-xs text-text-secondary">
          <div className="flex items-center"><span className="w-2 h-2 rounded-sm bg-white/10 mr-1"></span>No Class</div>
          <div className="flex items-center"><span className="w-2 h-2 rounded-sm bg-danger mr-1"></span>Absent</div>
          <div className="flex items-center"><span className="w-2 h-2 rounded-sm bg-success mr-1"></span>Present</div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {heatMapData.map(({ date, status }) => (
          <div
            key={date}
            title={`${new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}: ${status.charAt(0).toUpperCase() + status.slice(1)}`}
            className={`h-4 w-full rounded-sm ${statusToClass[status]}`}
          />
        ))}
      </div>
    </div>
  );
};

const AttendanceCalendar: React.FC<{
  studentId: string;
  courseId: string;
  attendanceRecords: AttendanceRecord[];
}> = ({ studentId, courseId, attendanceRecords }) => {
  const [displayDate, setDisplayDate] = useState(new Date());

  const attendanceMap = useMemo(() => {
    const map = new Map<string, boolean>();
    attendanceRecords
      .filter(r => r.courseId === courseId)
      .forEach(record => {
        map.set(record.date, record.presentStudentIds.includes(studentId));
      });
    return map;
  }, [attendanceRecords, courseId, studentId]);

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const isCurrentMonthView = today.getFullYear() === year && today.getMonth() === month;

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`blank-${i}`} className="w-7 h-7 sm:w-8 sm:h-8"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const fullDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const status = attendanceMap.get(fullDateStr);

    let cellClasses = 'w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs font-semibold ';

    if (status === true) {
      cellClasses += 'bg-success text-white';
    } else if (status === false) {
      cellClasses += 'bg-danger text-white';
    } else {
      // Visual indicator for "no class": a subtle border instead of a fill.
      cellClasses += 'border border-white/10 text-text-secondary';
    }

    if (isCurrentMonthView && day === today.getDate()) {
      cellClasses += ' ring-2 ring-primary';
    }

    calendarDays.push(<div key={day} className={cellClasses}>{day}</div>);
  }

  const handlePrevMonth = () => setDisplayDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setDisplayDate(new Date(year, month + 1, 1));

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="p-4 bg-black/10 rounded-3xl border border-white/10">
      <div className="flex justify-between items-center mb-3">
        <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <h4 className="font-bold text-md text-text">
          {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h4>
        <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-white/10 transition-colors">
          <ChevronRight className="w-5 h-5 text-text-secondary" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs text-text-secondary font-medium mb-2">
        {weekdays.map((day, index) => <div key={index}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2 place-items-center">
        {calendarDays}
      </div>
      <div className="flex justify-center items-center space-x-4 mt-4 text-xs text-text-secondary">
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-success mr-1.5"></span>Present</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-danger mr-1.5"></span>Absent</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full border border-text-secondary/50 mr-1.5"></span>No Class</div>
      </div>
    </div>
  );
};


const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, courses, attendanceRecords, onLogout, theme, toggleTheme }) => {
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalContent, setAiModalContent] = useState('');
  const [aiModalTitle, setAiModalTitle] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const openPhotoViewer = () => {
    if (student.photo) {
      setIsPhotoViewerOpen(true);
    }
  };

  const closePhotoViewer = () => {
    setIsPhotoViewerOpen(false);
  };

  const studentCourses = React.useMemo(() => {
    return courses.filter(course => course.studentIds.includes(student.id));
  }, [courses, student.id]);

  const getCourseAttendance = (courseId: string) => {
    const courseRecords = attendanceRecords.filter(r => r.courseId === courseId);
    const totalClasses = courseRecords.length;
    if (totalClasses === 0) return { percentage: 100, present: 0, total: 0, absent: 0 };

    const presentClasses = courseRecords.filter(r => r.presentStudentIds.includes(student.id)).length;
    const absentClasses = totalClasses - presentClasses;

    return {
      percentage: Math.round((presentClasses / totalClasses) * 100),
      present: presentClasses,
      total: totalClasses,
      absent: absentClasses,
    };
  };

  const overallPerformance = React.useMemo(() => {
    let totalClasses = 0;
    let presentClasses = 0;
    studentCourses.forEach(course => {
      const stats = getCourseAttendance(course.id);
      totalClasses += stats.total;
      presentClasses += stats.present;
    });
    const percentage = totalClasses === 0 ? 100 : Math.round((presentClasses / totalClasses) * 100);
    return {
      percentage,
      present: presentClasses,
      total: totalClasses,
      absent: totalClasses - presentClasses,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentCourses, attendanceRecords]);

  const handleGenerateSummary = async () => {
    if (isSummaryLoading) return;
    setIsSummaryLoading(true);
    setAiSummary(null);
    setSummaryError(null);
    try {
      const summary = await generateStudentSummary(student, studentCourses, attendanceRecords);
      setAiSummary(summary);
    } catch (error) {
      console.error("Failed to generate AI summary:", error);
      setSummaryError("Couldn't generate summary. Please try again later.");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleGoalSetting = async (course: Course) => {
    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiModalTitle('Your AI-Powered Goal');
    try {
      const { percentage } = getCourseAttendance(course.id);
      const goal = await generateAttendanceGoal(student.name, course.name, percentage);
      setAiModalContent(goal);
    } catch (e) {
      setAiModalContent("Sorry, I couldn't generate a goal right now. Please try again later.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePrediction = async (course: Course) => {
    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiModalTitle('AI Performance Predictor');
    try {
      const courseRecords = attendanceRecords
        .filter(r => r.courseId === course.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const recentRecords = courseRecords.slice(-15).map(r => ({
        date: r.date,
        isPresent: r.presentStudentIds.includes(student.id)
      }));

      if (recentRecords.length < 5) {
        setAiModalContent("There isn't enough attendance data for this course to make a reliable prediction yet. Keep up the great work!");
      } else {
        const prediction = await predictAttendancePerformance(student.name, course.name, recentRecords);
        setAiModalContent(prediction);
      }
    } catch (e) {
      setAiModalContent("Sorry, I couldn't generate a prediction right now. Please try again later.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourseId(prevId => (prevId === courseId ? null : courseId));
  };


  const LoadingSkeleton: React.FC = () => (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 p-4 bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <SkeletonLoader className="h-12 w-12 rounded-full" />
            <div>
              <SkeletonLoader className="h-6 w-40 mb-2 rounded-md" />
              <SkeletonLoader className="h-4 w-32 rounded-md" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <SkeletonLoader className="h-10 w-10 rounded-full" />
            <SkeletonLoader className="h-10 w-28 rounded-2xl" />
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pt-24">
          <SkeletonLoader className="h-40 w-full mb-6 rounded-4xl" />
          <SkeletonLoader className="h-8 w-72 mb-6 rounded-md" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl rounded-4xl p-4 sm:p-6 border border-white/10">
                <SkeletonLoader className="h-6 w-3/4 mb-2 rounded-md" />
                <SkeletonLoader className="h-4 w-1/2 mb-4 rounded-md" />
                <div className="flex justify-between items-center">
                  <SkeletonLoader className="h-4 w-1/4 rounded-md" />
                  <SkeletonLoader className="h-4 w-2/5 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen text-text"
    >
      <PhotoViewerModal
        isOpen={isPhotoViewerOpen}
        onClose={closePhotoViewer}
        photoUrl={student.photo ?? null}
        studentName={student.name}
        studentId={student.studentId}
      />
      <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title={aiModalTitle}>
        {isAiLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <div className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce"></div>
              <span className="font-semibold">Generating...</span>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert text-text-secondary">
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold text-text" {...props} />,
              }}
            >
              {aiModalContent}
            </ReactMarkdown>
          </div>
        )}
      </Modal>

      <nav className="sticky top-0 z-20 glass border-b border-white/10 py-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {student.photo ? (
              <img onClick={openPhotoViewer} src={student.photo} alt={student.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 cursor-pointer hover:ring-2 hover:ring-primary transition-all" />
            ) : (
              <UserCircle className="w-12 h-12 text-text-secondary" />
            )}
            <div>
              <h1 className="text-lg font-bold tracking-tight text-text">
                {student.name}
              </h1>
              <p className="text-xs text-text-secondary font-mono">
                {student.studentId}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              {theme === 'light' ? <Moon className="w-6 h-6 text-text" /> : <Sun className="w-6 h-6 text-text" />}
            </button>
            <button onClick={onLogout} className="flex items-center bg-white/5 hover:bg-white/10 font-semibold py-2 px-4 rounded-2xl transition-colors text-text">
              <LogOut className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>
      <main>
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:pb-[max(1.5rem,env(safe-area-inset-bottom))] md:pl-[max(1.5rem,env(safe-area-inset-left))] md:pr-[max(1.5rem,env(safe-area-inset-right))] lg:pb-[max(2rem,env(safe-area-inset-bottom))] lg:pl-[max(2rem,env(safe-area-inset-left))] lg:pr-[max(2rem,env(safe-area-inset-right))]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 sm:p-6 rounded-3xl mb-8 shadow-lg border border-white/10 flex flex-col md:flex-row items-center justify-between"
          >
            <div className="flex-1 mb-4 md:mb-0 w-full">
              <h3 className="text-xl font-bold font-display mb-1 text-text">Overall Performance</h3>
              <p className="text-text-secondary">A summary of your attendance across all courses.</p>
              <div className="flex space-x-6 mt-4 text-center">
                <div>
                  <p className="text-3xl font-extrabold text-text">{overallPerformance.present}</p>
                  <p className="text-sm text-text-secondary">Present</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-text">{overallPerformance.absent}</p>
                  <p className="text-sm text-text-secondary">Absent</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-text">{overallPerformance.total}</p>
                  <p className="text-sm text-text-secondary">Total Classes</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                {!aiSummary && !isSummaryLoading && !summaryError && (
                  <button
                    onClick={handleGenerateSummary}
                    className="text-sm font-semibold text-primary hover:underline flex items-center transition-opacity hover:opacity-80"
                  >
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Get AI-Powered Summary
                  </button>
                )}
                {isSummaryLoading && (
                  <div className="flex items-center space-x-2 text-sm text-text-secondary">
                    <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <span>Generating summary...</span>
                  </div>
                )}
                {summaryError && (
                  <p className="text-sm text-danger">{summaryError}</p>
                )}
                {aiSummary && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1"
                  >
                    <h4 className="text-sm font-bold text-text-secondary flex items-center">
                      <Sparkles className="w-4 h-4 mr-1.5 text-primary" />
                      Your AI Summary
                    </h4>
                    <p className="text-sm text-text-secondary pl-1">{aiSummary}</p>
                  </motion.div>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <CircularProgress percentage={overallPerformance.percentage} />
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold font-display text-text mb-4">Your Courses</h2>
          <div className="space-y-4">
            {studentCourses.length > 0 ? studentCourses.map(course => {
              const { percentage, present, total } = getCourseAttendance(course.id);
              const isExpanded = expandedCourseId === course.id;
              const recentActivity = attendanceRecords
                .filter(r => r.courseId === course.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5);

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card rounded-3xl transition-all duration-300 border border-white/10 shadow-lg hover:shadow-xl"
                >
                  <div className="p-4 sm:p-6 cursor-pointer" onClick={() => toggleCourseExpansion(course.id)}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold text-lg text-text">{course.name}</h3>
                        <p className="text-sm text-text-secondary mb-2 font-mono">{course.code}</p>
                        <div className="flex items-baseline space-x-2">
                          <span className="font-extrabold text-2xl text-text">{percentage}%</span>
                          <span className="text-sm font-medium text-text-secondary">({present} / {total} classes)</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <ChevronDown className={`w-6 h-6 text-text-secondary transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    <MiniCalendarHeatmap
                      studentId={student.id}
                      courseId={course.id}
                      attendanceRecords={attendanceRecords}
                    />
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 pb-4 sm:px-6 sm:pb-6 border-t border-white/10"
                    >
                      <AttendanceCalendar
                        studentId={student.id}
                        courseId={course.id}
                        attendanceRecords={attendanceRecords}
                      />

                      <div className="mt-6 pt-6 border-t border-white/10">
                        <h4 className="font-bold text-md text-text mb-3 flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-primary" />
                          Recent Activity
                        </h4>
                        {recentActivity.length > 0 ? (
                          <div className="space-y-2">
                            {recentActivity.map(record => {
                              const isPresent = record.presentStudentIds.includes(student.id);
                              return (
                                <div key={record.date} className="flex justify-between items-center text-sm p-3 bg-black/10 rounded-2xl">
                                  <div>
                                    <p className="font-semibold text-text">{new Date(record.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</p>
                                    {record.timestamp && (
                                      <p className="text-xs text-text-secondary">
                                        {new Date(record.timestamp).toLocaleTimeString()}
                                      </p>
                                    )}
                                  </div>
                                  {isPresent ? (
                                    <span className="font-semibold text-success">Present</span>
                                  ) : (
                                    <span className="font-semibold text-danger">Absent</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-text-secondary">No recent activity for this course.</p>
                        )}
                      </div>

                      <div className="mt-6 pt-6 border-t border-white/10">
                        <h4 className="font-bold text-md text-text mb-3 flex items-center">
                          <Sparkles className="w-5 h-5 mr-2 text-primary" />
                          AI Toolkit
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button onClick={() => handleGoalSetting(course)} className="flex items-center justify-center text-sm font-semibold p-3 bg-black/10 hover:bg-black/20 rounded-2xl transition-all active:scale-95 border border-white/10">
                            <Target className="w-5 h-5 mr-2 text-primary" />
                            AI Goal Setter
                          </button>
                          <button onClick={() => handlePrediction(course)} className="flex items-center justify-center text-sm font-semibold p-3 bg-black/10 hover:bg-black/20 rounded-2xl transition-all active:scale-95 border border-white/10">
                            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                            AI Predictor
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            }) : (
              <div className="col-span-full text-center py-8 glass-card rounded-3xl border border-white/10">
                <p className="text-text-secondary">You are not enrolled in any courses.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default StudentDashboard;