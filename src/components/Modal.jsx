import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ isOpen = true, onClose, title, children, size = 'default', zIndex = 'z-[10001]' }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    default: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]',
  };

  const modalContent = (
    <div className={`fixed inset-0 ${zIndex} flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in`}>
      {/* Full page dark overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Modal panel */}
      <div className="relative z-10 animate-scale-in w-full sm:w-auto">
        {title ? (
          <div className={`bg-white rounded-t-2xl sm:rounded-2xl shadow-soft-2xl w-full ${sizeClasses[size] || sizeClasses.default} max-h-[85vh] sm:max-h-[90vh] flex flex-col pb-safe`}>
            <div className="flex items-start justify-between gap-3 p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0 border-b border-neutral-100">
              <h3 className="text-title font-semibold text-neutral-900 flex-1 min-w-0">{title}</h3>
              <button onClick={onClose} className="p-2 -mr-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors flex-shrink-0" aria-label="Tutup">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 sm:p-6">{children}</div>
          </div>
        ) : (
          <div className="pb-safe">{children}</div>
        )}
      </div>
    </div>
  );

  // Render modal to body using portal for proper stacking context
  return ReactDOM.createPortal(modalContent, document.body);
}
