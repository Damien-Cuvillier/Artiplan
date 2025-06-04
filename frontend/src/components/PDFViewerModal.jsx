// src/components/PDFViewerModal.jsx
import { memo } from 'react';
import { X } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';

const PDFViewerModal = memo(({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Modal */}
        <div className="relative z-10 w-full max-w-5xl rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">Aperçu du PDF</h3>
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* PDF Viewer */}
          <div className="h-[80vh] w-full">
            <PDFViewer width="100%" height="100%">
              {children}
            </PDFViewer>
          </div>
          
          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-3">
            <button
              type="button"
              className="rounded-md bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

PDFViewerModal.displayName = 'PDFViewerModal';
export default PDFViewerModal;