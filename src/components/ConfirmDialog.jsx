import React from 'react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({ isOpen, title, description, confirmText = 'Ya', cancelText = 'Tidak', tone = 'default', onConfirm, onCancel }) {
  const confirmClass = tone === 'danger' ? 'btn btn-secondary' : 'btn btn-primary';

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title || 'Konfirmasi'} size="sm">
      {description ? <p className="text-sm text-neutral-700">{description}</p> : null}

      <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
        <button type="button" className="btn btn-quiet w-full sm:w-auto" onClick={onCancel}>
          {cancelText}
        </button>
        <button type="button" className={`${confirmClass} w-full sm:w-auto`} onClick={onConfirm}>
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
