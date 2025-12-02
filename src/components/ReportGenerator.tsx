import React, { useState, useEffect } from 'react';
import { Course, Student, AttendanceRecord, AttendanceReportData } from '../types';
import { generateAttendanceSummary } from '../services/geminiService';
import DonutChart from './DonutChart';
import SkeletonLoader from './SkeletonLoader';
import { ExclamationTriangleIcon, InformationCircleIcon } from './icons';

interface ReportGeneratorProps {
  courses: Course[];
  students: Student[];
  attendanceRecords: AttendanceRecord[];
}

const ReportSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
    {/* Main stats and insight */}
    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
      <SkeletonLoader className="h-28 rounded-4xl" />
      <SkeletonLoader className="h-28 rounded-4xl" />
    </div>
    
    {/* At-risk students */}
    <div className="lg:col-span-2 space-y-4 p-6 bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl rounded-4xl border border-white/10">
      <SkeletonLoader className="h-6 w-1/3 mb-4 rounded-lg" />
      <SkeletonLoader className="h-10 w-full rounded-2xl" />
      <SkeletonLoader className="h-10 w-full rounded-2xl" />
      <SkeletonLoader className="h-10 w-full rounded-2xl" />
    </div>

    {/* Distribution */}
    <div className="space-y-4 p-6 bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl rounded-4xl border border-white/10">
      <SkeletonLoader className="h-6 w-1/2 mb-4 rounded-lg" />
      <SkeletonLoader className="h-40 w-full rounded-2xl" />
    </div>

    {/* Trends and Remark */}
    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4 p-6 bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl rounded-4xl border border-white/10">
        <SkeletonLoader className="h-6 w-1/3 mb-4 rounded-lg" />
        <SkeletonLoader className="h-5 w-full rounded-lg" />
        <SkeletonLoader className="h-5 w-4/5 rounded-lg" />
      </div>
      <div className="space-y-4 p-6 bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl rounded-4xl border border-white/10">
        <SkeletonLoader className="h-6 w-1/3 mb-4 rounded-lg" />
        <SkeletonLoader className="h-5 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

