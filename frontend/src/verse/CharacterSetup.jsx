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
      <div className="vv-modal">
        <div className="vv-modal__header">
          <img
            className="vv-modal__icon"
            src="/vibe-dog.jpg"
            alt="Base Dog"
          />
          <div className="vv-modal__title">Create Your Character</div>
          <div className="vv-modal__subtitle">
            Choose your Vibe name. Every adventurer in Vibe Verse has a
            unique identity in the world.
          </div>
        </div>

        <div className="vv-modal__field">
          <div className="vv-modal__field-label">Your Vibe Name</div>
          <div className="vv-name-input-wrap">
            <input
              className="vv-name-input"
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
            <div className="vv-name-suffix">.vibe</div>
          </div>
          {error && (
            <div style={{ marginTop: 6, fontSize: 11, color: '#ff4466' }}>
              {error}
            </div>
          )}
          {name.trim().length >= 3 && !error && (
            <div style={{ marginTop: 6, fontSize: 11, color: '#00ff88' }}>
              Your identity will be{' '}
              <strong>
                {name
                  .trim()
                  .toLowerCase()
                  .replace(/[^a-z0-9_]/g, '')}.vibe
              </strong>
            </div>
          )}
        </div>

        <div
          style={{
            background: 'rgba(0,245,255,0.04)',
            border: '1px solid rgba(0,245,255,0.12)',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            WHAT COMES NEXT
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            Explore the map, visit zones, earn XP, stake $VIBE in Vibe Bank,
            compete in the Arena and climb the Leaderboard.
          </div>
        </div>

        <button
          className="vv-modal__enter-btn"
          onClick={handleSubmit}
          disabled={name.trim().length < 3}
        >
          Enter Vibe Verse
        </button>
      </div>
    </div>
  );
}
