import React from 'react';

export default function VibeNftCard({ nft, width = 220 }) {
  const paddedId = String(nft?.tokenId ?? 4).padStart(2, '0');
  const roleName = nft?.role || 'Footballer';
  const titleText = `#${paddedId} ${roleName} VIBE`;
  const emoji = nft?.emoji || '⚽';

  return (
    <div
      style={{
        width: `${width}px`,
        aspectRatio: '0.85',
        background: 'linear-gradient(180deg, #1042f3 0%, #031ca3 100%)',
        borderRadius: '14px',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      {/* Top Studio Portrait Area */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
      }}>
        {/* Maltipoo Dog Base */}
        <img
          src="/vibe-dog.jpg"
          alt={titleText}
          style={{
            width: '88%',
            height: '88%',
            objectFit: 'cover',
            borderRadius: '12px',
            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))',
          }}
        />

        {/* Role Accessory Badge Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(2, 11, 26, 0.85)',
            border: '1.5px solid #00f5ff',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            boxShadow: '0 4px 12px rgba(0,245,255,0.4)'
          }}
        >
          {emoji}
        </div>

        {/* Glossy Reflection Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '45%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Bottom Dark Label Bar */}
      <div
        style={{
          height: '42px',
          background: '#041562',
          borderTop: '1.5px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.2px' }}>
          {titleText}
        </span>
        <span style={{ fontSize: '11px', fontWeight: 900, color: '#00f5ff', letterSpacing: '0.5px' }}>
          $VIBE
        </span>
      </div>
    </div>
  );
}
