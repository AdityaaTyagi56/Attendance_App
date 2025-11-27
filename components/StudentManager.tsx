import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Student, Course, AttendanceRecord, Branch } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, UserCircleIcon, CameraIcon, ArrowUpTrayIcon, XCircleIcon, ChevronUpIcon, ChevronDownIcon, EyeIcon, CheckCircleIcon, EllipsisVerticalIcon, ExclamationTriangleIcon } from './icons';
import Modal from './Modal';
import PhotoViewerModal from './PhotoViewerModal';
import ImportSummaryModal from './ImportSummaryModal';

interface StudentManagerProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  attendanceRecords: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  teacherBranch: Branch;
}

interface ImportResult {
  successCount: number;
  errors: {
    lineNumber: number;
    name: string;
    studentId: string;
    reason: string;
  }[];
}

const StudentManager: React.FC<StudentManagerProps> = ({ students: allStudents, setStudents, courses, setCourses, attendanceRecords, setAttendance, teacherBranch }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [branch, setBranch] = useState<Branch>(teacherBranch);
  const [errors, setErrors] = useState<{ studentId?: string; email?: string, branch?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importCsvInputRef = useRef<HTMLInputElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImportSummaryModalOpen, setIsImportSummaryModalOpen] = useState(false);
  
  const [sortBy, setSortBy] = useState<'studentId' | 'name'>('studentId');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  
  const [actionsMenuStudentId, setActionsMenuStudentId] = useState<string | null>(null);
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [studentForDetails, setStudentForDetails] = useState<Student | null>(null);
  
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [photoToView, setPhotoToView] = useState<{ url: string; name: string; studentId: string; } | null>(null);

  const studentsInBranch = useMemo(() => allStudents.filter(s => s.branch === teacherBranch), [allStudents, teacherBranch]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        // Correctly handle multiple action menus by checking the event path for the menu class
        const target = event.target as HTMLElement;
        if (!target.closest('.actions-menu-container')) {
            setActionsMenuStudentId(null);
        }
        if (sortMenuRef.current && !sortMenuRef.current.contains(target)) {
            setIsSortMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openPhotoViewer = (student: Student) => {
    if (student.photo) {
      setPhotoToView({ url: student.photo, name: student.name, studentId: student.studentId });
      setIsPhotoViewerOpen(true);
    }
  };

  const openPhotoViewerFromState = (photoUrl: string, studentName: string, studentIdentifier: string) => {
    if (photoUrl && studentName) {
      setPhotoToView({ url: photoUrl, name: studentName, studentId: studentIdentifier });
      setIsPhotoViewerOpen(true);
    }
  }

  const closePhotoViewer = () => {
    setIsPhotoViewerOpen(false);
    setPhotoToView(null);
  };

  const handleSort = (newSortBy: 'studentId' | 'name') => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const handleSelectSort = (newSortBy: 'studentId' | 'name', newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setIsSortMenuOpen(false);
  };

  const getSortLabel = () => {
    if (sortBy === 'name') {
        return sortOrder === 'asc' ? 'Name (A-Z)' : 'Name (Z-A)';
    }
    return sortOrder === 'asc' ? 'ID (Ascending)' : 'ID (Descending)';
  };

  const sortedAndFilteredStudents = useMemo(() => {
    const filtered = studentsInBranch.filter(student => {
      return student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    });

    filtered.sort((a, b) => {
        const valA = sortBy === 'name' ? a.name : a.studentId;
        const valB = sortBy === 'name' ? b.name : b.studentId;
        
        const compareResult = valA.localeCompare(valB, undefined, { numeric: sortBy === 'studentId' });
        
        return sortOrder === 'asc' ? compareResult : -compareResult;
    });

    return filtered;
  }, [studentsInBranch, searchQuery, sortOrder, sortBy]);


  // Bulk Selection Logic
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(studentId)) {
        newSelection.delete(studentId);
      } else {
        newSelection.add(studentId);
      }
      return newSelection;
    });
  };

  const isAllFilteredSelected = useMemo(() => {
    return sortedAndFilteredStudents.length > 0 && sortedAndFilteredStudents.every(s => selectedStudentIds.has(s.id));
  }, [sortedAndFilteredStudents, selectedStudentIds]);

  const handleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedStudentIds(prev => {
        const newSet = new Set(prev);
        sortedAndFilteredStudents.forEach(s => newSet.delete(s.id));
        return newSet;
      });
    } else {
      setSelectedStudentIds(prev => {
        const newSet = new Set(prev);
        sortedAndFilteredStudents.forEach(s => newSet.add(s.id));
        return newSet;
      });
    }
  };

  const anySelectedHavePhoto = useMemo(() => {
    return allStudents.some(s => selectedStudentIds.has(s.id) && s.photo);
  }, [allStudents, selectedStudentIds]);

  const handleConfirmBulkDelete = () => {
    // Data integrity fix: Also unenroll from courses and clean up attendance
    setCourses(prevCourses => prevCourses.map(course => ({
        ...course,
        studentIds: course.studentIds.filter(id => !selectedStudentIds.has(id))
    })));
    setAttendance(prevAttendance => prevAttendance.map(record => ({
        ...record,
        presentStudentIds: record.presentStudentIds.filter(id => !selectedStudentIds.has(id))
    })));
    
    setStudents(prev => prev.filter(s => !selectedStudentIds.has(s.id)));
    setSelectedStudentIds(new Set());
    setIsBulkDeleteModalOpen(false);
  };
  
  const getStudentOverallAttendance = (studentId: string) => {
    const studentCourses = courses.filter(c => c.studentIds.includes(studentId));
    if (studentCourses.length === 0) return 100;

    let totalClasses = 0;
    let presentClasses = 0;
    
    studentCourses.forEach(course => {
        const courseRecords = attendanceRecords.filter(r => r.courseId === course.id);
        totalClasses += courseRecords.length;
        presentClasses += courseRecords.filter(r => r.presentStudentIds.includes(studentId)).length;
    });

    if (totalClasses === 0) return 100;
    return Math.round((presentClasses / totalClasses) * 100);
  };
  
  const getStudentMonthlyAttendance = (studentId: string) => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      const studentCourses = courses.filter(c => c.studentIds.includes(studentId));
      if (studentCourses.length === 0) return 100;

      let totalClassesThisMonth = 0;
      let presentClassesThisMonth = 0;

      studentCourses.forEach(course => {
          const courseRecordsInCurrentMonth = attendanceRecords.filter(r => {
              const recordDateLocal = new Date(r.date + 'T00:00:00');
              return r.courseId === course.id &&
                     recordDateLocal.getFullYear() === currentYear &&
                     recordDateLocal.getMonth() === currentMonth;
          });

          totalClassesThisMonth += courseRecordsInCurrentMonth.length;
          presentClassesThisMonth += courseRecordsInCurrentMonth.filter(r => r.presentStudentIds.includes(studentId)).length;
      });

      if (totalClassesThisMonth === 0) {
          return 100;
      }

      return Math.round((presentClassesThisMonth / totalClassesThisMonth) * 100);
  };
  
  const handleToggleActionsMenu = (e: React.MouseEvent, studentId: string) => {
    e.stopPropagation();
    setActionsMenuStudentId(prevId => (prevId === studentId ? null : studentId));
  };


  const resetForm = () => {
    setCurrentStudent(null);
    setName('');
    setStudentId('');
    setEmail('');
    setPassword('');
    setPhoto(undefined);
    setBranch(teacherBranch);
    setErrors({});
    setPhotoError(null);
  };

  const openModalForNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openModalForEdit = (student: Student) => {
    resetForm();
    setCurrentStudent(student);
    setName(student.name);
    setStudentId(student.studentId);
    setEmail(student.email);
    setPassword(student.password);
    setPhoto(student.photo);
    setBranch(student.branch);
    setIsModalOpen(true);
    setActionsMenuStudentId(null);
  };
  
  const openDetailsModal = (student: Student) => {
    setStudentForDetails(student);
    setIsDetailsModalOpen(true);
    setActionsMenuStudentId(null);
  };

  const closeDetailsModal = () => {
    setStudentForDetails(null);
    setIsDetailsModalOpen(false);
  };


  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPhotoError(null);
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const FIVE_MB = 5 * 1024 * 1024;
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

          if (!allowedTypes.includes(file.type)) {
              setPhotoError('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.');
              return;
          }

          if (file.size > FIVE_MB) {
              setPhotoError('File is too large. Please upload an image under 5MB.');
              return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
              setPhoto(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const validate = (): boolean => {
      const newErrors: { studentId?: string; email?: string; branch?: string } = {};
      
      const isDuplicateId = allStudents.some(s => 
        s.studentId.trim().toLowerCase() === studentId.trim().toLowerCase() &&
        (!currentStudent || s.id !== currentStudent.id)
      );
      if (isDuplicateId) newErrors.studentId = 'Student ID already exists.';

      if (email && !/\S+@\S+\.\S+/.test(email)) {
          newErrors.email = 'Email address is invalid.';
      } else if (email) {
        const isDuplicateEmail = allStudents.some(s =>
            s.email.trim().toLowerCase() === email.trim().toLowerCase() &&
            (!currentStudent || s.id !== currentStudent.id)
        );
        if(isDuplicateEmail) newErrors.email = 'Email already exists.';
      }
      
      if (!branch) {
          newErrors.branch = "Please select a branch.";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || photoError) return;

    if (currentStudent) {
      setStudents(allStudents.map(s => s.id === currentStudent.id ? { ...s, name, studentId, email, password, photo, branch } : s));
    } else {
      const newStudent: Student = {
        id: Date.now().toString(),
        name,
        studentId,
        email,
        password: password || 'pass123',
        photo,
        branch,
      };
      setStudents([...allStudents, newStudent]);
      
      // Bug fix: Automatically enroll the new student in all existing courses of their branch.
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.branch === newStudent.branch 
            ? { ...course, studentIds: [...course.studentIds, newStudent.id] }
            : course
        )
      );
    }
    closeModal();
  };
  
  const openDeleteModal = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
    setActionsMenuStudentId(null);
  };

  const closeDeleteModal = () => {
    setStudentToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    
    // Data integrity fix: Also unenroll from courses and clean up attendance
    setCourses(prevCourses => prevCourses.map(course => ({
        ...course,
        studentIds: course.studentIds.filter(id => id !== studentToDelete.id)
    })));
    setAttendance(prevAttendance => prevAttendance.map(record => ({
        ...record,
        presentStudentIds: record.presentStudentIds.filter(id => id !== studentToDelete.id)
    })));

    setStudents(allStudents.filter(s => s.id !== studentToDelete.id));
    closeDeleteModal();
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setIsImportModalOpen(false);
      const csvText = event.target?.result as string;
      if (!csvText) {
        alert("Could not read the file.");
        return;
      }

      const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        alert("CSV file must have a header and at least one data row.");
        return;
      }
      
      const headerLine = lines[0].charCodeAt(0) === 0xFEFF ? lines[0].substring(1) : lines[0];
      const header = headerLine.split(',').map(h => h.trim().toLowerCase());
      
      const requiredHeaders = ['name', 'studentid', 'branch'];
      const missingHeaders = requiredHeaders.filter(rh => !header.includes(rh));
      if (missingHeaders.length > 0) {
        alert(`CSV is missing required header(s): ${missingHeaders.join(', ')}. The file must contain columns with headers 'name', 'studentid', and 'branch'.`);
        return;
      }

      const nameIndex = header.indexOf('name');
      const studentIdIndex = header.indexOf('studentid');
      const branchIndex = header.indexOf('branch');


      const newStudents: Student[] = [];
      const importErrors: ImportResult['errors'] = [];
      const existingStudentIds = new Set(allStudents.map(s => s.studentId.toLowerCase()));
      const batchStudentIds = new Set<string>(); // Bug fix: Track IDs within the CSV file
      
      lines.slice(1).forEach((line, index) => {
        const lineNumber = index + 2; // +1 for slice, +1 for 1-based index
        const values = line.split(',').map(v => v.trim());
        const name = values[nameIndex] || '';
        const studentId = values[studentIdIndex] || '';
        const branch = values[branchIndex]?.toUpperCase() as Branch || '';
        
        if (!name || !studentId || !branch) {
          importErrors.push({ lineNumber, name, studentId, reason: "Missing name, student ID, or branch." });
          return;
        }

        if (branch !== teacherBranch) {
          importErrors.push({ lineNumber, name, studentId, reason: `Branch must be '${teacherBranch}' for this teacher.` });
          return;
        }

        if (existingStudentIds.has(studentId.toLowerCase()) || batchStudentIds.has(studentId.toLowerCase())) {
          importErrors.push({ lineNumber, name, studentId, reason: "Student ID already exists." });
          return;
        }

        const newStudent: Student = {
          id: `${Date.now()}-${index}`,
          name,
          studentId,
          email: '',
          password: 'pass123',
          branch,
        };
        newStudents.push(newStudent);
        batchStudentIds.add(studentId.toLowerCase()); // Bug fix: Add to batch set
      });

      if (newStudents.length > 0) {
        setStudents(prev => [...prev, ...newStudents]);
      }
      
      setImportResult({
        successCount: newStudents.length,
        errors: importErrors
      });
      setIsImportSummaryModalOpen(true);
    };

    reader.readAsText(file);
    if (e.target) {
        e.target.value = '';
    }
  };

  const handleCloseImportSummary = () => {
    setIsImportSummaryModalOpen(false);
    setImportResult(null);
  };


  const studentListContent = () => {
    if (studentsInBranch.length === 0) {
      return <p className="text-center py-12 col-span-full text-on-surface-variant dark:text-on-surface-dark-variant text-lg">No students found. Add one to get started.</p>;
    }
    if (sortedAndFilteredStudents.length === 0) {
      return <p className="text-center py-12 col-span-full text-on-surface-variant dark:text-on-surface-dark-variant text-lg">No students found matching your search.</p>;
    }
    return null;
  };
  
  const AttendanceHistory = ({ student }: { student: Student }) => {
    const [selectedCourseId, setSelectedCourseId] = useState('');

    const enrolledCourses = useMemo(() => {
        return courses.filter(c => c.studentIds.includes(student.id));
    }, [student.id]);

    useEffect(() => {
        if (enrolledCourses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(enrolledCourses[0].id);
        }
    }, [enrolledCourses, selectedCourseId]);

    const historyRecords = useMemo(() => {
        if (!selectedCourseId) return [];
        return attendanceRecords
            .filter(r => r.courseId === selectedCourseId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [selectedCourseId, attendanceRecords]);

    return (
      <div>
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-border-light dark:border-border-dark">
            {student.photo ? (
                <img onClick={() => openPhotoViewer(student)} src={student.photo} alt={student.name} className="w-16 h-16 rounded-full object-cover ring-4 ring-white/10 cursor-pointer hover:ring-2 hover:ring-brand transition-all" />
            ) : (
                <UserCircleIcon className="w-16 h-16 text-on-surface-variant/30 dark:text-on-surface-dark-variant/30" />
            )}
            <div>
                <h4 className="text-lg font-bold text-on-surface dark:text-on-surface-dark">{student.name}</h4>
                <p className="text-sm text-on-surface-variant dark:text-on-surface-dark-variant font-mono">{student.studentId}</p>
            </div>
        </div>

        {enrolledCourses.length > 0 ? (
            <>
                <div className="mb-4">
                    <label htmlFor="course-history-select" className="block text-sm font-medium text-on-surface-variant dark:text-on-surface-dark-variant mb-1">Select Course</label>
                    <select
                        id="course-history-select"
                        value={selectedCourseId}
                        onChange={e => setSelectedCourseId(e.target.value)}
                        className="appearance-none border border-border-light dark:border-border-dark rounded-2xl w-full py-2 px-3 text-on-surface dark:text-on-surface-dark bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    >
                        {enrolledCourses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
                    </select>
                </div>
                <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                    {historyRecords.length > 0 ? historyRecords.map(record => {
                        const isPresent = record.presentStudentIds.includes(student.id);
                        return (
                            <div key={record.date} className="flex justify-between items-center p-3 rounded-2xl bg-black/10">
                                <div>
                                    <p className="font-semibold text-on-surface dark:text-on-surface-dark">{new Date(record.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    {record.timestamp && (
                                        <p className="text-xs text-on-surface-variant dark:text-on-surface-dark-variant">
                                            Recorded at: {new Date(record.timestamp).toLocaleTimeString()}
                                        </p>
                                    )}
                                </div>
                                {isPresent ? (
                                    <span className="flex items-center text-sm font-semibold text-success">
                                        <CheckCircleIcon className="w-5 h-5 mr-1.5" /> Present
                                    </span>
                                ) : (
                                    <span className="flex items-center text-sm font-semibold text-danger">
                                        <XCircleIcon className="w-5 h-5 mr-1.5" /> Absent
                                    </span>
                                )}
                            </div>
                        );
                    }) : <p className="text-center text-sm text-on-surface-variant dark:text-on-surface-dark-variant py-6">No attendance records found for this course.</p>}
                </div>
            </>
        ) : (
            <p className="text-center text-on-surface-variant dark:text-on-surface-dark-variant py-6">This student is not enrolled in any courses.</p>
        )}
        <div className="flex justify-end mt-6">
            <button onClick={closeDetailsModal} className="bg-white/5 hover:bg-white/10 text-on-surface-dark font-semibold py-2 px-4 rounded-2xl transition-colors">Close</button>
        </div>
      </div>
    );
  };

  const modalInputClasses = "appearance-none border border-border-light dark:border-border-dark rounded-2xl w-full py-2.5 px-4 text-on-surface dark:text-on-surface-dark bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all placeholder:text-on-surface-variant dark:placeholder:text-on-surface-dark-variant";


  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-10 gap-4">
        <h2 className="text-4xl font-bold font-serif text-on-surface dark:text-on-surface-dark animate-slide-up-fade" style={{animationDelay: '100ms'}}>Students</h2>
        {selectedStudentIds.size > 0 ? (
          <div className="flex items-center space-x-2 bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl p-2 rounded-2xl border border-white/10 animate-fade-in shadow-glass">
            <span className="font-semibold text-on-surface dark:text-on-surface-dark pl-2 text-sm">{selectedStudentIds.size} selected</span>
            <button onClick={() => setSelectedStudentIds(new Set())} className="text-on-surface-variant dark:text-on-surface-dark-variant hover:text-brand font-semibold py-2 px-3 rounded-xl transition-colors flex items-center text-sm hover:bg-white/5">
              <XCircleIcon className="w-5 h-5 mr-1" />
              Deselect
            </button>
            <button onClick={() => setIsBulkDeleteModalOpen(true)} className="bg-danger hover:opacity-90 text-white font-semibold py-2 px-3 rounded-xl flex items-center transition-colors shadow-sm text-sm">
              <TrashIcon className="w-5 h-5 mr-2" />
              Delete
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
              <input
                  type="file"
                  ref={importCsvInputRef}
                  onChange={handleCsvFileChange}
                  className="hidden"
                  accept=".csv"
              />
              <button onClick={() => setIsImportModalOpen(true)} className="bg-white/10 backdrop-blur-xl border border-white/10 hover:bg-white/20 text-on-surface dark:text-on-surface-dark font-semibold py-2.5 px-5 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-glass">
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                Import
              </button>
              <button onClick={openModalForNew} className="bg-brand hover:opacity-90 text-on-surface font-semibold py-2.5 px-5 rounded-2xl flex items-center justify-center transition-all shadow-soft active:scale-95">
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Student
              </button>
          </div>
        )}
      </div>

      <div className="mb-8 p-4 bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl rounded-4xl border border-white/10 flex flex-col md:flex-row gap-3 shadow-glass relative z-20">
        <input
          type="text"
          placeholder="Search students by name or ID..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-grow appearance-none border-none rounded-2xl w-full py-3 px-5 text-on-surface dark:text-on-surface-dark bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all placeholder:text-on-surface-variant dark:placeholder:text-on-surface-dark-variant"
        />
        {/* Mobile Sort Dropdown */}
        <div ref={sortMenuRef} className="relative md:hidden">
            <button
                onClick={() => setIsSortMenuOpen(prev => !prev)}
                className="flex items-center justify-between w-full appearance-none rounded-2xl py-3 px-5 text-on-surface dark:text-on-surface-dark bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all font-semibold"
            >
                <span>Sort: {getSortLabel()}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isSortMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSortMenuOpen && (
                <div className="absolute top-full mt-2 w-full bg-surface-dark/80 backdrop-blur-xl rounded-2xl shadow-glass border border-white/10 p-2 z-10 animate-fade-in">
                    <button onClick={() => handleSelectSort('name', 'asc')} className="w-full text-left flex items-center px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark hover:bg-brand/10 rounded-xl transition-colors">
                        Name (A-Z)
                    </button>
                    <button onClick={() => handleSelectSort('name', 'desc')} className="w-full text-left flex items-center px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark hover:bg-brand/10 rounded-xl transition-colors">
                        Name (Z-A)
                    </button>
                    <button onClick={() => handleSelectSort('studentId', 'asc')} className="w-full text-left flex items-center px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark hover:bg-brand/10 rounded-xl transition-colors">
                        ID (Ascending)
                    </button>
                    <button onClick={() => handleSelectSort('studentId', 'desc')} className="w-full text-left flex items-center px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark hover:bg-brand/10 rounded-xl transition-colors">
                        ID (Descending)
                    </button>
                </div>
            )}
        </div>
      </div>
      
      <div className="md:hidden space-y-4">
        {studentListContent() || sortedAndFilteredStudents.map(student => {
          const isSelected = selectedStudentIds.has(student.id);
          const attendancePercentage = getStudentOverallAttendance(student.id);
          const monthlyAttendance = getStudentMonthlyAttendance(student.id);
          const indicatorColor = monthlyAttendance >= 80 ? 'bg-success' : monthlyAttendance >= 50 ? 'bg-warning' : 'bg-danger';
          const colorClass = attendancePercentage >= 75 ? 'bg-success' : attendancePercentage >= 50 ? 'bg-warning' : 'bg-danger';

          return (
          <div 
            key={student.id} 
            className={`bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl rounded-4xl border border-white/10 shadow-glass transition-all duration-300 ${isSelected ? 'ring-2 ring-brand' : ''}`}
          >
            <div className="p-4 flex items-start space-x-4">
              <div onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectStudent(student.id)}
                    className="h-5 w-5 rounded border-on-surface-variant/50 dark:border-on-surface-dark-variant/50 text-brand bg-transparent focus:ring-brand mt-1 flex-shrink-0"
                  />
              </div>
              {student.photo ? (
                <img onClick={() => openPhotoViewer(student)} src={student.photo} alt={student.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-brand transition-all" />
              ) : (
                <UserCircleIcon className="w-12 h-12 text-on-surface-variant/30 dark:text-on-surface-dark-variant/30 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                    <span title={`Monthly Attendance: ${monthlyAttendance}%`} className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${indicatorColor}`}></span>
                    <p className="font-bold text-lg text-on-surface dark:text-on-surface-dark truncate">{student.name}</p>
                </div>
                <p className="text-sm text-on-surface-variant dark:text-on-surface-dark-variant truncate font-mono">{student.studentId}</p>
                 <div className="mt-2">
                    <span className="text-xs font-semibold bg-brand text-on-surface dark:text-brand-50 px-2.5 py-1 rounded-full">{student.branch}</span>
                 </div>
              </div>
              <div className="relative actions-menu-container">
                <button onClick={(e) => handleToggleActionsMenu(e, student.id)} className="text-on-surface-variant dark:text-on-surface-dark-variant p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors">
                  <EllipsisVerticalIcon className="w-6 h-6" />
                </button>
                {actionsMenuStudentId === student.id && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl rounded-2xl shadow-glass border border-white/10 p-2 z-10 animate-fade-in">
                      <button onClick={() => openDetailsModal(student)} className="w-full text-left flex items-center px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark hover:bg-brand/10 rounded-xl transition-colors">
                          <EyeIcon className="w-4 h-4 mr-2.5" /> View History
                      </button>
                      <button onClick={() => openModalForEdit(student)} className="w-full text-left flex items-center px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark hover:bg-brand/10 rounded-xl transition-colors">
                          <PencilIcon className="w-4 h-4 mr-2.5" /> Edit
                      </button>
                      <button onClick={() => openDeleteModal(student)} className="w-full text-left flex items-center px-3 py-2 text-sm text-danger dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                          <TrashIcon className="w-4 h-4 mr-2.5" /> Delete
                      </button>
                  </div>
                )}
              </div>
            </div>
            <div className="px-4 pb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-on-surface-variant dark:text-on-surface-dark-variant">Overall Attendance</span>
                    <span className="text-sm font-bold text-on-surface dark:text-on-surface-dark">{attendancePercentage}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                    <div className={`${colorClass} h-2 rounded-full transition-all duration-500`} style={{ width: `${attendancePercentage}%` }}></div>
                </div>
            </div>
          </div>
        )})}
      </div>


      <div className="overflow-x-auto hidden md:block bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl rounded-4xl border border-white/10 shadow-glass">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3 px-4">
                <input
                  type="checkbox"
                  checked={isAllFilteredSelected}
                  onChange={handleSelectAll}
                  className="h-5 w-5 rounded border-on-surface-variant/50 dark:border-on-surface-dark-variant/50 text-brand bg-transparent focus:ring-brand"
                />
              </th>
              <th className="text-left py-3 px-4 uppercase font-bold text-xs text-on-surface-variant dark:text-on-surface-dark-variant tracking-wider">Photo</th>
              <th className="text-left py-3 px-4 uppercase font-bold text-xs text-on-surface-variant dark:text-on-surface-dark-variant tracking-wider">
                <button onClick={() => handleSort('name')} className="flex items-center space-x-1 group transition-colors">
                  <span className={sortBy === 'name' ? 'text-brand' : 'group-hover:text-on-surface dark:group-hover:text-on-surface-dark'}>Name</span>
                  {sortBy === 'name' && (sortOrder === 'asc' ? <ChevronUpIcon className="w-4 h-4 text-brand" /> : <ChevronDownIcon className="w-4 h-4 text-brand" />)}
                </button>
              </th>
              <th className="text-left py-3 px-4 uppercase font-bold text-xs text-on-surface-variant dark:text-on-surface-dark-variant tracking-wider">
                 <button onClick={() => handleSort('studentId')} className="flex items-center space-x-1 group transition-colors">
                  <span className={sortBy === 'studentId' ? 'text-brand' : 'group-hover:text-on-surface dark:group-hover:text-on-surface-dark'}>Student ID</span>
                  {sortBy === 'studentId' && (sortOrder === 'asc' ? <ChevronUpIcon className="w-4 h-4 text-brand" /> : <ChevronDownIcon className="w-4 h-4 text-brand" />)}
                </button>
              </th>
              <th className="text-left py-3 px-4 uppercase font-bold text-xs text-on-surface-variant dark:text-on-surface-dark-variant tracking-wider">Branch</th>
              <th className="text-left py-3 px-4 uppercase font-bold text-xs text-on-surface-variant dark:text-on-surface-dark-variant tracking-wider">Attendance</th>
              <th className="text-left py-3 px-4 uppercase font-bold text-xs text-on-surface-variant dark:text-on-surface-dark-variant tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="text-on-surface dark:text-on-surface-dark">
            {studentListContent() || sortedAndFilteredStudents.map(student => {
              const isSelected = selectedStudentIds.has(student.id);
              const attendancePercentage = getStudentOverallAttendance(student.id);
              const monthlyAttendance = getStudentMonthlyAttendance(student.id);
              const indicatorColor = monthlyAttendance >= 80 ? 'bg-success' : monthlyAttendance >= 50 ? 'bg-warning' : 'bg-danger';
              const colorClass = attendancePercentage >= 75 ? 'bg-success' : attendancePercentage >= 50 ? 'bg-warning' : 'bg-danger';
              return (
              <tr key={student.id} className={`transition-colors border-b border-white/10 last:border-b-0 ${isSelected ? 'bg-brand/10' : 'hover:bg-white/5'}`}>
                <td className="py-2.5 px-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectStudent(student.id)}
                    className="h-5 w-5 rounded border-on-surface-variant/50 dark:border-on-surface-dark-variant/50 text-brand bg-transparent focus:ring-brand"
                  />
                </td>
                <td className="py-2.5 px-4">
                    {student.photo ? (
                        <img onClick={() => openPhotoViewer(student)} src={student.photo} alt={student.name} className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-brand transition-shadow" />
                    ) : (
                        <UserCircleIcon className="w-10 h-10 text-on-surface-variant/30 dark:text-on-surface-dark-variant/30" />
                    )}
                </td>
                <td className="py-2.5 px-4 align-middle font-semibold text-md text-on-surface dark:text-on-surface-dark cursor-pointer" onClick={() => handleSelectStudent(student.id)}>
                    <div className="flex items-center">
                        <span title={`Monthly Attendance: ${monthlyAttendance}%`} className={`w-2.5 h-2.5 rounded-full mr-2.5 flex-shrink-0 ${indicatorColor}`}></span>
                        <span>{student.name}</span>
                    </div>
                </td>
                <td className="py-2.5 px-4 align-middle font-mono text-on-surface-variant dark:text-on-surface-dark-variant cursor-pointer" onClick={() => handleSelectStudent(student.id)}>{student.studentId}</td>
                <td className="py-2.5 px-4 align-middle cursor-pointer" onClick={() => handleSelectStudent(student.id)}><span className="text-xs font-semibold bg-brand text-on-surface dark:text-brand-50 px-2.5 py-1 rounded-full">{student.branch}</span></td>
                <td className="py-2.5 px-4 align-middle font-semibold text-on-surface dark:text-on-surface-dark cursor-pointer" onClick={() => handleSelectStudent(student.id)}>
                    <div className="flex items-center gap-3">
                        <span className="w-12 text-right">{attendancePercentage}%</span>
                        <div className="w-full bg-white/5 rounded-full h-1.5">
                            <div className={`${colorClass} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${attendancePercentage}%` }}></div>
                        </div>
                    </div>
                </td>
                <td className="py-2.5 px-4 align-middle">
                  <button onClick={(e) => { e.stopPropagation(); openDetailsModal(student); }} className="text-on-surface-variant dark:text-on-surface-dark-variant hover:text-brand p-2 rounded-full hover:bg-white/5 transition-colors">
                    <EyeIcon className="w-5 h-5"/>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); openModalForEdit(student); }} className="text-on-surface-variant dark:text-on-surface-dark-variant hover:text-brand p-2 rounded-full hover:bg-white/5 transition-colors">
                    <PencilIcon className="w-5 h-5"/>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); openDeleteModal(student); }} className="text-on-surface-variant dark:text-on-surface-dark-variant hover:text-danger p-2 rounded-full hover:bg-white/5 transition-colors">
                    <TrashIcon className="w-5 h-5"/>
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentStudent ? 'Edit Student Details' : 'Add New Student'}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-6 flex flex-col items-center">
              {photo ? (
                  <img onClick={() => openPhotoViewerFromState(photo, name, studentId)} src={photo} alt="Student" className="w-28 h-28 rounded-full object-cover mb-3 ring-4 ring-white/10 cursor-pointer hover:ring-2 hover:ring-brand transition-all" />
              ) : (
                  <UserCircleIcon className="w-28 h-28 text-on-surface-variant/30 dark:text-on-surface-dark-variant/30 mb-3" />
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg,image/png,image/gif,image/webp" capture="user"/>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center text-sm text-brand hover:opacity-80 font-semibold">
                  <CameraIcon className="w-5 h-5 mr-1" />
                  {photo ? 'Change Photo' : 'Add Photo'}
              </button>
              {photoError && <p className="text-danger text-xs italic mt-2 text-center">{photoError}</p>}
              {photo && !photoError && (<button type="button" onClick={() => setPhoto(undefined)} className="mt-2 text-xs text-danger hover:underline">Remove Photo</button>)}
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-on-surface-variant dark:text-on-surface-dark-variant text-sm font-bold mb-2">Full Name</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className={modalInputClasses} />
            </div>
            <div>
              <label htmlFor="studentId" className="block text-on-surface-variant dark:text-on-surface-dark-variant text-sm font-bold mb-2">Student ID</label>
              <input type="text" id="studentId" value={studentId} onChange={e => setStudentId(e.target.value)} required className={modalInputClasses} />
              {errors.studentId && <p className="text-danger text-xs italic mt-2">{errors.studentId}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-on-surface-variant dark:text-on-surface-dark-variant text-sm font-bold mb-2">Email</label>
              <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className={modalInputClasses} />
              {errors.email && <p className="text-danger text-xs italic mt-2">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="branch" className="block text-on-surface-variant dark:text-on-surface-dark-variant text-sm font-bold mb-2">Branch</label>
                <input type="text" id="branch" value={branch} required disabled className={`${modalInputClasses} opacity-70 cursor-not-allowed`} />
            </div>
            <div>
              <label htmlFor="password" className="block text-on-surface-variant dark:text-on-surface-dark-variant text-sm font-bold mb-2">Password</label>
              <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={currentStudent ? "Enter new password to change" : "Default: pass123"} className={modalInputClasses} />
              <p className="text-xs text-on-surface-variant dark:text-on-surface-dark-variant mt-1">Note: In a real app, passwords would be securely hashed.</p>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-3 mt-6">
            <button type="button" onClick={closeModal} className="bg-white/5 hover:bg-white/10 text-on-surface-dark font-semibold py-2 px-4 rounded-2xl transition-colors">Cancel</button>
            <button type="submit" className="bg-brand hover:opacity-90 text-on-surface font-semibold py-2 px-4 rounded-2xl transition-all shadow-soft">{currentStudent ? 'Save Changes' : 'Add Student'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Confirm Deletion">
        <div>
            <p className="text-on-surface dark:text-on-surface-dark mb-4">
              Are you sure you want to delete the student <span className="font-bold">{studentToDelete?.name}</span>?
              {studentToDelete?.photo && <span className="block mt-2">This will also permanently delete their associated photo.</span>}
            </p>
            <p className="text-sm text-danger dark:text-red-400">This action is permanent and cannot be undone.</p>
        </div>
        <div className="flex items-center justify-end mt-6 space-x-3">
            <button type="button" onClick={closeDeleteModal} className="bg-white/5 hover:bg-white/10 text-on-surface-dark font-semibold py-2 px-4 rounded-2xl transition-colors">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} className="bg-danger hover:opacity-90 text-white font-semibold py-2 px-4 rounded-2xl transition-colors shadow-soft">Delete Student</button>
        </div>
      </Modal>
      
      <Modal isOpen={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} title="Confirm Bulk Deletion">
        <div>
            <p className="text-on-surface dark:text-on-surface-dark mb-4">
              Are you sure you want to delete the selected <span className="font-bold">{selectedStudentIds.size} students</span>?
              {anySelectedHavePhoto && <span className="block mt-2">This will also permanently delete all associated photos.</span>}
            </p>
            <p className="text-sm text-danger dark:text-red-400">This action is permanent and cannot be undone.</p>
        </div>
        <div className="flex items-center justify-end mt-6 space-x-3">
            <button type="button" onClick={() => setIsBulkDeleteModalOpen(false)} className="bg-white/5 hover:bg-white/10 text-on-surface-dark font-semibold py-2 px-4 rounded-2xl transition-colors">Cancel</button>
            <button type="button" onClick={handleConfirmBulkDelete} className="bg-danger hover:opacity-90 text-white font-semibold py-2 px-4 rounded-2xl transition-colors shadow-soft">Delete Students</button>
        </div>
      </Modal>
      
      <Modal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        title="Import Students from CSV"
        footer={
          <div className="flex items-center justify-end space-x-3">
            <button type="button" onClick={() => setIsImportModalOpen(false)} className="bg-white/5 hover:bg-white/10 text-on-surface-dark font-semibold py-2 px-4 rounded-2xl transition-colors">Cancel</button>
            <button type="button" onClick={() => importCsvInputRef.current?.click()} className="bg-brand hover:opacity-90 text-on-surface font-semibold py-2 px-4 rounded-2xl transition-all shadow-soft flex items-center">
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                Select File
            </button>
          </div>
        }
      >
        <div>
          <p className="text-on-surface-variant dark:text-on-surface-dark-variant mb-4">
            Select a CSV file to import students. The file must have a header row with the following columns. The branch for all imported students must match your assigned branch (<span className="font-bold">{teacherBranch}</span>).
          </p>
          <ul className="list-disc list-inside mb-4 bg-black/10 p-3 rounded-3xl text-on-surface-variant dark:text-on-surface-dark-variant space-y-1">
            <li><code className="font-mono bg-white/5 py-0.5 px-1 rounded-md text-sm">name</code> - The student's full name.</li>
            <li><code className="font-mono bg-white/5 py-0.5 px-1 rounded-md text-sm">studentid</code> - The unique student ID.</li>
            <li><code className="font-mono bg-white/5 py-0.5 px-1 rounded-md text-sm">branch</code> - The student's branch (must be {teacherBranch}).</li>
          </ul>
          <div className="bg-black/10 p-3 rounded-3xl text-sm text-on-surface-variant dark:text-on-surface-dark-variant">
            <p className="font-bold mb-1">Example:</p>
            <pre className="font-mono text-xs">
              name,studentid,branch<br/>
              John Doe,2023001,{teacherBranch}<br/>
              Jane Smith,2023002,{teacherBranch}
            </pre>
          </div>
        </div>
      </Modal>

      <ImportSummaryModal
        isOpen={isImportSummaryModalOpen}
        onClose={handleCloseImportSummary}
        result={importResult}
        itemType="students"
      />

      <Modal isOpen={isDetailsModalOpen} onClose={closeDetailsModal} title="Student Attendance History">
        {studentForDetails && <AttendanceHistory student={studentForDetails} />}
      </Modal>

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

export default StudentManager;