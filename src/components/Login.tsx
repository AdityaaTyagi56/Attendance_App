import React, { useState } from 'react';
import { User, Student, Teacher } from '../types';
import { Eye, EyeOff, User as UserIcon, GraduationCap, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { getApiUrl, setApiUrl, resetApiUrl } from '../utils/config';

interface LoginProps {
  onLogin: (user: User) => void;
  students: Student[];
  teachers: Teacher[];
}

const Login: React.FC<LoginProps> = ({ onLogin, students, teachers }) => {
  const [userType, setUserType] = useState<'teacher' | 'student'>('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (userType === 'teacher') {
      const teacher = teachers.find(
        t => t.email.toLowerCase() === email.toLowerCase() && t.password === password
      );
      if (teacher) {
        onLogin({ type: 'teacher', email: teacher.email, branch: teacher.branch });
      } else {
        setError('Invalid teacher email or password.');
      }
    } else {
      const student = students.find(
        s => s.email.toLowerCase() === email.toLowerCase() && s.password === password
      );
      if (student) {
        onLogin({ type: 'student', email: student.email });
      } else {
        setError('Invalid student email or password.');
      }
    }
  };

  const [showSettings, setShowSettings] = useState(false);
  const [apiUrl, setApiUrlState] = useState(getApiUrl());

  const handleSaveSettings = () => {
    setApiUrl(apiUrl);
    setShowSettings(false);
  };

  const handleResetSettings = () => {
    resetApiUrl();
    setApiUrlState(getApiUrl());
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Settings Button */}
      <button 
        onClick={() => setShowSettings(true)}
        className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors z-50"
        title="Server Settings"
      >
        <Settings className="w-6 h-6 text-gray-600" />
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Server Configuration</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Backend API URL</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrlState(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="https://your-app.ngrok-free.dev"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {getApiUrl()} (We'll add /api automatically)
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleResetSettings}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Reset to Default
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Save & Reload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Elements - Static gradients instead of heavy animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-5xl mx-auto grid md:grid-cols-2 rounded-[2.5rem] overflow-hidden glass-card shadow-2xl relative z-10"
      >
        {/* Left Panel - Branding */}
        <div className="hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-primary/10 to-secondary/10 text-center relative">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 mb-8"
          >
            <img src="/icon.svg" alt="App Logo" className="w-20 h-20" />
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold font-display text-text tracking-tight mb-2"
          >
            IIIT-Naya Raipur
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-text-secondary text-lg"
          >
            Attendance Portal
          </motion.p>
        </div>

        {/* Right Panel - Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-surface/50 dark:bg-surface-dark/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold font-display text-text mb-2">Welcome Back</h1>
            <p className="text-text-secondary mb-8">Sign in to your account</p>
          </motion.div>

          <form onSubmit={handleLogin} noValidate>
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex w-full surface-variant-50 rounded-2xl p-1.5">
                  <button
                    type="button"
                    onClick={() => setUserType('teacher')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${userType === 'teacher' ? 'bg-white dark:bg-surface-dark shadow-md text-primary' : 'text-text-secondary hover:text-text'}`}
                  >
                    <UserIcon className="w-4 h-4" /> Teacher
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('student')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${userType === 'student' ? 'bg-white dark:bg-surface-dark shadow-md text-primary' : 'text-text-secondary hover:text-text'}`}
                  >
                    <GraduationCap className="w-4 h-4" /> Student
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="email" className="block text-text-secondary text-sm font-bold mb-2 ml-1">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-4 rounded-2xl surface-variant-50 border border-transparent focus:border-primary/50 focus:bg-surface dark:focus:bg-black/40 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-text placeholder:text-text-secondary/50"
                  placeholder="Enter your email"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative"
              >
                <label htmlFor="password" className="block text-text-secondary text-sm font-bold mb-2 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-2xl surface-variant-50 border border-transparent focus:border-primary/50 focus:bg-surface dark:focus:bg-black/40 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-text placeholder:text-text-secondary/50"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-text transition-colors"
                  >
                    {isPasswordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </motion.div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm text-center font-medium pt-4"
              >
                {error}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all duration-200"
              >
                Sign In
              </button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;