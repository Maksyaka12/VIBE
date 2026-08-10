import React, { useState, useEffect } from 'react';

export default function NftMintPanel({ player, onUpdatePlayer }) {
  const [collection, setCollection] = useState([]);
  const [selectedNft, setSelectedNft] = useState(null);
  const [minted, setMinted] = useState(false);
  const [minting, setMinting] = useState(false);

  const currentPrice = '0.005 ETH';
  const totalMinted = 4;
  const maxSupply = 334;

  useEffect(() => {
    fetch('/nft/collection.json')
      .then((r) => r.json())
      .then((data) => {
        setCollection(data);
        // Default to #004 Footballer for Phase 1 mint preview
        const defaultNext = data.find((n) => n.tokenId === 4) || data[4];
        setSelectedNft(defaultNext);
      })
      .catch(() => console.error('Failed to load NFT collection'));
  }, []);

  const handleMint = () => {
    if (!selectedNft) return;
    setMinting(true);
    setTimeout(() => {
      setMinting(false);
      setMinted(true);
      // Equip NFT to player character!
      if (onUpdatePlayer) {
        onUpdatePlayer({
          ...player,
          nft: selectedNft
        });
      }
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
    <div style={{ fontFamily: 'var(--vv-pixel)', color: '#fff', fontSize: '11px' }}>
      {/* Auto Burn Banner */}
      <div style={{
        background: 'rgba(255, 68, 170, 0.15)',
        border: '1.5px solid rgba(255, 68, 170, 0.5)',
        borderRadius: '10px',
        padding: '14px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 4px 16px rgba(255, 68, 170, 0.2)'
      }}>
        <span style={{ fontSize: '24px' }}>🔥</span>
        <div style={{ fontSize: '10px', color: '#ff44aa', lineHeight: 1.6 }}>
          <strong style={{ color: '#fff' }}>100% AUTO BUYBACK & BURN:</strong> All ETH raised from minting is instantly swapped on-chain for $VIBE and sent directly to the <code>0x00...dEaD</code> burner address!
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
        {/* Left Column: NFT Preview & Mint Button */}
        <div style={{
          background: 'rgba(4, 20, 48, 0.95)',
          border: '2px solid #00f5ff',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(0,0,0,0.6)'
        }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '12px',
              border: '3px solid #ffd700',
              background: '#020b1a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/vibe-dog.jpg"
                alt="Genesis NFT"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                fontSize: '22px',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))'
              }}>
                {selectedNft?.emoji || '⚽'}
              </div>
            </div>

            <span style={{
              position: 'absolute',
              bottom: '-6px',
              right: '-6px',
              background: '#ff007f',
              color: '#fff',
              fontSize: '9px',
              padding: '3px 6px',
              borderRadius: '4px',
              fontWeight: 900
            }}>
              GENESIS
            </span>
          </div>

          <div style={{ fontSize: '13px', color: '#ffd700', marginBottom: '4px', letterSpacing: '0.5px', fontWeight: 900 }}>
            {selectedNft?.name || `Vibe Club: #004 Footballer`}
          </div>
          <div style={{ fontSize: '10px', color: '#00f5ff', marginBottom: '6px' }}>
            ROLE: <strong style={{ color: '#00ff88' }}>{selectedNft?.role || 'Footballer'} {selectedNft?.emoji || '⚽'}</strong>
          </div>
          <div style={{ fontSize: '9px', color: '#aaa', marginBottom: '14px' }}>
            OUTFIT: {selectedNft?.outfit || 'Number 10 Jersey & Cleats'}
          </div>

          <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '14px' }}>
            TOTAL MINTED: <strong style={{ color: '#fff' }}>{totalMinted}</strong> / {maxSupply}
          </div>

          <button
            onClick={handleMint}
            disabled={minting || minted}
            style={{
              width: '100%',
              fontFamily: 'var(--vv-pixel)',
              fontSize: '11px',
              background: minted ? '#00ff88' : 'linear-gradient(135deg, #ff44aa, #b44dff)',
              border: '2px solid #fff',
              borderRadius: '8px',
              padding: '14px',
              color: minted ? '#000' : '#fff',
              fontWeight: 900,
              cursor: minted ? 'default' : 'pointer',
              boxShadow: '0 4px 0 #660044, 0 0 20px rgba(255, 68, 170, 0.6)'
            }}
          >
            {minted ? 'EQUIPPED IN-GAME! ✓' : minting ? 'MINTING ON BASE...' : `MINT & EQUIP FOR ${currentPrice}`}
          </button>
        </div>

        {/* Right Column: Mint Pricing Phases */}
        <div style={{ background: 'rgba(2, 11, 26, 0.85)', border: '1.5px solid rgba(0, 245, 255, 0.3)', borderRadius: '12px', padding: '18px' }}>
          <div style={{ color: '#ffd700', fontSize: '11px', marginBottom: '14px', letterSpacing: '0.5px' }}>
            MINT PRICING PHASES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {phases.map((p) => (
              <div
                key={p.phase}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: p.active ? 'rgba(0, 245, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                  border: p.active ? '1.5px solid #00f5ff' : '1px solid rgba(255,255,255,0.08)',
                  color: p.active ? '#ffd700' : p.done ? '#00ff88' : '#aaa'
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 900, marginBottom: '2px' }}>{p.phase}</div>
                  <div style={{ fontSize: '9px', opacity: 0.8 }}>{p.label}</div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 900 }}>{p.done ? 'COMPLETED ✓' : p.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
