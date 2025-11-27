import React from 'react';
import { Course, Student, Branch, View } from '../types';
import { ClipboardCheck, Users, BookOpen, FileBarChart } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeacherDashboardProps {
  students: Student[];
  courses: Course[];
  handleViewChange: (view: View) => void;
  teacherBranch: Branch;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ students, courses, handleViewChange, teacherBranch }) => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const StatCard: React.FC<{ icon: React.FC<any>, label: string, value: number | string, iconClass: string }> = ({ icon: Icon, label, value, iconClass }) => (
    <motion.div
      variants={itemVariants}
      className="glass-card p-6 rounded-3xl flex items-center space-x-4 shadow-lg border border-white/10"
    >
      <div className={`p-3 rounded-2xl ${iconClass} text-white shadow-lg`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="font-bold text-text text-4xl">{value}</p>
        <p className="text-sm text-text-secondary font-semibold">{label}</p>
      </div>
    </motion.div>
  );

  const DashboardButton: React.FC<{ onClick: () => void, icon: React.FC<any>, label: string, description: string }> = ({ onClick, icon: Icon, label, description }) => (
    <motion.button
      variants={itemVariants}
      onClick={onClick}
      className="group p-6 rounded-3xl glass-card border border-white/10 transition-all duration-300 text-left shadow-lg hover:shadow-xl hover:border-primary/50 active:scale-95 hover:-translate-y-1 w-full"
    >
      <Icon className={`w-8 h-8 text-primary mb-3 transition-transform duration-300 group-hover:scale-110 flex-shrink-0`} />
      <div>
        <p className="text-lg font-bold text-text">{label}</p>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
    </motion.button>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mb-8">
        <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold font-display text-text mb-1 tracking-tight">
          IIIT-Naya Raipur
        </motion.h1>
        <motion.p variants={itemVariants} className="text-lg text-text-secondary">Welcome, Professor 📚</motion.p>
      </div>

      <motion.div variants={itemVariants} className="glass-card p-4 sm:p-6 rounded-3xl mb-8 shadow-lg border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold font-display text-text">Start a Session</h3>
          <button
            onClick={() => handleViewChange(View.TAKE_ATTENDANCE)}
            className="text-sm font-semibold text-primary hover:underline">
            View All
          </button>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:flex md:overflow-x-auto md:pb-4 md:-mb-4 md:-mx-6 md:px-6 md:horizontal-scrollbar">
            {courses.map(course => (
              <div key={course.id} className="w-full md:w-64 md:flex-shrink-0 bg-surface-variant/50 dark:bg-black/20 rounded-2xl border border-white/10 p-4 flex flex-col justify-between transition-all hover:border-primary/40 hover:-translate-y-1 duration-300">
                <div>
                  <h4 className="font-bold text-text truncate">{course.name}</h4>
                  <p className="text-xs text-text-secondary font-mono mb-3">{course.code}</p>
                  <div className="flex items-center text-sm text-text-secondary">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{course.studentIds.length} students</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sessionStorage.setItem('preselectedCourseId', course.id);
                    handleViewChange(View.TAKE_ATTENDANCE);
                  }}
                  className="w-full mt-4 bg-primary hover:bg-primary-light text-white font-semibold py-2 px-4 rounded-xl transition-all shadow-md active:scale-95 text-sm flex items-center justify-center">
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  Take Attendance
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-text-secondary">No courses created yet.</p>
            <button onClick={() => handleViewChange(View.COURSES)} className="mt-2 text-sm font-semibold text-primary hover:underline">Create a course to get started</button>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <StatCard label="Total Students in Branch" value={students.length} iconClass="bg-primary" icon={Users} />
        <StatCard label="Total Courses in Branch" value={courses.length} iconClass="bg-secondary" icon={BookOpen} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardButton onClick={() => handleViewChange(View.STUDENTS)} icon={Users} label="Manage Students" description="Add, edit, or remove student profiles." />
        <DashboardButton onClick={() => handleViewChange(View.COURSES)} icon={BookOpen} label="Manage Courses" description="Create courses and enroll students." />
        <DashboardButton onClick={() => handleViewChange(View.REPORTS)} icon={FileBarChart} label="View Reports" description="Generate AI-powered attendance summaries." />
      </div>
    </motion.div>
  );
};

export default TeacherDashboard;