import React, { useState, useEffect } from 'react';
import { Course, Student, AttendanceRecord, View, User, Branch, Teacher } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import StudentManager from './components/StudentManager';
import CourseManager from './components/CourseManager';
import AttendanceTaker from './components/AttendanceTaker';
import ReportGenerator from './components/ReportGenerator';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import { Users, BookOpen, ClipboardCheck, BarChart2, LogOut, Sun, Moon, UserCircle, Menu, X } from 'lucide-react';
import Chatbot from './components/Chatbot';
import * as api from './services/apiService';
import { motion, AnimatePresence } from 'framer-motion';
import { discoverApiUrl, getApiUrl } from './utils/config';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [teachers, setTeachers] = useLocalStorage<Teacher[]>('teachers', [
    { id: 't1', name: 'DSAI Teacher', email: 'dsai-teacher@iiitnr.edu.in', password: 'pass123', branch: 'DSAI' },
  ]);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [user, setUser] = useLocalStorage<User | null>('user', null);
  const [theme, setTheme] = useLocalStorage<Theme>('theme',
    window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Initializing...');

  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Auto-discover the backend URL with status updates
      const apiUrl = await discoverApiUrl((status) => {
        setConnectionStatus(status);
      });
      
      // Now load data
      setConnectionStatus('✓ Connected! Loading data...');
      const [studentsData, coursesData, attendanceData] = await Promise.all([
        api.fetchStudents(),
        api.fetchCourses(),
        api.fetchAttendance()
      ]);
      setStudents(studentsData);
      setCourses(coursesData);
      setAttendance(attendanceData);
      setConnectionStatus('✓ Ready!');
      console.log('✓ Loaded data from MongoDB:', {
        students: studentsData.length,
        courses: coursesData.length,
        attendance: attendanceData.length
      });
    } catch (error) {
      console.error('Failed to load data from MongoDB:', error);
      setError('Failed to connect to backend. Please check if the server is running and accessible.');
    } finally {
      setIsLoading(false);
    }
  };

    // Load data from MongoDB on mount
  useEffect(() => {
    loadData();
  }, []);

  // Removed heavy sync effects to improve performance
  // Data is now synced directly when actions occur in the respective components

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          }, err => {
            console.log('ServiceWorker registration failed: ', err);
          });
      });
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');

    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      themeColorMeta?.setAttribute('content', '#000000');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      themeColorMeta?.setAttribute('content', '#F8FAFC');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const openMobileMenu = () => {
    setIsMobileMenuVisible(true);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuVisible(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(View.DASHBOARD);
    closeMobileMenu();
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    closeMobileMenu();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mb-8 transform-gpu"
          style={{ willChange: 'transform' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 24
          }}
          className="text-text-secondary text-sm font-mono bg-surface/50 p-4 rounded-xl backdrop-blur-sm border border-white/10 max-w-md w-full mx-4"
        >
          <p className="mb-2 font-bold text-primary">🔗 Connecting...</p>
          <motion.p
            key={connectionStatus}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="text-green-500"
          >{connectionStatus}</motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    const suggestedUrl = getApiUrl();
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-text">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-3xl text-center max-w-md border border-red-500/20"
        >
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Connection Error</h2>
          <p className="text-text-secondary mb-4">{error}</p>
          <div className="bg-surface/50 p-4 rounded-xl mb-6 text-left">
            <p className="text-xs text-text-secondary mb-2">📱 For Mobile Data access, set this URL in Settings:</p>
            <code className="text-xs text-primary break-all">{suggestedUrl.replace(/\/api$/, '')}</code>
            <p className="text-[10px] text-text-secondary mt-2 opacity-70">(We'll automatically add /api for you)</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={loadData}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              Retry Connection
            </button>
            <button
              onClick={() => setError(null)}
              className="bg-surface hover:bg-surface-dark text-text font-bold py-3 px-6 rounded-xl transition-all border border-white/10 active:scale-95"
            >
              Go to Login (Configure Settings)
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-background"
        >
          <Login onLogin={setUser} students={students} teachers={teachers} />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (user.type === 'student') {
    const student = students.find(s => s.email === user.email);
    if (!student) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
          <div className="glass-card p-8 rounded-3xl text-center border border-red-500/20">
            <p className="text-red-500 text-lg mb-4">Error: Student profile not found.</p>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-all">Logout</button>
          </div>
        </div>
      );
    }
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="student-dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-background"
        >
          <StudentDashboard student={student} courses={courses} attendanceRecords={attendance} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Logic for branch-specific teacher view
  const teacherUser = user as { type: 'teacher'; branch: Branch };
  const visibleStudents = students.filter(s => s.branch === teacherUser.branch);
  const visibleCourses = courses.filter(c => c.branch === teacherUser.branch);
  const visibleAttendance = attendance.filter(a => {
    const course = courses.find(c => c.id === a.courseId);
    return course?.branch === teacherUser.branch;
  });

  const renderView = () => {
    switch (currentView) {
      case View.STUDENTS:
        return <StudentManager students={students} setStudents={setStudents} courses={courses} setCourses={setCourses} attendanceRecords={attendance} setAttendance={setAttendance} teacherBranch={teacherUser.branch} />;
      case View.COURSES:
        return <CourseManager courses={courses} setCourses={setCourses} students={visibleStudents} teacherBranch={teacherUser.branch} attendanceRecords={attendance} setAttendance={setAttendance} />;
      case View.TAKE_ATTENDANCE:
        return <AttendanceTaker courses={visibleCourses} students={students} attendance={attendance} setAttendance={setAttendance} />;
      case View.REPORTS:
        return <ReportGenerator courses={visibleCourses} students={students} attendanceRecords={visibleAttendance} />;
      case View.DASHBOARD:
      default:
        return <TeacherDashboard students={visibleStudents} courses={visibleCourses} handleViewChange={handleViewChange} teacherBranch={teacherUser.branch} />;
    }
  };

  const navigationItems = [
    { view: View.DASHBOARD, label: 'Dashboard', icon: UserCircle },
    { view: View.STUDENTS, label: 'Students', icon: Users },
    { view: View.COURSES, label: 'Courses', icon: BookOpen },
    { view: View.TAKE_ATTENDANCE, label: 'Attendance', icon: ClipboardCheck },
    { view: View.REPORTS, label: 'Reports', icon: BarChart2 },
  ];

  const getHeaderTitle = () => {
    const navItem = navigationItems.find(item => item.view === currentView);
    if (!navItem) return 'Dashboard';
    if (navItem.view === View.DASHBOARD) return 'IIIT-Naya Raipur';
    return navItem.label;
  };

  const NavLinks = () => (
    <>
      {navigationItems.map(item => (
        <button key={item.view} onClick={() => handleViewChange(item.view)}
          className={`relative w-full text-left flex items-center p-3 rounded-2xl font-medium transition-all duration-200 ease-in-out text-sm group
        ${currentView === item.view
              ? 'bg-primary/10 text-primary'
              : 'text-text-secondary hover:bg-surface/50 hover:text-text'
            }`}>
          {currentView === item.view && (
            <motion.div
              layoutId="activeNav"
              className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
          <item.icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${currentView === item.view ? 'text-primary' : 'text-text-secondary group-hover:text-text'}`} />
          {item.label}
        </button>
      ))}
    </>
  );

  const ThemeToggle = () => (
    <button onClick={toggleTheme} className={`w-full text-left flex items-center p-3 rounded-2xl text-text-secondary hover:bg-surface/50 hover:text-text font-medium transition-colors text-sm`}>
      {theme === 'light' ?
        <><Moon className="w-5 h-5 mr-3" /> Dark Mode</> :
        <><Sun className="w-5 h-5 mr-3" /> Light Mode</>}
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-text transition-colors duration-300">
      <AnimatePresence>
        {isMobileMenuVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              onClick={closeMobileMenu}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 glass text-text flex flex-col z-50 border-r border-white/10"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center pt-[calc(1.5rem+env(safe-area-inset-top))]">
                <span className="text-lg font-bold font-display text-text flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                    <img src="/icon.svg" className="w-5 h-5" alt="Logo" />
                  </div>
                  IIIT-NR
                </span>
                <button onClick={closeMobileMenu} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6 text-text-secondary" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <NavLinks />
              </nav>
              <div className="p-4 border-t border-white/10 space-y-1 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <ThemeToggle />
                <button onClick={handleLogout} className="w-full text-left flex items-center p-3 rounded-2xl text-red-500 hover:bg-red-500/10 font-medium text-sm transition-colors">
                  <LogOut className="w-5 h-5 mr-3" /> Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen">
        <aside className="w-72 glass hidden md:flex flex-col border-r border-white/10 fixed inset-y-0 left-0 z-30">
          <div className="p-6 border-b border-white/10 h-20 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 mr-3">
              <img src="/icon.svg" className="w-6 h-6" alt="Logo" />
            </div>
            <span className="text-lg font-bold font-display tracking-tight">IIIT-NR</span>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            <NavLinks />
          </nav>
          <div className="p-4 border-t border-white/10 space-y-1">
            <ThemeToggle />
            <button onClick={handleLogout} className="w-full text-left flex items-center p-3 rounded-2xl text-red-500 hover:bg-red-500/10 font-medium transition-colors text-sm">
              <LogOut className="w-5 h-5 mr-3" /> Logout
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col md:pl-72 transition-all duration-300">
          <header className="glass md:hidden flex justify-between items-center sticky top-0 z-20 h-16 px-4 pt-[max(0.5rem,env(safe-area-inset-top))] border-b border-white/10">
            <button onClick={openMobileMenu} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
              <Menu className="w-6 h-6 text-text" />
            </button>
            <h1 className="text-lg font-bold font-display text-text">
              {getHeaderTitle()}
            </h1>
            <div className="w-10"></div>
          </header>

          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto pb-[max(2rem,env(safe-area-inset-bottom))]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="max-w-7xl mx-auto w-full"
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      <Chatbot />
    </div>
  );
};

export default App;