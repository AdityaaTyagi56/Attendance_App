import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Course, Student, Branch, AttendanceRecord } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, ArrowUpTrayIcon, EllipsisVerticalIcon, UserGroupIcon } from './icons';
import Modal from './Modal';
import ImportSummaryModal from './ImportSummaryModal';
import * as api from '../services/apiService';

interface CourseManagerProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  students: Student[];
  teacherBranch: Branch;
  attendanceRecords: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
}

interface ImportResult {
  successCount: number;
  errors: {
    lineNumber: number;
    name: string;
    reason: string;
  }[];
}

const CourseManager: React.FC<CourseManagerProps> = ({ courses: allCourses, setCourses, students, teacherBranch, attendanceRecords, setAttendance }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [name, setName] = useState('');
  const [branch, setBranch] = useState<Branch>(teacherBranch);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImportSummaryModalOpen, setIsImportSummaryModalOpen] = useState(false);
  const importCsvInputRef = useRef<HTMLInputElement>(null);
  
  const [actionsMenuCourseId, setActionsMenuCourseId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.actions-menu-container')) {
            setActionsMenuCourseId(null);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const coursesInBranch = useMemo(() => allCourses.filter(c => c.branch === teacherBranch), [allCourses, teacherBranch]);

  const filteredCourses = useMemo(() => {
    return coursesInBranch.filter(course => {
      return course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             course.code.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [coursesInBranch, searchQuery]);
  
  const generateCourseCode = (courseName: string): string => {
      const words = courseName.split(' ').filter(Boolean);
      const initials = words.map(w => w[0]).join('').toUpperCase();
      const randomNum = Math.floor(100 + Math.random() * 900);
      return `${initials.slice(0, 4)}-${randomNum}`;
  };

  const openModalForNew = () => {
    setCurrentCourse(null);
    setName('');
    setBranch(teacherBranch);
    setIsModalOpen(true);
  };

  const openModalForEdit = (course: Course) => {
    setCurrentCourse(course);
    setName(course.name);
    setBranch(course.branch);
    setIsModalOpen(true);
    setActionsMenuCourseId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCourse(null);
  };
  
  const handleToggleActionsMenu = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    setActionsMenuCourseId(prevId => (prevId === courseId ? null : courseId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Bug fix: Automatically enroll all students from the current teacher's branch
    const studentsInCurrentBranch = students.filter(s => s.branch === branch);
    const allStudentIdsInBranch = studentsInCurrentBranch.map(s => s.id);

    try {
      if (currentCourse) {
        const updatedCourse = { ...currentCourse, name, studentIds: allStudentIdsInBranch, branch };
        // Optimistic update
        setCourses(allCourses.map(c => c.id === currentCourse.id ? updatedCourse : c));
        
        // API call
        await api.updateCourse(currentCourse.id, updatedCourse);
      } else {
        const newCourse: Course = {
          id: Date.now().toString(),
          name,
          code: generateCourseCode(name),
          studentIds: allStudentIdsInBranch,
          branch,
        };
        
        // Optimistic update
        setCourses([...allCourses, newCourse]);
        
        // API call
        const created = await api.createCourse(newCourse);
        
        // Update with real ID
        if (created && (created.id || created._id)) {
            const realId = created.id || created._id;
            setCourses(prev => prev.map(c => c.id === newCourse.id ? { ...c, id: realId } : c));
        }
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save course:", error);
      alert("Failed to save course.");
    }
  };
  
  const openDeleteModal = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
    setActionsMenuCourseId(null);
  };

  const closeDeleteModal = () => {
    setCourseToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    
    try {
        // Optimistic update
        setAttendance(prevAttendance => prevAttendance.filter(record => record.courseId !== courseToDelete.id));
        setCourses(allCourses.filter(c => c.id !== courseToDelete.id));
        
        // API call
        await api.deleteCourse(courseToDelete.id);
        
        closeDeleteModal();
    } catch (error) {
        console.error("Failed to delete course:", error);
        alert("Failed to delete course.");
    }
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
      
      const requiredHeaders = ['name', 'branch'];
      const missingHeaders = requiredHeaders.filter(rh => !header.includes(rh));
      if (missingHeaders.length > 0) {
        alert(`CSV is missing required header(s): ${missingHeaders.join(', ')}. The file must contain columns with headers 'name' and 'branch'.`);
        return;
      }

      const nameIndex = header.indexOf('name');
      const branchIndex = header.indexOf('branch');

      const newCourses: Course[] = [];
      const importErrors: ImportResult['errors'] = [];
      const existingCourseNames = new Set(coursesInBranch.map(c => c.name.toLowerCase()));
      const batchCourseNames = new Set<string>(); // Bug fix: Track names within the CSV file
      
      lines.slice(1).forEach((line, index) => {
        const lineNumber = index + 2;
        const values = line.split(',').map(v => v.trim());
        const name = values[nameIndex] || '';
        const branch = values[branchIndex]?.toUpperCase() as Branch || '';
        
        if (!name || !branch) {
          importErrors.push({ lineNumber, name, reason: "Missing course name or branch." });
          return;
        }

        if (branch !== teacherBranch) {
          importErrors.push({ lineNumber, name, reason: `Branch must be '${teacherBranch}' for this teacher.` });
          return;
        }

        if (existingCourseNames.has(name.toLowerCase()) || batchCourseNames.has(name.toLowerCase())) {
          importErrors.push({ lineNumber, name, reason: "Course with this name already exists." });
          return;
        }
        
        const studentsInCsvBranch = students.filter(s => s.branch === branch);
        const allStudentIdsInBranch = studentsInCsvBranch.map(s => s.id);

        const newCourse: Course = {
          id: `${Date.now()}-${index}`,
          name,
          code: generateCourseCode(name),
          branch,
          studentIds: allStudentIdsInBranch,
        };
        newCourses.push(newCourse);
        batchCourseNames.add(name.toLowerCase());
      });

      if (newCourses.length > 0) {
        setCourses(prev => [...prev, ...newCourses]);
      }
      
      setImportResult({
        successCount: newCourses.length,
        errors: importErrors
      });
      setIsImportSummaryModalOpen(true);
    };

    reader.readAsText(file);
    if (e.target) {
        e.target.value = '';
    }
  };


  const getStudentDisplay = (id: string) => {
    const student = students.find(s => s.id === id);
    return student ? `${student.name} (${student.branch})` : 'Unknown Student';
  }

  const modalInputClasses = "appearance-none border border-border-light dark:border-border-dark rounded-2xl w-full py-2.5 px-4 text-on-surface dark:text-on-surface-dark bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all";

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-10 gap-4">
        <h2 className="text-4xl font-bold font-serif text-on-surface dark:text-on-surface-dark animate-slide-up-fade" style={{ animationDelay: '100ms' }}>Courses</h2>
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
              Add Course
            </button>
        </div>
      </div>
      
      <div className="mb-8 p-4 bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl rounded-4xl border border-white/10 flex flex-col md:flex-row gap-3 shadow-glass">
        <input
          type="text"
          placeholder="Search courses by name or code..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-grow appearance-none border-none rounded-2xl w-full py-3 px-5 text-on-surface dark:text-on-surface-dark bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all placeholder:text-on-surface-variant dark:placeholder:text-on-surface-dark-variant"
        />
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesInBranch.length === 0 ? (
                <p className="text-center py-12 col-span-full text-on-surface-variant dark:text-on-surface-dark-variant text-lg">No courses found. Add one to get started.</p>
            ) : filteredCourses.length === 0 ? (
                <p className="text-center py-12 col-span-full text-on-surface-variant dark:text-on-surface-dark-variant text-lg">No courses found matching your search.</p>
            ) : (
                filteredCourses.map(course => (
                <div key={course.id} className="bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl rounded-4xl p-4 sm:p-6 border border-white/10 shadow-glass transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 pr-2">
                            <h3 className="font-bold text-xl text-on-surface dark:text-on-surface-dark">{course.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <p className="text-sm text-on-surface-variant dark:text-on-surface-dark-variant font-mono">{course.code}</p>
                              <span className="text-xs font-semibold bg-brand text-on-surface dark:text-brand-50 px-2.5 py-1 rounded-full">{course.branch}</span>
                            </div>
                        </div>
                        <div className="relative actions-menu-container">
                            <button onClick={(e) => handleToggleActionsMenu(e, course.id)} className="text-on-surface-variant dark:text-on-surface-dark-variant p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors">
                              <EllipsisVerticalIcon className="w-6 h-6" />
                            </button>
                            {actionsMenuCourseId === course.id && (
                              <div className="absolute top-full right-0 mt-2 w-48 bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl rounded-2xl shadow-glass border border-white/10 p-2 z-10 animate-fade-in">
                                  <button onClick={() => openModalForEdit(course)} className="w-full text-left flex items-center px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark hover:bg-brand/10 rounded-xl transition-colors">
                                      <PencilIcon className="w-4 h-4 mr-2.5" /> Edit
                                  </button>
                                  <button onClick={() => openDeleteModal(course)} className="w-full text-left flex items-center px-3 py-2 text-sm text-danger dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                                      <TrashIcon className="w-4 h-4 mr-2.5" /> Delete
                                  </button>
                              </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 flex-grow">
                        <h4 className="font-semibold text-sm mb-2 text-on-surface dark:text-on-surface-dark flex items-center">
                          <UserGroupIcon className="w-5 h-5 mr-2 text-on-surface-variant dark:text-on-surface-dark-variant" />
                          Enrolled Students ({course.studentIds.length})
                        </h4>
                        <ul className="text-sm list-disc list-inside max-h-36 overflow-y-auto text-on-surface-variant dark:text-on-surface-dark-variant space-y-1 pr-2">
                            {course.studentIds.map(id => <li key={id}>{getStudentDisplay(id)}</li>)}
                        </ul>
                         {course.studentIds.length === 0 && <p className="text-xs text-slate-400 italic mt-2">No students enrolled.</p>}
                    </div>
                </div>
            )))}
       </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentCourse ? 'Edit Course' : 'Add New Course'}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="courseName" className="block text-on-surface-variant dark:text-on-surface-dark-variant text-sm font-bold mb-2">Course Name</label>
            <input type="text" id="courseName" value={name} onChange={e => setName(e.target.value)} required className={modalInputClasses} />
          </div>
          <div className="mt-4 mb-6">
            <label htmlFor="branch" className="block text-on-surface-variant dark:text-on-surface-dark-variant text-sm font-bold mb-2">Branch</label>
            <input type="text" id="branch" value={branch} required disabled className={`${modalInputClasses} opacity-70 cursor-not-allowed`} />
          </div>
          <div className="bg-black/10 p-3 rounded-3xl text-sm text-on-surface-variant dark:text-on-surface-dark-variant">
            All students in the <span className="font-bold">{branch}</span> branch will be automatically enrolled in this course.
          </div>
          <div className="flex items-center justify-end space-x-3 mt-6">
             <button type="button" onClick={closeModal} className="bg-white/5 hover:bg-white/10 text-on-surface-dark font-semibold py-2 px-4 rounded-2xl transition-colors">Cancel</button>
            <button type="submit" className="bg-brand hover:opacity-90 text-on-surface font-semibold py-2 px-4 rounded-2xl transition-all shadow-soft">{currentCourse ? 'Save Changes' : 'Add Course'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Confirm Deletion">
        <div>
            <p className="text-on-surface dark:text-on-surface-dark mb-4">Are you sure you want to delete the course <span className="font-bold">{courseToDelete?.name}</span>?</p>
            <p className="text-sm text-danger dark:text-red-400">This will also delete all associated attendance records. This action is permanent and cannot be undone.</p>
        </div>
        <div className="flex items-center justify-end mt-6 space-x-3">
            <button type="button" onClick={closeDeleteModal} className="bg-white/5 hover:bg-white/10 text-on-surface-dark font-semibold py-2 px-4 rounded-2xl transition-colors">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} className="bg-danger hover:opacity-90 text-white font-semibold py-2 px-4 rounded-2xl transition-colors shadow-soft">Delete Course</button>
        </div>
      </Modal>

      <Modal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        title="Import Courses from CSV"
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
            Select a CSV file to import courses. The file must have a header row with the following columns. The branch for all imported courses must match your assigned branch (<span className="font-bold">{teacherBranch}</span>).
          </p>
          <ul className="list-disc list-inside mb-4 bg-black/10 p-3 rounded-3xl text-on-surface-variant dark:text-on-surface-dark-variant space-y-1">
            <li><code className="font-mono bg-white/5 py-0.5 px-1 rounded-md text-sm">name</code> - The course's full name.</li>
            <li><code className="font-mono bg-white/5 py-0.5 px-1 rounded-md text-sm">branch</code> - The course's branch (must be {teacherBranch}).</li>
          </ul>
          <div className="bg-black/10 p-3 rounded-3xl text-sm text-on-surface-variant dark:text-on-surface-dark-variant">
            <p className="font-bold mb-1">Example:</p>
            <pre className="font-mono text-xs">
              name,branch<br/>
              Introduction to AI,{teacherBranch}<br/>
              Advanced Algorithms,{teacherBranch}
            </pre>
          </div>
        </div>
      </Modal>

      <ImportSummaryModal
        isOpen={isImportSummaryModalOpen}
        onClose={() => setIsImportSummaryModalOpen(false)}
        result={importResult}
        itemType="courses"
      />
    </div>
  );
};

export default CourseManager;