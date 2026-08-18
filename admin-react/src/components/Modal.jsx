import { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  const backdropRef = useRef(null);

  // ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="r-modal-backdrop"
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className={`r-modal r-modal-${size}`} onClick={e => e.stopPropagation()}>
        <div className="r-modal-header">
          <div className="r-modal-title">{title}</div>
          <button className="r-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="r-modal-body">{children}</div>
        {footer && <div className="r-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
