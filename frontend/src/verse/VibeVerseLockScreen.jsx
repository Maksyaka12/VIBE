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
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      boxSizing: 'border-box',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
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
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '24px',
            border: '3px solid #00f5ff',
            boxShadow: '0 0 32px rgba(0, 245, 255, 0.5)'
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: '-10px',
          right: '-10px',
          background: '#ffd700',
          color: '#000',
          fontWeight: 900,
          fontSize: '11px',
          padding: '4px 10px',
          borderRadius: '12px',
          fontFamily: 'var(--vv-pixel)'
        }}>
          PHASE 1
        </div>
      </div>

      {/* Main Title */}
      <h1 style={{
        fontFamily: 'var(--vv-pixel)',
        fontSize: '24px',
        color: '#00f5ff',
        textShadow: '0 0 20px rgba(0, 245, 255, 0.6)',
        marginBottom: '12px',
        maxWidth: '700px',
        lineHeight: 1.4
      }}>
        VIBEVERSE WEB3 WORLD
      </h1>

      <div style={{
        fontFamily: 'var(--vv-pixel)',
        fontSize: '12px',
        color: '#ffd700',
        marginBottom: '24px',
        letterSpacing: '1px'
      }}>
        🔒 ACCESS LOCKED — PHASE 1 MINT IN PROGRESS
      </div>

      <p style={{
        fontSize: '14px',
        color: '#a0b5d0',
        maxWidth: '550px',
        lineHeight: 1.6,
        marginBottom: '36px'
      }}>
        VibeVerse 2D virtual world is currently launching.
        Mint your <strong>Genesis 334 VIBE Club NFT</strong> first to qualify for the 100M $VIBE Vault & gain VIP Early Access!
      </p>

      {/* Primary Action Button -> Go to NFT Mint Page */}
      <button
        onClick={() => navigate('/nft-club')}
        style={{
          fontFamily: 'var(--vv-pixel)',
          fontSize: '13px',
          background: 'linear-gradient(135deg, #ff007f 0%, #b44dff 100%)',
          border: '2.5px solid #ffffff',
          color: '#ffffff',
          padding: '18px 36px',
          borderRadius: '14px',
          cursor: 'pointer',
          boxShadow: '0 0 28px rgba(255, 0, 127, 0.6)',
          fontWeight: 900,
          letterSpacing: '0.8px',
          transition: 'transform 0.2s ease',
          marginBottom: '20px'
        }}
      >
        GO TO VIBE CLUB NFT MINT 🚀
      </button>

      {/* Secret Dev Preview Button */}
      <button
        onClick={() => navigate('/verse?preview=true')}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.35)',
          fontSize: '10px',
          cursor: 'pointer',
          textDecoration: 'underline'
        }}
      >
        (Developer / Team Preview Access)
      </button>
    </div>
  );
}
