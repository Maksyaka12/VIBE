import React, { useState } from 'react';

export default function NftMintPanel({ player }) {
  const [minted, setMinted] = useState(false);
  const [minting, setMinting] = useState(false);

  const currentPhase = 'Phase 1: Early Birds';
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

  const phases = [
    { phase: 'Phase 0', label: 'Whitelist (4 NFT)', price: 'FREE', active: false, done: true },
    { phase: 'Phase 1', label: 'Early Birds (100 NFT)', price: '0.005 ETH', active: true, done: false },
    { phase: 'Phase 2', label: 'Enthusiasts (100 NFT)', price: '0.015 ETH', active: false, done: false },
    { phase: 'Phase 3', label: 'Legends (100 NFT)', price: '0.05 ETH', active: false, done: false },
    { phase: 'Phase 4', label: 'Final Tier (30 NFT)', price: '0.1 ETH', active: false, done: false },
  ];

  return (
    <div style={{ fontFamily: 'var(--vv-pixel)', color: '#fff', fontSize: '9px' }}>
      {/* Auto Burn Banner */}
      <div style={{
        background: 'rgba(255, 68, 170, 0.12)',
        border: '1px solid rgba(255, 68, 170, 0.4)',
        borderRadius: '8px',
        padding: '10px 14px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ fontSize: '16px' }}>🔥</span>
        <div style={{ fontSize: '7.5px', color: '#ff44aa', lineHeight: 1.5 }}>
          <strong>100% AUTO BUYBACK & BURN:</strong> All ETH raised from minting is instantly swapped on-chain for $VIBE and sent to the <code>0x00...dEaD</code> burner address!
        </div>
      </div>

      {/* Main NFT Mint Card */}
      <div style={{
        background: 'rgba(4, 20, 48, 0.95)',
        border: '2px solid #00f5ff',
        borderRadius: '10px',
        padding: '16px',
        textAlign: 'center',
        marginBottom: '16px'
      }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '10px' }}>
          <img
            src="/vibe-dog.jpg"
            alt="Genesis NFT"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '8px',
              border: '2px solid #ffd700',
              objectFit: 'cover'
            }}
          />
          <span style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            background: '#ff007f',
            color: '#fff',
            fontSize: '7px',
            padding: '2px 4px',
            borderRadius: '3px'
          }}>
            GENESIS
          </span>
        </div>

        <div style={{ fontSize: '11px', color: '#ffd700', marginBottom: '4px' }}>
          GENESIS PIXEL DOG #{String(totalMinted + 1).padStart(3, '0')}
        </div>
        <div style={{ fontSize: '7.5px', color: '#00f5ff', marginBottom: '12px' }}>
          TOTAL MINTED: {totalMinted} / {maxSupply}
        </div>

        <button
          onClick={handleMint}
          disabled={minting || minted}
          style={{
            fontFamily: 'var(--vv-pixel)',
            fontSize: '9px',
            background: minted ? '#00ff88' : 'linear-gradient(135deg, #ff44aa, #b44dff)',
            border: '2px solid #fff',
            borderRadius: '6px',
            padding: '10px 20px',
            color: minted ? '#000' : '#fff',
            cursor: minted ? 'default' : 'pointer',
            boxShadow: '0 3px 0 #660044, 0 0 15px rgba(255, 68, 170, 0.5)'
          }}
        >
          {minted ? 'MINTED! ✓' : minting ? 'MINTING ON BASE...' : `MINT FOR ${currentPrice}`}
        </button>
      </div>

      {/* Tiered Pricing Phases Tracker */}
      <div style={{ background: 'rgba(2, 11, 26, 0.8)', border: '1px solid rgba(0, 245, 255, 0.2)', borderRadius: '8px', padding: '12px' }}>
        <div style={{ color: '#aaa', fontSize: '7px', marginBottom: '8px', textTransform: 'uppercase' }}>
          MINT PRICING PHASES
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {phases.map((p) => (
            <div
              key={p.phase}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 10px',
                borderRadius: '4px',
                background: p.active ? 'rgba(0, 245, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                border: p.active ? '1px solid #00f5ff' : '1px solid rgba(255,255,255,0.05)',
                color: p.active ? '#ffd700' : p.done ? '#00ff88' : '#888'
              }}
            >
              <span>{p.phase}: {p.label}</span>
              <span style={{ fontWeight: 900 }}>{p.done ? 'COMPLETED ✓' : p.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
