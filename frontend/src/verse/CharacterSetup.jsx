import React, { useState } from 'react';

export default function CharacterSetup({ onComplete }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const isValid = name.trim().length >= 3;

  const handleSubmit = () => {
    if (!isValid) {
      setError('Name must be at least 3 characters');
      return;
    }
    const clean = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (clean.length < 3) {
      setError('Use letters, numbers or underscores only (min 3)');
      return;
    }
    onComplete({ name: clean });
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="vv-modal-backdrop">
      <div className="vv-modal-card vv-modal-setup">
        {/* Header Bar */}
        <div className="vv-setup-header">
          <div className="vv-setup-avatar-wrap">
            <img
              className="vv-setup-avatar"
              src="/vibe-dog.jpg"
              alt="Base Dog Avatar"
            />
            <span className="vv-setup-status-dot"></span>
          </div>
          <div className="vv-setup-title-wrap">
            <span className="vv-setup-badge">NEW ADVENTURER</span>
            <h2 className="vv-setup-title">CREATE CHARACTER</h2>
          </div>
        </div>

        {/* Input Body */}
        <div className="vv-setup-body">
          <div className="vv-setup-field">
            <label className="vv-setup-label">YOUR VIBE NAME</label>
            <div className="vv-setup-input-group">
              <input
                className="vv-setup-input"
                type="text"
                placeholder="yournickname"
                value={name}
                maxLength={20}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKey}
                autoFocus
              />
              <div className="vv-setup-suffix">.vibe</div>
            </div>
            {error && (
              <div className="vv-setup-error">
                ⚠️ {error}
              </div>
            )}
            {name.trim().length >= 3 && !error && (
              <div className="vv-setup-preview">
                Your identity: <strong>{name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')}.vibe</strong>
              </div>
            )}
          </div>

          <button
            className="vv-setup-submit-btn"
            onClick={handleSubmit}
            disabled={name.trim().length < 3}
          >
            ENTER VIBE VERSE
          </button>
        </div>
      </div>
    </div>
  );
}
