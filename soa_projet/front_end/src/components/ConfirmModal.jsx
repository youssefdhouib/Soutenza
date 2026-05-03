import React from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirmer", confirmVariant = "danger" }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        <h3>{title}</h3>
        <p style={{ margin: '1rem 0', color: '#4b5563' }}>{message}</p>
        <div className="actions" style={{ justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button className="secondary" type="button" onClick={onCancel}>Annuler</button>
          <button className={confirmVariant} type="button" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
