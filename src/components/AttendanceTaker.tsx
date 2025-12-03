import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Course, Student, AttendanceRecord } from '../types';
import { UserCircleIcon, CheckCircleIcon, XCircleIcon, ArrowDownTrayIcon, EllipsisVerticalIcon, ClockIcon } from './icons';
import PhotoViewerModal from './PhotoViewerModal';
import * as api from '../services/apiService';
import { motion } from 'framer-motion';

// Add a global declaration for the jsPDF library loaded from the CDN
declare global {
  interface Window {
    jspdf: any;
  }
}

interface AttendanceTakerProps {
  courses: Course[];
  students: Student[];
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
}

const StudentAttendanceItem = React.memo(({ student, isPresent, isToggling, onToggle, onPhotoClick, index }: {
    student: Student;
    isPresent: boolean;
    isToggling: boolean;
    onToggle: (id: string) => void;
    onPhotoClick: (e: React.MouseEvent, student: Student) => void;
    index?: number;
}) => {
    const animationClass = isToggling ? (isPresent ? 'animate-highlight-present' : 'animate-highlight-absent') : '';
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
                duration: 0.35,
                delay: index ? Math.min(index * 0.03, 0.3) : 0,
                ease: [0.22, 1, 0.36, 1]
            }}
            whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
            style={{ willChange: 'transform, opacity' }}
        >
            <label
            htmlFor={`student-checkbox-${student.id}`}
            className={`p-3 rounded-3xl cursor-pointer flex items-center justify-between border transform-gpu transition-colors duration-200 ${animationClass} ${
                isPresent 
                ? 'bg-brand/20 backdrop-blur-md border-brand/50 shadow-lg shadow-brand/20' 
                : 'bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl border-white/10 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10 shadow-glass'
            }`}
            >
            <div className="flex items-center space-x-3 overflow-hidden">
                {student.photo ? (
                <motion.img
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    onClick={(e) => onPhotoClick(e, student)}
                    src={student.photo}
                    alt={student.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer ring-2 ring-transparent hover:ring-brand transform-gpu"
                    loading="lazy"
                />
                ) : (
                <UserCircleIcon className="w-10 h-10 text-on-surface-variant/30 dark:text-on-surface-dark-variant/30 flex-shrink-0" />
                )}
                <div className="truncate">
                <p className="font-bold text-sm text-on-surface dark:text-on-surface-dark truncate">{student.name}</p>
                <p className="text-xs text-on-surface-variant dark:text-on-surface-dark-variant font-mono truncate">{student.studentId}</p>
                </div>
            </div>
            <div className="ml-3 flex-shrink-0">
                <input
                id={`student-checkbox-${student.id}`}
                type="checkbox"
                checked={isPresent}
                onChange={() => onToggle(student.id)}
                className="h-5 w-5 rounded border-on-surface-variant/50 dark:border-on-surface-dark-variant/50 text-brand bg-surface dark:bg-surface-dark-variant focus:ring-brand focus:ring-2 focus:ring-offset-0 transition-colors duration-150"
                />
            </div>
            </label>
        </motion.div>
    );
}, (prevProps, nextProps) => 
    prevProps.student.id === nextProps.student.id &&
    prevProps.isPresent === nextProps.isPresent &&
    prevProps.isToggling === nextProps.isToggling
);

