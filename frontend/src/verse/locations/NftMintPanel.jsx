import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useUserBalances } from '../hooks/useUserBalances';

export default function NftMintPanel({ player }) {
  const { user } = usePrivy();
  const balances = useUserBalances(user?.wallet?.address);

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

  // Phases 1 to 4 (Phase 0 Whitelist is internal; Phase 1 has 104 NFT total)
  const phases = [
    { phase: 'Phase 1', count: '104 NFT', price: '0.005 ETH', active: true, done: false },
    { phase: 'Phase 2', count: '100 NFT', price: '0.015 ETH', active: false, done: false },
    { phase: 'Phase 3', count: '100 NFT', price: '0.05 ETH', active: false, done: false },
    { phase: 'Phase 4', count: '30 NFT', price: '0.1 ETH', active: false, done: false },
  ];

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: '#fff', fontSize: '12px', padding: '4px' }}>
      {/* ── 1. TOP MAIN CARD: LEFT NFT IMAGE + RIGHT DETAILS & MINT BUTTON ── */}
      <div className="vv-nft-top-card" style={{
        background: 'rgba(4, 20, 48, 0.95)',
        border: '2.5px solid #00f5ff',
        borderRadius: '16px',
        padding: '28px 36px',
        marginBottom: '22px',
        display: 'flex',
        alignItems: 'center',
        gap: '36px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 28px rgba(0, 245, 255, 0.25)'
      }}>
        {/* Left Side: Large NFT Image */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src="/nft/images/1.png"
            onError={(e) => { e.target.src = '/vibe-dog.jpg'; }}
            alt="Genesis NFT"
            className="vv-nft-main-img"
            style={{
              width: '190px',
              height: '190px',
              borderRadius: '16px',
              border: '4px solid #ffd700',
              objectFit: 'cover',
              boxShadow: '0 0 28px rgba(255, 215, 0, 0.55)',
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
            padding: '4px 12px',
            borderRadius: '6px',
            fontWeight: 900,
            border: '1.5px solid #fff',
            boxShadow: '0 3px 10px rgba(0,0,0,0.6)'
          }}>
            GENESIS
          </span>
        </div>

        {/* Right Side: Phase Badge, Title, Counter & Mint Button */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Pulsing Phase Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 255, 136, 0.12)',
            border: '1.5px solid #00ff88',
            borderRadius: '8px',
            padding: '5px 12px',
            width: 'fit-content',
            boxShadow: '0 0 12px rgba(0, 255, 136, 0.3)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00ff88',
              boxShadow: '0 0 8px #00ff88',
              animation: 'vv-pulse-dot 1.5s infinite'
            }} />
            <span style={{ fontSize: '11px', color: '#00ff88', fontWeight: 900, letterSpacing: '0.8px' }}>
              PHASE 1
            </span>
          </div>

          <div>
            <div style={{
              fontSize: '26px',
              color: '#ffd700',
              fontWeight: 900,
              letterSpacing: '1.2px',
              marginBottom: '6px',
              textShadow: '2px 2px 0 #000, 0 0 16px rgba(255, 215, 0, 0.6)'
            }}>
              VIBE CLUB NFT
            </div>
            <div style={{ fontSize: '13px', color: '#00f5ff', fontWeight: 900 }}>
              TOTAL MINTED: <strong style={{ color: '#fff', fontSize: '15px' }}>{totalMinted}</strong> / {maxSupply}
            </div>
          </div>

          <button
            onClick={handleMint}
            disabled={minting || minted}
            style={{
              fontFamily: 'var(--vv-pixel)',
              fontSize: '14px',
              fontWeight: 900,
              background: minted
                ? 'linear-gradient(135deg, #00ff88 0%, #00aa55 100%)'
                : 'linear-gradient(135deg, #ff44aa 0%, #b44dff 100%)',
              border: '2.5px solid #ffffff',
              borderRadius: '12px',
              padding: '16px 28px',
              color: minted ? '#020b1a' : '#ffffff',
              cursor: minted ? 'default' : 'pointer',
              boxShadow: minted
                ? '0 4px 0 #008844, 0 0 20px rgba(0, 255, 136, 0.6)'
                : '0 4px 0 #660044, 0 0 24px rgba(255, 68, 170, 0.7)',
              transition: 'all 0.15s ease',
              letterSpacing: '1px',
              marginTop: '4px'
            }}
          >
            {minted ? 'MINTED! ✓' : minting ? 'MINTING ON BASE...' : `MINT FOR ${currentPrice}`}
          </button>

          <div style={{ fontSize: '10px', color: '#88aacc', textAlign: 'center', marginTop: '6px' }}>
            YOUR BALANCE: <strong style={{ color: '#00f5ff' }}>{balances.loading ? 'Loading...' : `${balances.ethFormatted} ETH`}</strong>
          </div>
        </div>
      </div>

      {/* ── 2. MIDDLE SECTION: MINT PRICING PHASES (FAR LEFT PHASE & FAR RIGHT PRICE) ── */}
      <div style={{
        background: 'rgba(2, 11, 26, 0.85)',
        border: '1.5px solid rgba(0, 245, 255, 0.3)',
        borderRadius: '14px',
        padding: '20px 24px',
        marginBottom: '22px',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{ color: '#ffd700', fontSize: '12px', marginBottom: '14px', letterSpacing: '0.8px', fontWeight: 900 }}>
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
                padding: '12px 22px',
                borderRadius: '8px',
                background: p.active ? 'rgba(0, 245, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: p.active ? '1.5px solid #00f5ff' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: p.active ? '0 0 16px rgba(0, 245, 255, 0.25)' : 'none',
                width: '100%'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 900, color: p.active ? '#00f5ff' : p.done ? '#00ff88' : '#ffffff', letterSpacing: '0.5px' }}>
                {p.phase} <span style={{ color: '#88aacc', fontSize: '11px', marginLeft: '6px' }}>({p.count})</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 900, color: p.done ? '#00ff88' : p.active ? '#ffd700' : '#888888', letterSpacing: '0.5px', marginLeft: 'auto', textAlign: 'right' }}>
                {p.done ? 'COMPLETED ✓' : p.price}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. BOTTOM SECTION: EXPLANATORY BENEFIT CARDS (HOLDERS VAULT STYLE) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px'
      }}>
        {/* Card 1: 80% Buyback & Burn + 20% Treasury */}
        <div style={{
          background: 'rgba(2, 11, 26, 0.9)',
          border: '1.5px solid rgba(255, 68, 170, 0.4)',
          borderRadius: '12px',
          padding: '16px 18px',
          boxShadow: '0 4px 16px rgba(255, 68, 170, 0.15)'
        }}>
          <div style={{ fontSize: '12px', color: '#ff44aa', fontWeight: 900, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔥</span> 80% BURN / 20% REWARDS
          </div>
          <div style={{ fontSize: '10px', color: '#ccc', lineHeight: 1.6 }}>
            80% of ETH raised from minting is automatically swapped for $VIBE & burned, while 20% stays in contract treasury for protocol buybacks & rewards.
          </div>
        </div>

        {/* Card 2: Elite Community */}
        <div style={{
          background: 'rgba(2, 11, 26, 0.9)',
          border: '1.5px solid rgba(255, 215, 0, 0.4)',
          borderRadius: '12px',
          padding: '16px 18px',
          boxShadow: '0 4px 16px rgba(255, 215, 0, 0.15)'
        }}>
          <div style={{ fontSize: '12px', color: '#ffd700', fontWeight: 900, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👑</span> ELITE COMMUNITY
          </div>
          <div style={{ fontSize: '10px', color: '#ccc', lineHeight: 1.6 }}>
            Vibe Club is an exclusive tier for loyal community members who prove their commitment to the $VIBE ecosystem.
          </div>
        </div>

        {/* Card 3: Game Perks */}
        <div style={{
          background: 'rgba(2, 11, 26, 0.9)',
          border: '1.5px solid rgba(0, 245, 255, 0.4)',
          borderRadius: '12px',
          padding: '16px 18px',
          boxShadow: '0 4px 16px rgba(0, 245, 255, 0.15)'
        }}>
          <div style={{ fontSize: '12px', color: '#00f5ff', fontWeight: 900, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🎮</span> IN-GAME PERKS
          </div>
          <div style={{ fontSize: '10px', color: '#ccc', lineHeight: 1.6 }}>
            Unlocks unique character skins, exclusive Vibe Verse badges, special vault access, and bonus multiplier rewards.
          </div>
        </div>
      </div>
    </div>
  );
}
