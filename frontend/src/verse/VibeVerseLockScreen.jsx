import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function VibeVerseLockScreen() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'radial-gradient(circle at 50% 30%, #041430 0%, #020b1a 70%, #000511 100%)',
      color: '#fff',
      fontFamily: 'var(--vv-pixel)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px 16px',
      boxSizing: 'border-box',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      textTransform: 'uppercase'
    }}>
      {/* Inline animation keyframes */}
      <style>{`
        @keyframes vvPulseDotAnimation {
          0% { transform: scale(0.9); opacity: 0.7; box-shadow: 0 0 4px #00ff88; }
          50% { transform: scale(1.35); opacity: 1; box-shadow: 0 0 12px #00ff88, 0 0 20px #00ff88; }
          100% { transform: scale(0.9); opacity: 0.7; box-shadow: 0 0 4px #00ff88; }
        }
        .vv-lock-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00ff88;
          display: inline-block;
          animation: vvPulseDotAnimation 1.6s infinite ease-in-out;
        }

        @media (max-width: 768px) {
          .vv-lock-title {
            font-size: 16px !important;
            line-height: 1.4 !important;
          }
          .vv-lock-badge {
            font-size: 8px !important;
            padding: 6px 12px !important;
          }
          .vv-lock-btn {
            width: 100% !important;
            max-width: 320px !important;
            font-size: 11px !important;
            padding: 16px 20px !important;
          }
          .vv-lock-logo {
            width: 80px !important;
            height: 80px !important;
          }
        }
      `}</style>

      {/* Background Map Glow Effect */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(0, 245, 255, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
        pointerEvents: 'none'
      }} />

      {/* Mascot Logo */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <img
          src="/vibe-logo.png"
          alt="VIBE"
          className="vv-lock-logo"
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '24px',
            border: '3px solid #00f5ff',
            boxShadow: '0 0 32px rgba(0, 245, 255, 0.5)'
          }}
        />
      </div>

      {/* Main Title */}
      <h1 className="vv-lock-title" style={{
        fontFamily: 'var(--vv-pixel)',
        fontSize: '22px',
        color: '#00f5ff',
        textShadow: '0 0 20px rgba(0, 245, 255, 0.6)',
        marginBottom: '14px',
        maxWidth: '750px',
        lineHeight: 1.4,
        letterSpacing: '0.5px'
      }}>
        VIBEVERSE IS COOKING
      </h1>

      {/* Green Pulsing Badge Below Title */}
      <div className="vv-lock-badge" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(0, 255, 136, 0.12)',
        border: '1.5px solid #00ff88',
        color: '#00ff88',
        borderRadius: '20px',
        padding: '8px 18px',
        fontSize: '9.5px',
        fontFamily: 'var(--vv-pixel)',
        letterSpacing: '0.6px',
        marginBottom: '36px',
        boxShadow: '0 0 18px rgba(0, 255, 136, 0.25)',
        whiteSpace: 'nowrap'
      }}>
        <span className="vv-lock-pulse-dot" />
        <span>GENESIS PHASE IS LIVE</span>
      </div>

      {/* Primary Action Button -> Go to NFT Mint Page */}
      <button
        onClick={() => navigate('/vibeclub')}
        className="vv-lock-btn"
        style={{
          fontFamily: 'var(--vv-pixel)',
          fontSize: '12px',
          background: 'linear-gradient(135deg, #ff007f 0%, #b44dff 100%)',
          border: '2px solid #ffffff',
          color: '#ffffff',
          padding: '18px 36px',
          borderRadius: '14px',
          cursor: 'pointer',
          boxShadow: '0 0 28px rgba(255, 0, 127, 0.6)',
          fontWeight: 900,
          letterSpacing: '0.8px',
          transition: 'all 0.2s ease',
          textTransform: 'uppercase',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}
      >
        <span>MINT VIBE CLUB NFT</span>
        <span style={{ fontSize: '14px' }}>→</span>
      </button>
    </div>
  );
}
