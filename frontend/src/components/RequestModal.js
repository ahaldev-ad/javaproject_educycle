import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const RequestModal = ({ show, onClose, item, type, onSubmit }) => {
  const [message, setMessage] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const modalContentRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    if (show) {
      if (backdropRef.current) {
        gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      }
      if (modalContentRef.current) {
        gsap.fromTo(
          modalContentRef.current,
          { scale: 0.9, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.5)' }
        );
      }
    }
  }, [show]);

  if (!show || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        itemId: item.id || item.resourceId || item.skillId,
        message,
        scheduledDate: type === 'skill' ? scheduledDate : undefined,
      });
      setMessage('');
      setScheduledDate('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={backdropRef}
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(3, 27, 56, 0.55)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div ref={modalContentRef} className="modal-content glass-card overflow-hidden p-0 border-0">
          <div className="modal-header text-white p-4" style={{ background: 'var(--primary-gradient)' }}>
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className={`bi ${type === 'resource' ? 'bi-box-seam-fill' : 'bi-mortarboard-fill'} fs-4`}></i>
              Request {type === 'resource' ? 'Academic Resource' : 'Skill Session'}
            </h5>
            <button type="button" className="btn-close btn-close-white shadow-none" onClick={onClose} aria-label="Close"></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="p-3 rounded-4 mb-4" style={{ background: 'var(--primary-light)', border: '1px solid rgba(5, 79, 163, 0.1)' }}>
                <h6 className="fw-bold text-dark mb-1">{item.title || item.skillName}</h6>
                <div className="small text-primary fw-semibold">
                  Owner/Tutor: {item.ownerName || item.tutorName || item.userName || 'Campus Peer'}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark">Note to Peer</label>
                <textarea
                  className="form-control"
                  rows="3"
                  required
                  placeholder="Introduce yourself and explain why you're requesting this item or session..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>

              {type === 'skill' && (
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark">Preferred Schedule / Date</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="modal-footer p-4 pt-0 border-0">
              <button type="button" className="btn btn-light px-4" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;
