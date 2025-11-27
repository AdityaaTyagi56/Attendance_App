import React from 'react';
import { XIcon } from './icons';

interface PhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string | null;
  studentName: string | null;
  studentId?: string | null;
}

const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({ isOpen, onClose, photoUrl, studentName, studentId }) => {
  if (!isOpen || !photoUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative bg-surface-dark/20 backdrop-blur-xl rounded-4xl shadow-glass w-full max-w-lg animate-subtle-scale-in border border-white/10 p-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative">
          <img src={photoUrl} alt={studentName || 'Student Photo'} className="w-full h-auto max-h-[80vh] object-contain rounded-3xl" />
          {studentName && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-3xl">
              <h3 className="text-xl font-bold text-white tracking-tight">{studentName}</h3>
              {studentId && <p className="text-sm font-mono text-slate-200">{studentId}</p>}
            </div>
          )}
        </div>
        <button 
            onClick={onClose} 
            className="absolute -top-3 -right-3 text-white bg-black/50 hover:bg-black/70 transition-colors p-2 rounded-full shadow-lg"
            aria-label="Close photo viewer"
        >
            <XIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default PhotoViewerModal;