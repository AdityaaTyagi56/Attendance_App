import React from 'react';
import { XIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-surface/80 dark:bg-surface-dark/75 backdrop-blur-xl rounded-4xl shadow-glass w-full max-w-md animate-subtle-scale-in border border-black/10 dark:border-white/10 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-center p-5 border-b border-border-light dark:border-border-dark">
          <h3 className="text-xl font-bold font-serif text-on-surface dark:text-on-surface-dark tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-on-surface-variant dark:text-on-surface-dark-variant hover:text-on-surface dark:hover:text-on-surface-dark transition-colors p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-auto overflow-y-auto p-6">
          {children}
        </div>
        {footer && (
          <div className="flex-shrink-0 p-4 border-t border-border-light dark:border-border-dark">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;