const AttendanceTaker: React.FC<AttendanceTakerProps> = ({ courses, students, attendance, setAttendance }) => {
  // Add safety checks for props
  if (!courses || !students || !attendance || !setAttendance) {
    return <div className="p-8 text-center text-on-surface dark:text-on-surface-dark">Loading attendance system...</div>;
  }

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [presentStudentIds, setPresentStudentIds] = useState<Set<string>>(new Set());
  const [isSaved, setIsSaved] = useState(false);
  const [recordExists, setRecordExists] = useState(false);
  const [recordTimestamp, setRecordTimestamp] = useState<number | null>(null);
  const [justToggledStudentId, setJustToggledStudentId] = useState<string | null>(null);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [photoToView, setPhotoToView] = useState<{ url: string; name: string; studentId: string; } | null>(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Check for pre-selected course from dashboard quick action
    const preselectedCourseId = sessionStorage.getItem('preselectedCourseId');
    if (preselectedCourseId) {
      handleCourseAndDateChange(preselectedCourseId, new Date().toISOString().split('T')[0]);
      sessionStorage.removeItem('preselectedCourseId'); // Clean up after use
    }
  }, []);

  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => {
        setIsSaved(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
            setIsOptionsMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const selectedCourse = useMemo(() => {
    return courses.find(c => c.id === selectedCourseId);
  }, [selectedCourseId, courses]);
  
  const enrolledStudents = useMemo(() => {
    if (!selectedCourse) return [];
    return students.filter(s => selectedCourse.studentIds.includes(s.id));
  }, [selectedCourse, students]);
  
  const openPhotoViewer = useCallback((e: React.MouseEvent, student: Student) => {
    e.stopPropagation(); // Prevent toggling attendance when clicking photo
    if (student.photo) {
      setPhotoToView({ url: student.photo, name: student.name, studentId: student.studentId });
      setIsPhotoViewerOpen(true);
    }
  }, []);

  const closePhotoViewer = () => {
    setIsPhotoViewerOpen(false);
    setPhotoToView(null);
  };

  const handleCourseAndDateChange = (courseId: string, newDate: string) => {
    setSelectedCourseId(courseId);
    setDate(newDate);
    const existingRecord = attendance.find(r => r.courseId === courseId && r.date === newDate);
    setPresentStudentIds(new Set(existingRecord?.presentStudentIds || []));
    setRecordExists(!!existingRecord);
    setRecordTimestamp(existingRecord?.timestamp || null);
  }

  const handleToggleStudentPresence = useCallback((studentId: string) => {
    setPresentStudentIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(studentId)) {
            newSet.delete(studentId);
        } else {
            newSet.add(studentId);
        }
        return newSet;
    });
    setJustToggledStudentId(studentId);
    setTimeout(() => {
        setJustToggledStudentId(null);
    }, 750);
  }, []);

  const handleMarkAllPresent = () => {
    const allEnrolledIds = enrolledStudents.map(s => s.id);
    setPresentStudentIds(new Set(allEnrolledIds));
  };

  const handleClearAll = () => {
    setPresentStudentIds(new Set());
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourseId || !date) {
        alert("Please select a course and a date.");
        return;
    }
    
    const newTimestamp = Date.now();
    const existingRecordIndex = attendance.findIndex(r => r.courseId === selectedCourseId && r.date === date);
    const existingRecord = attendance[existingRecordIndex];

    // Convert presentStudentIds to attendanceData format for backend
    if (!enrolledStudents || enrolledStudents.length === 0) {
        alert("No students found for this course. Please check course enrollment.");
        return;
    }
    
    const attendanceData = enrolledStudents.map(student => ({
        studentId: student.id,
        status: presentStudentIds.has(student.id) ? 'present' : 'absent'
    }));

    try {
        if (existingRecordIndex > -1) {
            const updatedRecord = {
                ...existingRecord,
                presentStudentIds: Array.from(presentStudentIds),
                attendanceData, // Add backend-compatible format
                timestamp: newTimestamp,
            };
            
            // Optimistic update
            const updatedAttendance = [...attendance];
            updatedAttendance[existingRecordIndex] = updatedRecord;
            setAttendance(updatedAttendance);
            
            // API call
            if (existingRecord.id) {
                await api.updateAttendance(existingRecord.id, updatedRecord);
            } else {
                // If no ID, it might be a legacy record or unsaved one. Try creating.
                const created = await api.createAttendance(updatedRecord);
                if (created && (created.id || created._id)) {
                     const realId = created.id || created._id;
                     setAttendance(prev => prev.map((r, idx) => idx === existingRecordIndex ? { ...r, id: realId } : r));
                }
            }

        } else {
            const newRecord: AttendanceRecord = {
                courseId: selectedCourseId,
                date,
                presentStudentIds: Array.from(presentStudentIds),
                attendanceData, // Add backend-compatible format
                timestamp: newTimestamp,
            };
            
            // Optimistic update
            setAttendance([...attendance, newRecord]);
            
            // API call
            const created = await api.createAttendance(newRecord);
            
            // Update with real ID
            if (created && (created.id || created._id)) {
                const realId = created.id || created._id;
                setAttendance(prev => prev.map(r => r.courseId === newRecord.courseId && r.date === newRecord.date ? { ...r, id: realId } : r));
            }
        }
        setIsSaved(true);
        setRecordExists(true);
        setRecordTimestamp(newTimestamp);
    } catch (error) {
        console.error("Failed to save attendance:", error);
        alert("Failed to save attendance. Please check console for details.");
    }
  };

  const handleDownloadCSV = () => {
    if (!selectedCourse) return;

    const headers = ["Student Name", "Student ID", "Status"];
    const rows = enrolledStudents.map(student => {
        const isPresent = presentStudentIds.has(student.id);
        const status = isPresent ? "Present" : "Absent";
        // Escape commas in names
        const studentName = `"${student.name}"`;
        return [studentName, student.studentId, status];
    });

    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${selectedCourse.code}_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOptionsMenuOpen(false);
  };

  const handleDownloadPDF = () => {
    if (!selectedCourse) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const tableColumn = ["Student Name", "Student ID", "Status"];
    const tableRows = enrolledStudents.map(student => {
        const isPresent = presentStudentIds.has(student.id);
        return [student.name, student.studentId, isPresent ? "Present" : "Absent"];
    });
    
    const record = attendance.find(r => r.courseId === selectedCourseId && r.date === date);
    const timestamp = record?.timestamp;

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 25,
        didDrawPage: (data: any) => {
             doc.setFontSize(18);
             doc.text(`Attendance for ${selectedCourse.name} (${selectedCourse.code})`, data.settings.margin.left, 15);
             doc.setFontSize(12);
             const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString();
             const dateTimeString = timestamp
                ? `Date: ${formattedDate} (Saved at: ${new Date(timestamp).toLocaleTimeString()})`
                : `Date: ${formattedDate}`;
             doc.text(dateTimeString, data.settings.margin.left, 20);
        }
    });
    
    doc.save(`attendance_${selectedCourse.code}_${date}.pdf`);
    setIsOptionsMenuOpen(false);
  };


  return (
    <div>
      <h2 className="text-4xl font-bold font-serif text-on-surface dark:text-on-surface-dark mb-10 animate-slide-up-fade" style={{animationDelay: '100ms'}}>Take Attendance</h2>
      
      <div className="flex flex-col mb-8 p-6 bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl rounded-4xl border border-white/10 shadow-glass">
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1">
              <label htmlFor="course-select" className="block text-sm font-medium text-on-surface-variant dark:text-on-surface-dark-variant mb-1">Course</label>
              <select 
                id="course-select" 
                value={selectedCourseId}
                onChange={e => handleCourseAndDateChange(e.target.value, date)}
                className="appearance-none border border-border-light dark:border-border-dark rounded-2xl w-full py-2.5 px-3 text-on-surface dark:text-on-surface-dark bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
              >
                <option value="">Select a course</option>
                {courses.map(course => <option key={course.id} value={course.id}>{course.name} ({course.branch})</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="date-select" className="block text-sm font-medium text-on-surface-variant dark:text-on-surface-dark-variant mb-1">Date</label>
              <input 
                type="date" 
                id="date-select"
                value={date}
                max={today}
                onChange={e => handleCourseAndDateChange(selectedCourseId, e.target.value)}
                className="appearance-none border border-border-light dark:border-border-dark rounded-2xl w-full py-2 px-3 text-on-surface dark:text-on-surface-dark bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
              />
            </div>
        </div>
        {selectedCourseId && (
            <div className="mt-4 pt-4 border-t border-white/10">
                <label className="block text-sm font-medium text-on-surface-variant dark:text-on-surface-dark-variant mb-1">Attendance Timestamp</label>
                <div className="flex items-center text-sm text-on-surface dark:text-on-surface-dark bg-black/10 rounded-2xl h-[42px] px-3">
                    <ClockIcon className="w-5 h-5 mr-2 text-on-surface-variant dark:text-on-surface-dark-variant flex-shrink-0" />
                    {recordTimestamp ? (
                        <span className="truncate">{new Date(recordTimestamp).toLocaleString()}</span>
                    ) : (
                        <span className="italic text-on-surface-variant dark:text-on-surface-dark-variant">Not yet saved for this date</span>
                    )}
                </div>
            </div>
        )}
      </div>

      {selectedCourseId && (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold font-serif text-on-surface dark:text-on-surface-dark">Marking for <span className="text-brand">{courses.find(c=>c.id === selectedCourseId)?.name}</span></h3>
                <div className="relative" ref={optionsMenuRef}>
                    <button
                        onClick={() => setIsOptionsMenuOpen(prev => !prev)}
                        disabled={enrolledStudents.length === 0}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="More options"
                    >
                        <EllipsisVerticalIcon className="w-6 h-6 text-on-surface-variant dark:text-on-surface-dark-variant" />
                    </button>
                    {isOptionsMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-52 bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl rounded-2xl shadow-glass border border-white/10 p-2 z-10 animate-fade-in">
                           <button
                                onClick={handleDownloadCSV}
                                className="w-full text-left px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark hover:bg-brand/10 rounded-xl transition-colors flex items-center"
                            >
                                <ArrowDownTrayIcon className="w-4 h-4 mr-2.5" />
                                Download as CSV
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="w-full text-left px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark hover:bg-brand/10 rounded-xl transition-colors flex items-center"
                            >
                                <ArrowDownTrayIcon className="w-4 h-4 mr-2.5" />
                                Download as PDF
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 my-4">
              <button
                onClick={handleMarkAllPresent}
                disabled={enrolledStudents.length === 0}
                className="flex-1 sm:flex-auto flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 hover:text-emerald-300 text-on-surface-dark font-semibold py-2 px-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glass"
              >
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Mark All Present
              </button>
              <button
                onClick={handleClearAll}
                disabled={enrolledStudents.length === 0}
                className="flex-1 sm:flex-auto flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/10 hover:border-red-500/50 hover:text-red-300 text-on-surface-dark font-semibold py-2 px-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glass"
              >
                <XCircleIcon className="w-5 h-5 mr-2" />
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {enrolledStudents.map((student, index) => (
                  <StudentAttendanceItem
                    key={student.id}
                    student={student}
                    isPresent={presentStudentIds.has(student.id)}
                    isToggling={justToggledStudentId === student.id}
                    onToggle={toggleStudentPresence}
                    onPhotoClick={openPhotoViewer}
                    index={index}
                  />
              ))}
            </div>
             {enrolledStudents.length === 0 && <p className="text-sm text-center py-8 text-on-surface-variant dark:text-on-surface-dark-variant">No students enrolled in this course.</p>}

            <div className="mt-8 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
                {isSaved ? (
                    <div className="flex items-center text-success font-semibold animate-slide-up-fade flex-grow">
                        <CheckCircleIcon className="w-6 h-6 mr-2 animate-icon-pop-in" /> 
                        <span>Attendance Saved!</span>
                    </div>
                ) : <div className="flex-grow hidden sm:block"></div>}
                <button 
                    onClick={handleSaveAttendance}
                    className="w-full sm:w-auto bg-brand hover:opacity-90 text-on-surface font-bold py-3 px-8 rounded-2xl transition-all shadow-soft-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-base transform hover:scale-105"
                    disabled={enrolledStudents.length === 0}
                >
                    {recordExists ? 'Update Attendance' : 'Save Attendance'}
                </button>
            </div>
        </div>
      )}

      <PhotoViewerModal 
        isOpen={isPhotoViewerOpen}
        onClose={closePhotoViewer}
        photoUrl={photoToView?.url ?? null}
        studentName={photoToView?.name ?? null}
        studentId={photoToView?.studentId ?? null}
      />
    </div>
  );
};

export default AttendanceTaker;