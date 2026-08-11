import React, { useState } from 'react';

export default function NftMintPanel({ player }) {
  const [minted, setMinted] = useState(false);
  const [minting, setMinting] = useState(false);

  const currentPrice = '0.005 ETH';
  const totalMinted = 4;
  const maxSupply = 334;

  const handleMint = () => {
    setMinting(true);
    setTimeout(() => {
      setMinting(false);
      setMinted(true);
    }, 1500);
  };

  // Phases 1 to 4 (Phase 0 Whitelist is hidden/internal)
  const phases = [
    { phase: 'Phase 1', count: '100 NFT', price: '0.005 ETH', active: true },
    { phase: 'Phase 2', count: '100 NFT', price: '0.015 ETH', active: false },
    { phase: 'Phase 3', count: '100 NFT', price: '0.05 ETH', active: false },
    { phase: 'Phase 4', count: '30 NFT', price: '0.1 ETH', active: false },
  ];

  return (
    <div style={{ fontFamily: 'var(--vv-pixel)', color: '#fff', fontSize: '11px', padding: '4px' }}>
      {/* ── 1. AUTO BUYBACK & BURN BANNER ── */}
      <div style={{
        background: 'rgba(255, 68, 170, 0.15)',
        border: '1.5px solid rgba(255, 68, 170, 0.5)',
        borderRadius: '12px',
        padding: '14px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 4px 16px rgba(255, 68, 170, 0.25)'
      }}>
        <span style={{ fontSize: '26px' }}>🔥</span>
        <div style={{ fontSize: '10px', color: '#ff66bb', lineHeight: 1.6 }}>
          <strong style={{ color: '#fff', letterSpacing: '0.5px' }}>100% AUTO BUYBACK & BURN:</strong> All ETH raised from minting is instantly swapped on-chain for $VIBE and sent directly to the <code>0x00...dEaD</code> burner address!
        </div>
      </div>

      {/* ── 2. TOP SECTION: LARGE CENTERED NFT PREVIEW & MINT BUTTON ── */}
      <div style={{
        background: 'rgba(4, 20, 48, 0.95)',
        border: '2.5px solid #00f5ff',
        borderRadius: '16px',
        padding: '24px 32px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justify: 'center',
        textAlign: 'center',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8), 0 0 24px rgba(0, 245, 255, 0.25)'
      }}>
        {/* Large NFT Image Container */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
          <img
            src="/vibe-dog.jpg"
            alt="Genesis NFT"
            style={{
              width: '160px',
              height: '160px',
              borderRadius: '14px',
              border: '4px solid #ffd700',
              objectFit: 'cover',
              boxShadow: '0 0 24px rgba(255, 215, 0, 0.55)',
              imageRendering: 'pixelated'
            }}
          />
          <span style={{
            position: 'absolute',
            bottom: '-8px',
            right: '-8px',
            background: 'linear-gradient(135deg, #ff007f 0%, #ff44aa 100%)',
            color: '#fff',
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: '6px',
            fontWeight: 900,
            border: '1.5px solid #fff',
            boxShadow: '0 3px 10px rgba(0,0,0,0.6)'
          }}>
            GENESIS
          </span>
        </div>

        {/* NFT Title & Minted Counter */}
        <div style={{ fontSize: '22px', color: '#ffd700', fontWeight: 900, letterSpacing: '1px', marginBottom: '6px', textShadow: '2px 2px 0 #000, 0 0 14px rgba(255, 215, 0, 0.6)' }}>
          GENESIS VIBE NFT
        </div>
        <div style={{ fontSize: '12px', color: '#00f5ff', fontWeight: 900, marginBottom: '16px' }}>
          TOTAL MINTED: <strong style={{ color: '#fff', fontSize: '14px' }}>{totalMinted}</strong> / {maxSupply}
        </div>

        {/* Large Centered Mint Button */}
        <button
          onClick={handleMint}
          disabled={minting || minted}
          style={{
            minWidth: '300px',
            maxWidth: '400px',
            width: '100%',
            fontFamily: 'var(--vv-pixel)',
            fontSize: '13px',
            fontWeight: 900,
            background: minted
              ? 'linear-gradient(135deg, #00ff88 0%, #00aa55 100%)'
              : 'linear-gradient(135deg, #ff44aa 0%, #b44dff 100%)',
            border: '2.5px solid #ffffff',
            borderRadius: '12px',
            padding: '14px 28px',
            color: minted ? '#020b1a' : '#ffffff',
            cursor: minted ? 'default' : 'pointer',
            boxShadow: minted
              ? '0 4px 0 #008844, 0 0 20px rgba(0, 255, 136, 0.6)'
              : '0 4px 0 #660044, 0 0 24px rgba(255, 68, 170, 0.7)',
            transition: 'all 0.15s ease',
            letterSpacing: '1px'
          }}
        >
          {minted ? 'MINTED! ✓' : minting ? 'MINTING ON BASE...' : `MINT FOR ${currentPrice}`}
        </button>
      </div>

      {/* ── 3. BOTTOM SECTION: MINT PRICING PHASES (FAR LEFT PHASE & FAR RIGHT PRICE) ── */}
      <div style={{
        background: 'rgba(2, 11, 26, 0.85)',
        border: '1.5px solid rgba(0, 245, 255, 0.3)',
        borderRadius: '12px',
        padding: '18px 22px'
      }}>
        <div style={{ color: '#ffd700', fontSize: '11px', marginBottom: '14px', letterSpacing: '0.8px', fontWeight: 900 }}>
          MINT PRICING PHASES
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {phases.map((p) => (
            <div
              key={p.phase}
              style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                padding: '12px 20px',
                borderRadius: '8px',
                background: p.active ? 'rgba(0, 245, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                border: p.active ? '1.5px solid #00f5ff' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: p.active ? '0 0 16px rgba(0, 245, 255, 0.25)' : 'none'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 900, color: p.active ? '#00f5ff' : '#ffffff', letterSpacing: '0.5px' }}>
                {p.phase} <span style={{ color: '#88aacc', fontSize: '11px', marginLeft: '6px' }}>({p.count})</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 900, color: p.active ? '#ffd700' : '#88aa88', letterSpacing: '0.5px' }}>
                {p.price}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
