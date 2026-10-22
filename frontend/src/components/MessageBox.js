import React, { useState } from 'react';

const MessageBox = ({ activeMatch, messages, onSendMessage, onBack }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  if (!activeMatch) {
    return (
      <div className="glass-card h-100 d-flex align-items-center justify-content-center text-center p-5">
        <div>
          <div 
            className="d-inline-flex align-items-center justify-content-center text-primary rounded-circle mb-3"
            style={{ width: '64px', height: '64px', background: 'var(--primary-light)' }}
          >
            <i className="bi bi-chat-square-dots-fill fs-2"></i>
          </div>
          <h5 className="text-dark fw-bold mb-2">Select a Match to start messaging</h5>
          <p className="text-muted small mb-0">Messages are enabled once a request is accepted by both parties.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card h-100 d-flex flex-column overflow-hidden border-0">
      <div className="p-3 p-md-4 bg-white bg-opacity-60 border-bottom border-subtle d-flex align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2.5 overflow-hidden">
          {onBack && (
            <button className="btn btn-sm btn-light border-0 d-md-none me-1 flex-shrink-0" onClick={onBack} aria-label="Back to contacts">
              <i className="bi bi-chevron-left fs-5"></i>
            </button>
          )}
          <div 
            className="avatar-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
            style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-gradient)' }}
          >
            {activeMatch.peerName ? activeMatch.peerName.charAt(0).toUpperCase() : 'P'}
          </div>
          <div className="overflow-hidden">
            <h6 className="fw-extrabold text-dark mb-0 text-truncate">{activeMatch.peerName || 'Campus Peer'}</h6>
            <small className="text-muted text-truncate d-block">{activeMatch.title || activeMatch.skillName}</small>
          </div>
        </div>

        {activeMatch.contactRevealed && (
          <div className="badge-pill-accent chat-contact-pill flex-shrink-0" title={`Contact: ${activeMatch.peerPhone || activeMatch.peerEmail}`}>
            <i className="bi bi-telephone-fill me-1"></i>
            <span className="d-none d-sm-inline">Contact: </span>{activeMatch.peerPhone || activeMatch.peerEmail}
          </div>
        )}
      </div>

      <div className="card-body overflow-auto flex-grow-1 p-4" style={{ background: 'rgba(248, 250, 252, 0.5)' }}>
        {messages && messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`d-flex flex-column mb-3 ${msg.isMine ? 'align-items-end' : 'align-items-start'}`}
            >
              <div
                className={`p-3 rounded-4 shadow-sm ${
                  msg.isMine ? 'text-white' : 'bg-white text-dark border border-subtle'
                }`}
                style={{
                  maxWidth: '75%',
                  background: msg.isMine ? 'var(--primary-gradient)' : '#ffffff',
                }}
              >
                <p className="mb-1 text-break small">{msg.messageText || msg.text}</p>
                <small className={`d-block text-end ${msg.isMine ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.7rem' }}>
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </small>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted my-5">
            <i className="bi bi-chat-dots fs-2 text-primary opacity-50 d-block mb-2"></i>
            No messages yet. Send a greeting to kick off your interaction!
          </div>
        )}
      </div>

      <div className="p-3 bg-white border-top border-subtle">
        <form onSubmit={handleSubmit} className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm d-flex align-items-center justify-content-center">
            <i className="bi bi-send-fill"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageBox;
