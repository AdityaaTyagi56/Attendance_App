import React from 'react';
import Modal from './Modal';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from './icons';

interface ImportResult {
  successCount: number;
  errors: {
    lineNumber: number;
    name: string;
    studentId?: string;
    reason: string;
  }[];
}

interface ImportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ImportResult | null;
  itemType: 'students' | 'courses';
}

const ImportSummaryModal: React.FC<ImportSummaryModalProps> = ({ isOpen, onClose, result, itemType }) => {
  if (!isOpen || !result) return null;

  const allSuccess = result.errors.length === 0 && result.successCount > 0;
  
  const title = allSuccess ? 'Import Successful' : 'Import Complete';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 text-center">
            {/* Success Count */}
            <div className="flex-1 bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-green-700 dark:text-green-300 p-4 rounded-3xl flex flex-col items-center justify-center">
                <CheckCircleIcon className="w-8 h-8 mb-2" />
                <span className="text-4xl font-extrabold">{result.successCount}</span>
                <span className="font-semibold text-sm">Successfully Imported</span>
            </div>
            {/* Error Count */}
            <div className="flex-1 bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-700 dark:text-red-300 p-4 rounded-3xl flex flex-col items-center justify-center">
                <XCircleIcon className="w-8 h-8 mb-2" />
                <span className="text-4xl font-extrabold">{result.errors.length}</span>
                <span className="font-semibold text-sm">Rows Failed</span>
            </div>
        </div>

        {allSuccess && (
            <div className="text-center text-on-surface-variant dark:text-on-surface-dark-variant">
                <p>All {result.successCount} {itemType} have been added to the system.</p>
            </div>
        )}

        {result.errors.length > 0 && (
          <div>
            <h4 className="font-bold text-lg text-on-surface dark:text-on-surface-dark mb-3 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-warning"/>
                Import Errors
            </h4>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
              {result.errors.map((error, index) => (
                <div key={index} className="bg-black/10 p-3 rounded-2xl border border-white/10">
                  <div className="flex justify-between items-start text-sm">
                    <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold text-on-surface dark:text-on-surface-dark truncate">{error.name || <i className="text-on-surface-variant">No Name</i>}</p>
                        {itemType === 'students' && error.studentId && <p className="text-xs text-on-surface-variant dark:text-on-surface-dark-variant font-mono">{error.studentId}</p>}
                    </div>
                    <span className="flex-shrink-0 font-mono text-xs bg-white/5 text-on-surface-variant dark:text-on-surface-dark-variant px-1.5 py-0.5 rounded-md">
                      Line {error.lineNumber}
                    </span>
                  </div>
                  <p className="text-danger dark:text-red-400 text-xs mt-1.5">{error.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="bg-brand hover:opacity-90 text-on-surface font-semibold py-2 px-6 rounded-2xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportSummaryModal;