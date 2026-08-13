import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useUserBalances } from '../verse/hooks/useUserBalances';

// Builder Code for Base Gas Back / Builder Rewards
export const BUILDER_CODE = 'bc_wsbqqe2u';

export default function NftClubPage() {
  const { login, logout, authenticated, user } = usePrivy();
  const walletAddress = user?.wallet?.address;
  const balances = useUserBalances(walletAddress);

  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(1);

  // Contract Mint details
  const pricePerNft = '0.005 ETH';
  const totalMinted = 12;
  const maxSupply = 333;

  // 4 Mint Phases definition (Total: 103 + 100 + 100 + 30 = 333 NFT)
  const phases = [
    { phase: 'PHASE 1', count: '103 NFT', price: '0.005 ETH', active: true, done: false },
    { phase: 'PHASE 2', count: '100 NFT', price: '0.015 ETH', active: false, done: false },
    { phase: 'PHASE 3', count: '100 NFT', price: '0.05 ETH', active: false, done: false },
    { phase: 'PHASE 4', count: '30 NFT', price: '0.1 ETH', active: false, done: false },
  ];

  const handleMint = async () => {
    if (!authenticated) {
      login();
      return;
    }
    setIsMinting(true);
    setMintSuccess(false);
    try {
      // Simulate mint call until contract is deployed on Base Mainnet
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setMintSuccess(true);
    } catch (e) {
      console.error('Mint error:', e);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 10%, #041430 0%, #020b1a 70%, #000511 100%)',
      color: '#fff',
      fontFamily: 'var(--vv-pixel)',
      paddingBottom: '80px',
      overflowX: 'hidden'
    }}>
      {/* ── TOP HEADER / NAV ── */}
      <header style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(0, 245, 255, 0.15)',
        background: 'rgba(2, 11, 26, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/vibe-logo.png" alt="VIBE" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
          <div>
            <div style={{ fontFamily: 'var(--vv-pixel)', fontSize: '12px', color: '#00f5ff', letterSpacing: '0.5px' }}>
              VIBE CLUB
            </div>
            <div style={{ fontSize: '8px', color: '#88aacc', marginTop: '2px', letterSpacing: '0.3px' }}>
              Genesis 333 NFT Collection
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {authenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'rgba(0, 245, 255, 0.1)',
                border: '1px solid rgba(0, 245, 255, 0.3)',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '9px',
                color: '#00ff88',
                fontFamily: 'var(--vv-pixel)'
              }}>
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </div>
              <button
                onClick={logout}
                style={{
                  fontFamily: 'var(--vv-pixel)',
                  background: 'transparent',
                  border: '1px solid rgba(255, 68, 102, 0.4)',
                  color: '#ff4466',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '8px',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              style={{
                fontFamily: 'var(--vv-pixel)',
                fontSize: '9px',
                background: 'linear-gradient(135deg, #00f5ff, #0050ff)',
                color: '#fff',
                border: '1.5px solid #fff',
                padding: '10px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 0 14px rgba(0, 245, 255, 0.4)',
                fontWeight: 900
              }}
            >
              CONNECT WALLET
            </button>
          )}
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <div style={{
        maxWidth: '1050px',
        margin: '36px auto 0 auto',
        padding: '0 20px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontFamily: 'var(--vv-pixel)',
          fontSize: '24px',
          color: '#ffffff',
          textShadow: '0 0 20px rgba(0, 245, 255, 0.5)',
          marginBottom: '16px',
          lineHeight: 1.4
        }}>
          VIBE CLUB — GENESIS 333 NFT
        </h1>

        <p style={{
          fontFamily: 'var(--vv-pixel)',
          fontSize: '9px',
          color: '#a0b5d0',
          maxWidth: '750px',
          margin: '0 auto 32px auto',
          lineHeight: 1.8,
          letterSpacing: '0.4px'
        }}>
          Vibe Club is the early dogs who proved their loyalty building the vibe culture on B20 and across the Base Ecosystem. Joining Vibe Club unlocks exclusive perks in VibeVerse and a lifetime passive weekly income.
        </p>

        {/* ── MAIN CARD CONTAINER (TOP: 2 COLUMNS, BOTTOM: 4 PHASES GRID) ── */}
        <div style={{
          background: 'rgba(4, 20, 48, 0.85)',
          border: '2px solid #00f5ff',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 245, 255, 0.25)',
          backdropFilter: 'blur(16px)',
          textAlign: 'left'
        }}>
          {/* TOP SECTION: LEFT NFT IMAGE + RIGHT CONTROLS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.1fr',
            gap: '28px',
            alignItems: 'stretch',
            marginBottom: '32px'
          }} className="vv-nft-club-main-grid">

            {/* LEFT COLUMN: LARGE NFT IMAGE (SQUARE) */}
            <div style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '3px solid #ffd700',
              boxShadow: '0 0 28px rgba(255, 215, 0, 0.4)',
              background: '#020b1a',
              aspectRatio: '1/1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={`/nft/images/${selectedPreview}.png`}
                onError={(e) => { e.target.src = '/vibe-dog.jpg'; }}
                alt={`Genesis NFT #${selectedPreview}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                background: 'rgba(2, 11, 26, 0.85)',
                border: '1px solid #00f5ff',
                padding: '6px 12px',
                borderRadius: '8px',
                fontFamily: 'var(--vv-pixel)',
                fontSize: '9px',
                color: '#ffd700'
              }}>
                GENESIS #{selectedPreview}
              </div>
            </div>

            {/* RIGHT COLUMN: CONTROLS (EXACTLY MATCHING HEIGHT OF LEFT IMAGE) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%'
            }}>
              <div>
                {/* Active Phase Badge */}
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(0, 255, 136, 0.15)',
                  border: '1.5px solid #00ff88',
                  color: '#00ff88',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '8px',
                  marginBottom: '14px',
                  letterSpacing: '0.5px'
                }}>
                  ● Phase 1 — Whitelist & Public
                </div>

                {/* CARD 1: PRICE & LIMIT */}
                <div style={{
                  background: 'rgba(2, 11, 26, 0.7)',
                  border: '1px solid rgba(0, 245, 255, 0.25)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '9px', color: '#aaa' }}>PRICE</span>
                    <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '11px', color: '#ffd700' }}>{pricePerNft}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '9px', color: '#aaa' }}>LIMIT</span>
                    <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '9px', color: '#00ff88' }}>1 NFT PER WALLET</span>
                  </div>
                </div>

                {/* CARD 2: TOTAL MINTED & PROGRESS BAR */}
                <div style={{
                  background: 'rgba(2, 11, 26, 0.7)',
                  border: '1px solid rgba(0, 245, 255, 0.25)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '9px', color: '#aaa' }}>TOTAL MINTED</span>
                    <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '10px', color: '#00f5ff' }}>{totalMinted} / {maxSupply}</span>
                  </div>
                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(totalMinted / maxSupply) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #00f5ff, #00ff88)' }} />
                  </div>
                </div>

                {/* CARD 3: USER WALLET BALANCES (ETH & VIBE) */}
                <div style={{
                  background: 'rgba(2, 11, 26, 0.5)',
                  border: '1px solid rgba(255, 215, 0, 0.25)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '8px', color: '#aaa' }}>ETH BALANCE:</span>
                    <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '9px', color: '#00f5ff' }}>
                      {authenticated ? `${Number(balances?.eth || 0).toFixed(4)} ETH` : 'CONNECT WALLET'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '8px', color: '#aaa' }}>$VIBE BALANCE:</span>
                    <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '9px', color: '#ffd700' }}>
                      {authenticated ? `${Math.floor(Number(balances?.vibe || 0)).toLocaleString()} $VIBE` : 'CONNECT WALLET'}
                    </span>
                  </div>
                </div>
              </div>

              {/* MINT ACTION BUTTON (ALIGNED EXACTLY WITH BOTTOM OF LEFT NFT IMAGE) */}
              <button
                onClick={handleMint}
                disabled={isMinting}
                style={{
                  width: '100%',
                  height: '52px',
                  fontFamily: 'var(--vv-pixel)',
                  fontSize: '12px',
                  fontWeight: 900,
                  background: authenticated
                    ? 'linear-gradient(135deg, #00f5ff 0%, #0050ff 100%)'
                    : 'linear-gradient(135deg, #ffd700 0%, #ff6b35 100%)',
                  border: '2.5px solid #ffffff',
                  borderRadius: '12px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 4px 24px rgba(0, 245, 255, 0.4), 0 0 14px rgba(255, 255, 255, 0.5)',
                  letterSpacing: '0.8px'
                }}
              >
                {isMinting
                  ? 'MINTING IN PROGRESS...'
                  : authenticated
                  ? `MINT FOR ${pricePerNft}`
                  : 'CONNECT WALLET TO MINT'}
              </button>
            </div>
          </div>

          {/* BOTTOM SECTION: 4 MINT PHASES GRID (ACROSS FULL WIDTH) */}
          <div style={{
            borderTop: '1px solid rgba(0, 245, 255, 0.2)',
            paddingTop: '20px'
          }}>
            <div style={{
              fontSize: '9px',
              color: '#88aacc',
              marginBottom: '14px',
              letterSpacing: '0.5px',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center'
            }}>
              <span>MINT PHASES SCHEDULE:</span>
              <span style={{ color: '#ffd700' }}>TOTAL: 333 GENESIS NFT</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px'
            }} className="vv-nft-phases-grid">
              {phases.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    background: p.active ? 'rgba(0, 245, 255, 0.12)' : 'rgba(2, 11, 26, 0.6)',
                    border: p.active ? '1.5px solid #00f5ff' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '14px 12px',
                    textAlign: 'center',
                    boxShadow: p.active ? '0 0 16px rgba(0, 245, 255, 0.2)' : 'none'
                  }}
                >
                  <div style={{
                    fontFamily: 'var(--vv-pixel)',
                    fontSize: '9px',
                    color: p.active ? '#00f5ff' : '#aaa',
                    marginBottom: '6px'
                  }}>
                    {p.phase}
                  </div>
                  <div style={{ fontSize: '8px', color: '#88aacc', marginBottom: '8px' }}>
                    {p.count}
                  </div>
                  <div style={{
                    fontFamily: 'var(--vv-pixel)',
                    fontSize: '10px',
                    color: '#ffd700'
                  }}>
                    {p.price}
                  </div>
                  {p.active && (
                    <div style={{
                      display: 'inline-block',
                      marginTop: '6px',
                      background: '#00ff88',
                      color: '#020b1a',
                      fontSize: '7px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 900
                    }}>
                      LIVE NOW
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── HOLDER UTILITY CARDS ── */}
        <div style={{
          marginTop: '36px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px'
        }} className="vv-nft-club-utility-grid">
          <div style={{
            background: 'rgba(4, 20, 48, 0.6)',
            border: '1.5px solid rgba(0, 245, 255, 0.3)',
            borderRadius: '14px',
            padding: '20px',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '22px', marginBottom: '10px' }}>💰</div>
            <div style={{ fontFamily: 'var(--vv-pixel)', fontSize: '10px', color: '#ffd700', marginBottom: '8px' }}>
              100M $VIBE VAULT
            </div>
            <div style={{ fontSize: '8px', color: '#a0b5d0', lineHeight: 1.6, letterSpacing: '0.3px' }}>
              Genesis NFT stakers qualify for exclusive allocations from the 100M $VIBE Holder Vault pool.
            </div>
          </div>

          <div style={{
            background: 'rgba(4, 20, 48, 0.6)',
            border: '1.5px solid rgba(0, 245, 255, 0.3)',
            borderRadius: '14px',
            padding: '20px',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '22px', marginBottom: '10px' }}>🔥</div>
            <div style={{ fontFamily: 'var(--vv-pixel)', fontSize: '10px', color: '#ff4466', marginBottom: '8px' }}>
              80% ETH AUTO-BURN
            </div>
            <div style={{ fontSize: '8px', color: '#a0b5d0', lineHeight: 1.6, letterSpacing: '0.3px' }}>
              80% of all mint ETH revenue automatically buys & burns $VIBE tokens directly on Base DEXs!
            </div>
          </div>

          <div style={{
            background: 'rgba(4, 20, 48, 0.6)',
            border: '1.5px solid rgba(0, 245, 255, 0.3)',
            borderRadius: '14px',
            padding: '20px',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '22px', marginBottom: '10px' }}>🎮</div>
            <div style={{ fontFamily: 'var(--vv-pixel)', fontSize: '10px', color: '#00ff88', marginBottom: '8px' }}>
              VIP VIBEVERSE ACCESS
            </div>
            <div style={{ fontSize: '8px', color: '#a0b5d0', lineHeight: 1.6, letterSpacing: '0.3px' }}>
              Genesis NFT holders gain instant access to Phase 2 VibeVerse virtual world and exclusive Doghouse perks.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
