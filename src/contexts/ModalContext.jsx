import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const ModalContext = createContext(null);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used inside ModalProvider');
  return ctx;
}

export function ModalProvider({ children }) {
  const [modalContent, setModalContent] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback((content) => {
    setModalContent(content);
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalContent(null);
    document.body.style.overflow = '';
  }, []);

  return (
    <ModalContext.Provider value={{ openModal, closeModal, isOpen }}>
      {children}
      {/* Global Modal Container - renders at document.body level with highest z-index */}
      {isOpen &&
        modalContent &&
        createPortal(
          <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={closeModal} aria-hidden="true" />
            {/* Modal Content */}
            <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
              <div className="pointer-events-auto max-h-[90vh] overflow-y-auto">{modalContent}</div>
            </div>
          </div>,
          document.body,
        )}
    </ModalContext.Provider>
  );
}
