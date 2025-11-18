import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="modal-panel w-full max-w-4xl p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-sm text-neutral-600 rounded-md px-2 py-1 hover:bg-neutral-100">
            Tutup
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