const ReportDisplay: React.FC<{ data: AttendanceReportData }> = ({ data }) => {
  const distributionData = [
    { label: 'Perfect (100%)', value: data.attendanceDistribution.perfect, color: '#10b981' },
    { label: 'Good (75-99%)', value: data.attendanceDistribution.good, color: '#3b82f6' },
    { label: 'At Risk (50-74%)', value: data.attendanceDistribution.atRisk, color: '#f59e0b' },
    { label: 'Critical (<50%)', value: data.attendanceDistribution.critical, color: '#ef4444' },
  ];
  
  const overallColor = data.overallAttendancePercentage >= 75 ? 'text-success' : data.overallAttendancePercentage >= 50 ? 'text-warning' : 'text-danger';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Overall Percentage */}
        <div className="bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl p-6 rounded-4xl shadow-glass border border-white/10">
            <h4 className="font-bold font-serif text-on-surface dark:text-on-surface-dark mb-2">Overall Attendance</h4>
            <p className={`text-6xl font-extrabold ${overallColor}`}>{data.overallAttendancePercentage.toFixed(1)}<span className="text-3xl">%</span></p>
        </div>

        {/* Actionable Insight */}
        <div className="bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl p-6 rounded-4xl shadow-glass border border-white/10 lg:col-span-2">
            <h4 className="font-bold font-serif text-on-surface dark:text-on-surface-dark mb-2 flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2 text-brand" />
              Actionable Insight
            </h4>
            <p className="text-on-surface-variant dark:text-on-surface-dark-variant italic">"{data.actionableInsight}"</p>
        </div>

        {/* At-Risk Students */}
        <div className="lg:col-span-2 bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl p-6 rounded-4xl shadow-glass border border-white/10">
            <h4 className="font-bold font-serif text-on-surface dark:text-on-surface-dark mb-4">At-Risk Students (&lt;75%)</h4>
            {data.atRiskStudents.length > 0 ? (
                <ul className="space-y-3 max-h-72 overflow-y-auto">
                    {data.atRiskStudents.map(student => (
                        <li key={student.studentId} className="flex justify-between items-center p-3 bg-black/10 rounded-2xl">
                            <div>
                                <p className="font-semibold text-on-surface dark:text-on-surface-dark">{student.name}</p>
                                <p className="text-xs font-mono text-on-surface-variant dark:text-on-surface-dark-variant">{student.studentId}</p>
                            </div>
                            <span className="font-bold text-lg text-warning">{student.attendancePercentage.toFixed(1)}%</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-on-surface-variant dark:text-on-surface-dark-variant text-center py-4">No students are currently at risk. Great job!</p>
            )}
        </div>

        {/* Attendance Distribution */}
        <div className="bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl p-6 rounded-4xl shadow-glass border border-white/10">
            <h4 className="font-bold font-serif text-on-surface dark:text-on-surface-dark mb-4">Attendance Distribution</h4>
            <DonutChart data={distributionData} />
        </div>

        {/* Notable Trends */}
        <div className="lg:col-span-3 bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl p-6 rounded-4xl shadow-glass border border-white/10">
            <h4 className="font-bold font-serif text-on-surface dark:text-on-surface-dark mb-3">Notable Trends</h4>
            <ul className="list-disc list-inside space-y-2 text-on-surface-variant dark:text-on-surface-dark-variant">
                {data.notableTrends.map((trend, index) => <li key={index}>{trend}</li>)}
            </ul>
        </div>
        
        {/* Concluding Remark */}
        <div className="lg:col-span-3 bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl p-6 rounded-4xl shadow-glass border border-white/10">
            <h4 className="font-bold font-serif text-on-surface dark:text-on-surface-dark mb-2">Concluding Remark</h4>
            <p className="text-on-surface-variant dark:text-on-surface-dark-variant">{data.concludingRemark}</p>
        </div>
    </div>
  );
}


const ReportGenerator: React.FC<ReportGeneratorProps> = ({ courses, students, attendanceRecords }) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [reportData, setReportData] = useState<AttendanceReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Automatically generate a report if a course is selected
    if (selectedCourseId) {
      handleGenerateReport();
    } else {
      // Clear data if no course is selected
      setReportData(null);
      setError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  const handleGenerateReport = async () => {
    if (!selectedCourseId) return;

    const selectedCourse = courses.find(c => c.id === selectedCourseId);
    if (!selectedCourse) {
      setError("Selected course not found.");
      return;
    }
    
    // Check if there are any records for this course
    const courseRecords = attendanceRecords.filter(r => r.courseId === selectedCourseId);
    if (courseRecords.length === 0) {
        setError("No attendance records found for this course. Please take attendance first.");
        setReportData(null);
        return;
    }

    setIsLoading(true);
    setError(null);
    setReportData(null);

    try {
      const data = await generateAttendanceSummary(selectedCourse, students, attendanceRecords);
      setReportData(data);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred while generating the report.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-4xl font-bold font-serif text-on-surface dark:text-on-surface-dark mb-10 animate-slide-up-fade" style={{animationDelay: '100ms'}}>Attendance Reports</h2>
      
      <div className="mb-8 p-6 bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl rounded-4xl border border-white/10 shadow-glass">
        <label htmlFor="course-select-report" className="block text-sm font-medium text-on-surface-variant dark:text-on-surface-dark-variant mb-2">Select a Course to Generate an AI-Powered Report</label>
        <div className="flex flex-col sm:flex-row gap-4">
          <select 
            id="course-select-report" 
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}
            className="flex-grow appearance-none border border-border-light dark:border-border-dark rounded-2xl w-full py-3 px-4 text-on-surface dark:text-on-surface-dark bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
          >
            <option value="">-- Select a Course --</option>
            {courses.map(course => <option key={course.id} value={course.id}>{course.name} ({course.code})</option>)}
          </select>
          <button 
            onClick={handleGenerateReport} 
            disabled={!selectedCourseId || isLoading}
            className="bg-brand hover:opacity-90 text-on-surface font-semibold py-3 px-6 rounded-2xl transition-all shadow-soft active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
            {isLoading ? 'Generating...' : 'Regenerate Report'}
          </button>
        </div>
      </div>

      <div className="mt-6">
        {!selectedCourseId && (
            <div className="text-center py-16 bg-surface/80 dark:bg-surface-dark/70 backdrop-blur-xl rounded-4xl border border-white/10">
                <p className="text-lg text-on-surface-variant dark:text-on-surface-dark-variant">Please select a course to view its attendance report.</p>
            </div>
        )}

        {isLoading && <ReportSkeleton />}
        
        {error && !isLoading && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 p-6 rounded-4xl flex items-start">
                <ExclamationTriangleIcon className="w-6 h-6 mr-3 flex-shrink-0" />
                <div>
                    <h4 className="font-bold mb-1">Error Generating Report</h4>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        )}

        {reportData && !isLoading && <ReportDisplay data={reportData} />}
      </div>
    </div>
  );
};

export default ReportGenerator;