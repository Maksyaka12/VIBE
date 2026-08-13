import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useUserBalances } from '../verse/hooks/useUserBalances';

// Builder Code for Base Gas Back / Builder Rewards
export const BUILDER_CODE = 'bc_wsbqqe2u';

export default function NftClubPage() {
  const { login, logout, authenticated, user } = usePrivy();
  const walletAddress = user?.wallet?.address;
  const balances = useUserBalances(walletAddress);

  const [isMintingEth, setIsMintingEth] = useState(false);
  const [isMintingVibe, setIsMintingVibe] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(1);

  // Live DEX price ratio: 1 ETH = X VIBE
  const [vibePerEthRatio, setVibePerEthRatio] = useState(54600000); // Default fallback: 1 ETH = ~54.6M VIBE

  // Contract Mint details
  const ethPriceNumber = 0.005;
  const pricePerNft = `${ethPriceNumber} ETH`;
  const totalMinted = 0; // Initial state before public launch
  const maxSupply = 333;

  // Fetch live $VIBE pool price from DEX Screener on Base
  useEffect(() => {
    let isMounted = true;
    async function fetchLiveVibePrice() {
      try {
        const res = await fetch('https://api.dexscreener.com/latest/dex/tokens/0xb200000000000000000000df24ecb8bf51100a01');
        const data = await res.json();
        const pair = data?.pairs?.[0];
        if (pair && pair.priceNative && isMounted) {
          const priceNativeFloat = parseFloat(pair.priceNative);
          if (priceNativeFloat > 0) {
            const calculatedRatio = Math.floor(1 / priceNativeFloat);
            setVibePerEthRatio(calculatedRatio);
          }
        }
      } catch (e) {
        console.error('Error fetching DEX VIBE price:', e);
      }
    }

    fetchLiveVibePrice();
    const interval = setInterval(fetchLiveVibePrice, 30000); // Refresh every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Calculate live $VIBE required for Phase 1 (0.005 ETH * ratio)
  const estimatedVibePrice = Math.floor(ethPriceNumber * vibePerEthRatio);
  const [lockedVibePrice, setLockedVibePrice] = useState(null);

  // Total $VIBE burned strictly by this NFT mint contract (starts at 0 before mints)
  const totalVibeBurnedByContract = Math.floor(totalMinted * estimatedVibePrice * 0.8);

  // Format large number with comma separators for clean display
  const formatVibeFormatted = (amount) => {
    return amount.toLocaleString() + ' $VIBE';
  };

  // 4 Mint Phases definition with dynamic live $VIBE prices
  const phases = [
    { phase: 'Phase 1', count: '103 NFT', price: '0.005 ETH', vibePrice: formatVibeFormatted(Math.floor(0.005 * vibePerEthRatio)), active: true, done: false },
    { phase: 'Phase 2', count: '100 NFT', price: '0.015 ETH', vibePrice: formatVibeFormatted(Math.floor(0.015 * vibePerEthRatio)), active: false, done: false },
    { phase: 'Phase 3', count: '100 NFT', price: '0.05 ETH', vibePrice: formatVibeFormatted(Math.floor(0.05 * vibePerEthRatio)), active: false, done: false },
    { phase: 'Phase 4', count: '30 NFT', price: '0.1 ETH', vibePrice: formatVibeFormatted(Math.floor(0.1 * vibePerEthRatio)), active: false, done: false },
  ];

  // Mint with native ETH
  const handleMintEth = async () => {
    if (!authenticated) {
      login();
      return;
    }
    setIsMintingEth(true);
    setMintSuccess(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setMintSuccess(true);
    } catch (e) {
      console.error('Mint ETH error:', e);
    } finally {
      setIsMintingEth(false);
    }
  };

  // Mint with $VIBE tokens (Price Locking on Click)
  const handleMintVibe = async () => {
    if (!authenticated) {
      login();
      return;
    }
    // Lock the live price instantly upon click to prevent slippage during confirmation
    const finalVibePrice = estimatedVibePrice;
    setLockedVibePrice(finalVibePrice);

    setIsMintingVibe(true);
    setMintSuccess(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setMintSuccess(true);
    } catch (e) {
      console.error('Mint VIBE error:', e);
    } finally {
      setIsMintingVibe(false);
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
      {/* Inline animation keyframes for pulsing live indicator dot */}
      <style>{`
        @keyframes vvPulseDotAnimation {
          0% { transform: scale(0.9); opacity: 0.7; box-shadow: 0 0 4px #00ff88; }
          50% { transform: scale(1.35); opacity: 1; box-shadow: 0 0 12px #00ff88, 0 0 20px #00ff88; }
          100% { transform: scale(0.9); opacity: 0.7; box-shadow: 0 0 4px #00ff88; }
        }
        .vv-pulse-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00ff88;
          display: inline-block;
          animation: vvPulseDotAnimation 1.6s infinite ease-in-out;
        }
      `}</style>

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

        {/* ── MAIN CARD CONTAINER ── */}
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
            alignItems: 'start',
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
                alt="VIBE CLUB"
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
                VIBE CLUB
              </div>
            </div>

            {/* RIGHT COLUMN: CONTROLS (COMPACT & FLOWING NATURALLY) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {/* Active Phase Badge */}
              <div>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(0, 255, 136, 0.15)',
                  border: '1.5px solid #00ff88',
                  color: '#00ff88',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '8px',
                  letterSpacing: '0.5px'
                }}>
                  ● Phase 1 — Whitelist & Public
                </div>
              </div>

              {/* CARD 1: PRICE ETH & PRICE VIBE (STACKED) + LIMIT */}
              <div style={{
                background: 'rgba(2, 11, 26, 0.7)',
                border: '1px solid rgba(0, 245, 255, 0.25)',
                borderRadius: '12px',
                padding: '10px 14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '8px', color: '#aaa' }}>PRICE ETH</span>
                  <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '9px', color: '#00f5ff' }}>{pricePerNft}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '8px', color: '#aaa' }}>PRICE VIBE</span>
                  <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '9px', color: '#ffd700' }}>
                    {estimatedVibePrice.toLocaleString()} $VIBE
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '8px', color: '#aaa' }}>LIMIT</span>
                  <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '8px', color: '#00ff88' }}>1 NFT PER WALLET</span>
                </div>
              </div>

              {/* CARD 2: TOTAL MINTED & PROGRESS BAR */}
              <div style={{
                background: 'rgba(2, 11, 26, 0.7)',
                border: '1px solid rgba(0, 245, 255, 0.25)',
                borderRadius: '12px',
                padding: '10px 14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '8px', color: '#aaa' }}>TOTAL MINTED</span>
                  <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '9px', color: '#00f5ff' }}>{totalMinted} / {maxSupply}</span>
                </div>
                {/* Progress Bar */}
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(totalMinted / maxSupply) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #00f5ff, #00ff88)' }} />
                </div>
              </div>

              {/* CARD 3: TOTAL BURNED (CLEAN MINIMAL SINGLE-LINE CARD) */}
              <div style={{
                background: 'rgba(2, 11, 26, 0.7)',
                border: '1px solid rgba(255, 68, 102, 0.35)',
                borderRadius: '12px',
                padding: '10px 14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '8px', color: '#ff4466', fontWeight: 900 }}>TOTAL BURNED</span>
                  <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '9px', color: '#ffffff' }}>
                    {totalVibeBurnedByContract.toLocaleString()} $VIBE 🔥
                  </span>
                </div>
              </div>

              {/* USER WALLET BALANCES (CLEAN TEXT BLOCK) */}
              <div style={{ padding: '2px 4px' }}>
                <div style={{ fontSize: '8px', color: '#88aacc', marginBottom: '4px', letterSpacing: '0.4px' }}>
                  YOUR WALLET BALANCES:
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '8px', color: '#aaa' }}>• ETH Balance:</span>
                  <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '9px', color: '#00f5ff' }}>
                    {authenticated ? `${Number(balances?.eth || 0).toFixed(4)} ETH` : 'CONNECT WALLET'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '8px', color: '#aaa' }}>• $VIBE Balance:</span>
                  <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '9px', color: '#ffd700' }}>
                    {authenticated ? `${Math.floor(Number(balances?.vibe || 0)).toLocaleString()} $VIBE` : 'CONNECT WALLET'}
                  </span>
                </div>
              </div>

              {/* DUAL MINT ACTION BUTTONS WITH CLEAR "- OR -" DIVIDER */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                {/* 1. MINT FOR ETH BUTTON */}
                <button
                  onClick={handleMintEth}
                  disabled={isMintingEth || isMintingVibe}
                  style={{
                    width: '100%',
                    height: '42px',
                    fontFamily: 'var(--vv-pixel)',
                    fontSize: '10px',
                    fontWeight: 900,
                    background: authenticated
                      ? 'linear-gradient(135deg, #00f5ff 0%, #0050ff 100%)'
                      : 'linear-gradient(135deg, #00f5ff 0%, #0050ff 100%)',
                    border: '2px solid #ffffff',
                    borderRadius: '10px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0, 245, 255, 0.4)',
                    letterSpacing: '0.5px'
                  }}
                >
                  {isMintingEth
                    ? 'MINTING WITH ETH...'
                    : authenticated
                    ? `MINT FOR ${pricePerNft}`
                    : 'CONNECT WALLET TO MINT'}
                </button>

                {/* ELEGANT "- OR -" DIVIDER */}
                <div style={{
                  textAlign: 'center',
                  fontSize: '8px',
                  color: '#88aacc',
                  letterSpacing: '1px',
                  margin: '2px 0'
                }}>
                  — OR —
                </div>

                {/* 2. MINT FOR $VIBE BUTTON (LIVE DEX RATIO WITH SLIPPAGE LOCK) */}
                <button
                  onClick={handleMintVibe}
                  disabled={isMintingEth || isMintingVibe}
                  style={{
                    width: '100%',
                    height: '42px',
                    fontFamily: 'var(--vv-pixel)',
                    fontSize: '10px',
                    fontWeight: 900,
                    background: authenticated
                      ? 'linear-gradient(135deg, #ffd700 0%, #ff6b35 100%)'
                      : 'linear-gradient(135deg, #ffd700 0%, #ff6b35 100%)',
                    border: '2px solid #ffffff',
                    borderRadius: '10px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(255, 215, 0, 0.4)',
                    letterSpacing: '0.5px'
                  }}
                >
                  {isMintingVibe
                    ? `MINTING WITH ${lockedVibePrice ? lockedVibePrice.toLocaleString() : estimatedVibePrice.toLocaleString()} $VIBE...`
                    : authenticated
                    ? `MINT FOR ${estimatedVibePrice.toLocaleString()} $VIBE`
                    : 'MINT WITH $VIBE TOKENS'}
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: 4 MINT PHASES STACKED VERTICALLY (1 ROW PER PHASE) */}
          <div style={{
            borderTop: '1px solid rgba(0, 245, 255, 0.2)',
            paddingTop: '20px'
          }}>
            <div style={{
              fontSize: '9px',
              color: '#88aacc',
              marginBottom: '14px',
              letterSpacing: '0.5px'
            }}>
              MINT PHASES SCHEDULE:
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {phases.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    background: p.active ? 'rgba(0, 245, 255, 0.12)' : 'rgba(2, 11, 26, 0.5)',
                    border: p.active ? '1.5px solid #00f5ff' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    boxShadow: p.active ? '0 0 18px rgba(0, 245, 255, 0.25)' : 'none',
                    opacity: p.active ? 1 : 0.65,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {p.active && <span className="vv-pulse-indicator" />}
                    <span style={{
                      fontFamily: 'var(--vv-pixel)',
                      fontSize: '9px',
                      color: p.active ? '#00f5ff' : '#ffffff'
                    }}>
                      {p.phase} ({p.count})
                    </span>
                  </div>

                  <div style={{
                    fontFamily: 'var(--vv-pixel)',
                    fontSize: '9px',
                    color: p.active ? '#ffd700' : '#88aacc'
                  }}>
                    {p.price} / {p.vibePrice}
                  </div>
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
