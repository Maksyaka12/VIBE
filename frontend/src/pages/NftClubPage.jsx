import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { parseEther } from 'viem';
import { useUserBalances } from '../verse/hooks/useUserBalances';
import { useVibeNftContract, NFT_CONTRACT_ADDRESS } from '../hooks/useVibeNftContract';
import nftNames from '../data/nftNames.json';

// Pixel SVG Wallet Icon
const WalletSvgIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="2" y="6" width="20" height="13" rx="2" />
    <path d="M16 12.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z" fill="currentColor" />
    <path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
  </svg>
);

export default function NftClubPage() {
  const { login, logout, authenticated, user } = usePrivy();
  const walletAddress = user?.wallet?.address;
  const balances = useUserBalances(walletAddress);

  const {
    totalMinted,
    remainingTokens,
    maxSupply,
    currentPhase,
    ethPriceFormatted,
    hasMinted,
    isMintingEth,
    isMintingVibe,
    isApprovingVibe,
    txHash,
    errorMessage,
    mintSuccess,
    mintWithETH,
    mintWithVIBE
  } = useVibeNftContract();

  const [selectedPreview, setSelectedPreview] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [vibePerEthRatio, setVibePerEthRatio] = useState(50000000); // 1 ETH = ~50M VIBE fallback

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
    const interval = setInterval(fetchLiveVibePrice, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Current dynamic $VIBE price based on active phase
  const ethPriceNum = parseFloat(ethPriceFormatted) || 0.005;
  const currentDynamicVibeAmount = Math.floor(ethPriceNum * vibePerEthRatio);

  // Curated showcase list cycling through iconic characters + randoms
  const featuredIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 50, 69, 310, 316, 320, 325, 330, 331, 332, 333];

  // Auto-play carousel every 2.8s
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setSelectedPreview((prev) => {
        const currentIdx = featuredIds.indexOf(prev);
        if (currentIdx !== -1 && currentIdx < featuredIds.length - 1) {
          return featuredIds[currentIdx + 1];
        }
        return featuredIds[0];
      });
    }, 2800);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handleNext = () => {
    setSelectedPreview((prev) => {
      const idx = featuredIds.indexOf(prev);
      if (idx !== -1 && idx < featuredIds.length - 1) return featuredIds[idx + 1];
      if (idx === -1) return (prev % 333) + 1;
      return featuredIds[0];
    });
  };

  const handlePrev = () => {
    setSelectedPreview((prev) => {
      const idx = featuredIds.indexOf(prev);
      if (idx > 0) return featuredIds[idx - 1];
      if (idx === -1) return prev > 1 ? prev - 1 : 333;
      return featuredIds[featuredIds.length - 1];
    });
  };

  const handleRandom = () => {
    const randomId = Math.floor(Math.random() * 333) + 1;
    setSelectedPreview(randomId);
  };

  const formatVibeComma = (amount) => {
    return Number(amount).toLocaleString('en-US') + ' $VIBE';
  };

  // Total $VIBE burned strictly by this NFT mint contract
  const totalVibeBurnedByContract = Math.floor(totalMinted * currentDynamicVibeAmount * 0.8);

  // 4 Mint Phases definition
  const phases = [
    { phase: 'PHASE 1', count: '103 NFT', price: '0.005 ETH', vibePrice: formatVibeComma(Math.floor(0.005 * vibePerEthRatio)), active: currentPhase === 1, done: currentPhase > 1 },
    { phase: 'PHASE 2', count: '100 NFT', price: '0.015 ETH', vibePrice: formatVibeComma(Math.floor(0.015 * vibePerEthRatio)), active: currentPhase === 2, done: currentPhase > 2 },
    { phase: 'PHASE 3', count: '100 NFT', price: '0.05 ETH', vibePrice: formatVibeComma(Math.floor(0.05 * vibePerEthRatio)), active: currentPhase === 3, done: currentPhase > 3 },
    { phase: 'PHASE 4', count: '30 NFT', price: '0.1 ETH', vibePrice: formatVibeComma(Math.floor(0.1 * vibePerEthRatio)), active: currentPhase === 4, done: false },
  ];

  const handleMintWithVibeClick = () => {
    const vibeWei = parseEther(currentDynamicVibeAmount.toString());
    mintWithVIBE(vibeWei);
  };

  const currentCharacterName = nftNames[selectedPreview] || `Character #${selectedPreview}`;
  const isSpecialLegend = selectedPreview <= 4 || selectedPreview >= 330;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 10%, #041430 0%, #020b1a 70%, #000511 100%)',
      color: '#fff',
      fontFamily: 'var(--vv-pixel)',
      paddingBottom: '80px',
      overflowX: 'hidden',
      textTransform: 'uppercase',
      width: '100vw'
    }}>
      {/* Inline animation & Mobile CSS Override */}
      <style>{`
        @keyframes vvPulseDotAnimation {
          0% { transform: scale(0.9); opacity: 0.7; box-shadow: 0 0 4px #00ff88; }
          50% { transform: scale(1.35); opacity: 1; box-shadow: 0 0 12px #00ff88, 0 0 20px #00ff88; }
          100% { transform: scale(0.9); opacity: 0.7; box-shadow: 0 0 4px #00ff88; }
        }
        @keyframes vvCardGlow {
          0% { box-shadow: 0 0 24px rgba(0, 245, 255, 0.4), 0 0 40px rgba(0, 0, 0, 0.8); }
          50% { box-shadow: 0 0 36px rgba(255, 215, 0, 0.5), 0 0 45px rgba(0, 0, 0, 0.8); }
          100% { box-shadow: 0 0 24px rgba(0, 245, 255, 0.4), 0 0 40px rgba(0, 0, 0, 0.8); }
        }
        @keyframes vvImgPop {
          0% { transform: scale(0.95); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .vv-pulse-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00ff88;
          display: inline-block;
          animation: vvPulseDotAnimation 1.6s infinite ease-in-out;
        }
        .vv-nft-img-animated {
          animation: vvImgPop 0.35s ease-out forwards;
        }

        /* ── MOBILE SPECIFIC STYLES (< 768px) ── */
        @media (max-width: 768px) {
          .vv-nft-club-header {
            padding: 12px 14px !important;
          }
          .vv-nft-club-header-subtext {
            white-space: nowrap !important;
            font-size: 7px !important;
          }
          .vv-nft-club-container {
            padding: 0 12px !important;
            margin-top: 16px !important;
          }
          .vv-nft-club-main-card {
            padding: 16px 14px !important;
            border-radius: 16px !important;
          }
          .vv-nft-club-main-grid {
            grid-template-columns: 1fr !important;
            gap: 18px !important;
            margin-bottom: 24px !important;
          }
          .vv-nft-phase-row {
            padding: 12px 14px !important;
          }
          .vv-nft-phase-text {
            font-size: 8px !important;
            white-space: nowrap !important;
          }
          .vv-nft-phase-prices {
            font-size: 8px !important;
            white-space: nowrap !important;
          }
          .vv-phase-vibe-part {
            display: none !important;
          }
          .vv-faq-section-title {
            font-size: 12px !important;
            white-space: nowrap !important;
          }
          .vv-faq-card {
            padding: 16px 18px !important;
          }
          .vv-faq-title {
            font-size: 9px !important;
          }
          .vv-faq-text {
            font-size: 7.5px !important;
          }
          .vv-desktop-wallet-btn {
            display: none !important;
          }
          .vv-mobile-wallet-btn {
            display: flex !important;
          }
        }

        @media (min-width: 769px) {
          .vv-mobile-wallet-btn {
            display: none !important;
          }
        }
      `}</style>

      {/* ── TOP HEADER / NAV ── */}
      <header className="vv-nft-club-header" style={{
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/vibe-logo.png" alt="VIBE" style={{ width: '34px', height: '34px', borderRadius: '8px' }} />
          <div>
            <div style={{ fontFamily: 'var(--vv-pixel)', fontSize: '11px', color: '#00f5ff', letterSpacing: '0.5px' }}>
              VIBE CLUB
            </div>
            <div className="vv-nft-club-header-subtext" style={{ fontSize: '8px', color: '#88aacc', marginTop: '2px', letterSpacing: '0.3px' }}>
              VIBE VERSE: GENESIS
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* OpenSea Link */}
          <a
            href={`https://opensea.io/assets/base/${NFT_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(32, 129, 226, 0.15)',
              border: '1px solid #2081e2',
              color: '#2081e2',
              fontSize: '8px',
              textDecoration: 'none',
              fontWeight: 900
            }}
          >
            OPENSEA ↗
          </a>

          {/* DESKTOP WALLET CONNECT */}
          <div className="vv-desktop-wallet-btn">
            {authenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'rgba(0, 245, 255, 0.1)',
                  border: '1px solid rgba(0, 245, 255, 0.3)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '9px',
                  color: '#00ff88',
                  fontFamily: 'var(--vv-pixel)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <WalletSvgIcon size={12} /> {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
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
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  LOGOUT
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
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <WalletSvgIcon size={13} /> CONNECT WALLET
              </button>
            )}
          </div>

          {/* MOBILE WALLET CONNECT */}
          <div className="vv-mobile-wallet-btn" style={{ alignItems: 'center' }}>
            {authenticated ? (
              <button
                onClick={logout}
                style={{
                  fontFamily: 'var(--vv-pixel)',
                  fontSize: '8px',
                  background: 'rgba(0, 245, 255, 0.12)',
                  border: '1.5px solid #00f5ff',
                  color: '#00ff88',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 0 10px rgba(0, 245, 255, 0.3)'
                }}
              >
                <WalletSvgIcon size={12} /> {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-3)}
              </button>
            ) : (
              <button
                onClick={login}
                style={{
                  fontFamily: 'var(--vv-pixel)',
                  fontSize: '8px',
                  background: 'linear-gradient(135deg, #00f5ff, #0050ff)',
                  color: '#fff',
                  border: '1.5px solid #ffffff',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 0 12px rgba(0, 245, 255, 0.4)',
                  fontWeight: 900
                }}
              >
                <WalletSvgIcon size={12} /> CONNECT
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN CONTAINER ── */}
      <div className="vv-nft-club-container" style={{
        maxWidth: '1050px',
        margin: '24px auto 0 auto',
        padding: '0 20px',
        textAlign: 'center'
      }}>

        {/* ── MAIN CARD CONTAINER ── */}
        <div className="vv-nft-club-main-card" style={{
          background: 'rgba(4, 20, 48, 0.85)',
          border: '2px solid #00f5ff',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 245, 255, 0.25)',
          backdropFilter: 'blur(16px)',
          textAlign: 'left'
        }}>
          {/* ACTIVE PHASE BADGE */}
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(0, 255, 136, 0.15)',
              border: '1.5px solid #00ff88',
              color: '#00ff88',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '8px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap'
            }}>
              ● PHASE {currentPhase} MINT IS LIVE
            </div>

            <a
              href={`https://basescan.org/address/${NFT_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '8px',
                color: '#88aacc',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              CONTRACT: {NFT_CONTRACT_ADDRESS.slice(0, 6)}...{NFT_CONTRACT_ADDRESS.slice(-4)} ↗
            </a>
          </div>

          {/* TOP SECTION: LEFT ANIMATED NFT CARD + RIGHT CONTROLS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.1fr',
            gap: '28px',
            alignItems: 'stretch',
            marginBottom: '32px'
          }} className="vv-nft-club-main-grid">

            {/* LEFT COLUMN: ANIMATED NFT CAROUSEL CARD */}
            <div
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                width: '100%'
              }}
            >
              <div style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                border: isSpecialLegend ? '3px solid #ffd700' : '3px solid #00f5ff',
                boxShadow: isSpecialLegend ? '0 0 32px rgba(255, 215, 0, 0.5)' : '0 0 28px rgba(0, 245, 255, 0.4)',
                background: '#020b1a',
                aspectRatio: '1/1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                animation: 'vvCardGlow 4s infinite ease-in-out'
              }}>
                {/* REAL NFT IMAGE */}
                <img
                  key={selectedPreview}
                  src={`/nft/images/${selectedPreview}.png`}
                  onError={(e) => {
                    if (!e.target.src.includes('/nft/ipfs_images/')) {
                      e.target.src = `/nft/ipfs_images/${selectedPreview}.png`;
                    }
                  }}
                  alt={currentCharacterName}
                  className="vv-nft-img-animated"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                {/* TOP LEFT BADGE: RARITY / EDITION */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: isSpecialLegend
                    ? 'linear-gradient(135deg, #ffd700 0%, #ff8800 100%)'
                    : 'rgba(2, 11, 26, 0.85)',
                  border: isSpecialLegend ? '1.5px solid #ffffff' : '1px solid #00f5ff',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontFamily: 'var(--vv-pixel)',
                  fontSize: '8px',
                  color: isSpecialLegend ? '#020b1a' : '#00f5ff',
                  fontWeight: 900,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
                }}>
                  {isSpecialLegend ? '★ ULTRA RARE' : 'GENESIS 1 OF 333'}
                </div>

                {/* TOP RIGHT SHUFFLE BUTTON */}
                <button
                  onClick={handleRandom}
                  title="Random preview"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(2, 11, 26, 0.85)',
                    border: '1px solid #ffd700',
                    color: '#ffd700',
                    padding: '5px 8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '8px',
                    fontFamily: 'var(--vv-pixel)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  🎲 SHUFFLE
                </button>

                {/* LEFT / RIGHT INTERACTIVE ARROWS */}
                <button
                  onClick={handlePrev}
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(2, 11, 26, 0.75)',
                    border: '1.5px solid #00f5ff',
                    color: '#00f5ff',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 900,
                    boxShadow: '0 0 12px rgba(0, 245, 255, 0.4)'
                  }}
                >
                  ◀
                </button>

                <button
                  onClick={handleNext}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(2, 11, 26, 0.75)',
                    border: '1.5px solid #00f5ff',
                    color: '#00f5ff',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 900,
                    boxShadow: '0 0 12px rgba(0, 245, 255, 0.4)'
                  }}
                >
                  ▶
                </button>

                {/* BOTTOM CHARACTER NAME BADGE */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  right: '12px',
                  background: 'rgba(2, 11, 26, 0.9)',
                  border: isSpecialLegend ? '1.5px solid #ffd700' : '1px solid #00f5ff',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontFamily: 'var(--vv-pixel)',
                  fontSize: '9px',
                  color: isSpecialLegend ? '#ffd700' : '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.8)'
                }}>
                  <span style={{ color: isSpecialLegend ? '#ffd700' : '#00f5ff' }}>
                    {currentCharacterName}
                  </span>
                  <span style={{ fontSize: '8px', color: '#88aacc' }}>
                    #{selectedPreview}
                  </span>
                </div>
              </div>

              {/* MINI THUMBNAILS CAROUSEL STRIP */}
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '4px 0'
              }}>
                {featuredIds.slice(0, 7).map((id) => (
                  <div
                    key={id}
                    onClick={() => setSelectedPreview(id)}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: selectedPreview === id ? '2px solid #ffd700' : '1px solid rgba(0, 245, 255, 0.3)',
                      boxShadow: selectedPreview === id ? '0 0 12px #ffd700' : 'none',
                      transform: selectedPreview === id ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                      background: '#020b1a'
                    }}
                  >
                    <img
                      src={`/nft/images/${id}.png`}
                      onError={(e) => { e.target.src = `/nft/ipfs_images/${id}.png`; }}
                      alt={`#${id}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: CONTROLS */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* CARD 1: PRICE ETH & PRICE VIBE + LIMIT */}
                <div style={{
                  background: 'rgba(2, 11, 26, 0.7)',
                  border: '1px solid rgba(0, 245, 255, 0.25)',
                  borderRadius: '12px',
                  padding: '10px 14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '8px', color: '#aaa' }}>PHASE {currentPhase} ETH PRICE</span>
                    <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '9px', color: '#00f5ff' }}>
                      {ethPriceFormatted} ETH
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '8px', color: '#aaa' }}>LIVE $VIBE PRICE</span>
                    <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '9px', color: '#ffd700' }}>
                      {formatVibeComma(currentDynamicVibeAmount)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '8px', color: '#aaa' }}>LIMIT</span>
                    <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '8px', color: '#00ff88' }}>
                      1 NFT PER WALLET
                    </span>
                  </div>
                </div>

                {/* CARD 2: TOTAL MINTED & PROGRESS BAR */}
                <div style={{
                  background: 'rgba(2, 11, 26, 0.7)',
                  border: '1px solid rgba(0, 245, 255, 0.25)',
                  borderRadius: '12px',
                  padding: '10px 14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '8px', color: '#aaa' }}>TOTAL MINTED</span>
                    <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '9px', color: '#00f5ff' }}>
                      {totalMinted} / {maxSupply}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(1, (totalMinted / maxSupply) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #00f5ff, #00ff88)' }} />
                  </div>
                </div>

                {/* CARD 3: TOTAL BURNED */}
                <div style={{
                  background: 'rgba(2, 11, 26, 0.7)',
                  border: '1px solid rgba(255, 68, 102, 0.35)',
                  borderRadius: '12px',
                  padding: '10px 14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '8px', color: '#ff4466', fontWeight: 900 }}>TOTAL BURNED BY MINT</span>
                    <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '9px', color: '#ffffff' }}>
                      {formatVibeComma(totalVibeBurnedByContract)}
                    </span>
                  </div>
                </div>

                {/* USER WALLET BALANCES */}
                <div style={{ padding: '2px 4px' }}>
                  <div style={{ fontSize: '8px', color: '#88aacc', marginBottom: '4px', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>
                    YOUR WALLET BALANCES:
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '8px', color: '#aaa' }}>• ETH BALANCE:</span>
                    <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '9px', color: authenticated ? '#00f5ff' : '#ff4466' }}>
                      {authenticated ? `${Number(balances?.eth || 0).toFixed(4)} ETH` : 'NOT CONNECTED'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '8px', color: '#aaa' }}>• $VIBE BALANCE:</span>
                    <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '9px', color: authenticated ? '#ffd700' : '#ff4466' }}>
                      {authenticated ? formatVibeComma(Math.floor(Number(balances?.vibe || 0))) : 'NOT CONNECTED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* DUAL MINT ACTION BUTTONS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px', paddingTop: '6px' }}>
                {errorMessage && (
                  <div style={{
                    background: 'rgba(255, 68, 102, 0.15)',
                    border: '1px solid #ff4466',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '8px',
                    color: '#ff6688',
                    textAlign: 'center',
                    marginBottom: '4px'
                  }}>
                    ⚠️ {errorMessage}
                  </div>
                )}

                {mintSuccess && (
                  <div style={{
                    background: 'rgba(0, 255, 136, 0.15)',
                    border: '1.5px solid #00ff88',
                    borderRadius: '10px',
                    padding: '12px',
                    fontSize: '9px',
                    color: '#00ff88',
                    textAlign: 'center',
                    marginBottom: '6px',
                    boxShadow: '0 0 16px rgba(0, 255, 136, 0.3)'
                  }}>
                    🎉 MINT SUCCESSFUL! WELCOME TO VIBE CLUB!
                    {txHash && (
                      <div style={{ marginTop: '6px' }}>
                        <a
                          href={`https://basescan.org/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#00f5ff', textDecoration: 'underline', fontSize: '8px' }}
                        >
                          VIEW ON BASESCAN ↗
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {!authenticated ? (
                  /* SINGLE BUTTON WHEN UNAUTHENTICATED */
                  <button
                    onClick={login}
                    style={{
                      width: '100%',
                      height: '46px',
                      fontFamily: 'var(--vv-pixel)',
                      fontSize: '10px',
                      fontWeight: 900,
                      background: 'linear-gradient(135deg, #00f5ff 0%, #0050ff 100%)',
                      border: '2px solid #ffffff',
                      borderRadius: '10px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(0, 245, 255, 0.4)',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <WalletSvgIcon size={14} /> CONNECT WALLET TO MINT
                  </button>
                ) : hasMinted ? (
                  /* ALREADY MINTED */
                  <div style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(0, 255, 136, 0.12)',
                    border: '2px solid #00ff88',
                    borderRadius: '10px',
                    textAlign: 'center',
                    color: '#00ff88',
                    fontSize: '10px',
                    fontWeight: 900,
                    boxShadow: '0 0 16px rgba(0, 255, 136, 0.3)'
                  }}>
                    ✓ YOU HAVE MINTED (1/1 MAX)
                    <div style={{ marginTop: '6px' }}>
                      <a
                        href={`https://opensea.io/assets/base/${NFT_CONTRACT_ADDRESS}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#00f5ff', textDecoration: 'underline', fontSize: '8px' }}
                      >
                        VIEW YOUR NFT ON OPENSEA ↗
                      </a>
                    </div>
                  </div>
                ) : (
                  /* DUAL MINT BUTTONS */
                  <>
                    {/* 1. MINT FOR ETH BUTTON */}
                    <button
                      onClick={mintWithETH}
                      disabled={isMintingEth || isMintingVibe || isApprovingVibe}
                      style={{
                        width: '100%',
                        height: '44px',
                        fontFamily: 'var(--vv-pixel)',
                        fontSize: '10px',
                        fontWeight: 900,
                        background: 'linear-gradient(135deg, #00f5ff 0%, #0050ff 100%)',
                        border: '2px solid #ffffff',
                        borderRadius: '10px',
                        color: '#ffffff',
                        cursor: (isMintingEth || isMintingVibe || isApprovingVibe) ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 16px rgba(0, 245, 255, 0.4)',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        opacity: (isMintingEth || isMintingVibe || isApprovingVibe) ? 0.7 : 1
                      }}
                    >
                      {isMintingEth ? 'MINTING ON BASE...' : `MINT FOR ${ethPriceFormatted} ETH`}
                    </button>

                    {/* ELEGANT "- OR -" DIVIDER */}
                    <div style={{
                      textAlign: 'center',
                      fontSize: '8px',
                      color: '#88aacc',
                      letterSpacing: '1px',
                      margin: '1px 0'
                    }}>
                      — OR —
                    </div>

                    {/* 2. MINT FOR $VIBE BUTTON */}
                    <button
                      onClick={handleMintWithVibeClick}
                      disabled={isMintingEth || isMintingVibe || isApprovingVibe}
                      style={{
                        width: '100%',
                        height: '44px',
                        fontFamily: 'var(--vv-pixel)',
                        fontSize: '10px',
                        fontWeight: 900,
                        background: 'linear-gradient(135deg, #ffd700 0%, #ff6b35 100%)',
                        border: '2px solid #ffffff',
                        borderRadius: '10px',
                        color: '#ffffff',
                        cursor: (isMintingEth || isMintingVibe || isApprovingVibe) ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 16px rgba(255, 215, 0, 0.4)',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        opacity: (isMintingEth || isMintingVibe || isApprovingVibe) ? 0.7 : 1
                      }}
                    >
                      {isApprovingVibe
                        ? 'APPROVING $VIBE...'
                        : isMintingVibe
                        ? 'MINTING WITH $VIBE...'
                        : `MINT FOR ${formatVibeComma(currentDynamicVibeAmount)}`}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: 4 MINT PHASES STACKED VERTICALLY */}
          <div style={{
            borderTop: '1px solid rgba(0, 245, 255, 0.2)',
            paddingTop: '20px'
          }}>
            <div style={{
              fontSize: '9px',
              color: '#88aacc',
              marginBottom: '14px',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap'
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
                  className="vv-nft-phase-row"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    background: p.active ? 'rgba(0, 245, 255, 0.12)' : 'rgba(2, 11, 26, 0.5)',
                    border: p.active ? '1.5px solid #00f5ff' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    boxShadow: p.active ? '0 0 18px rgba(0, 245, 255, 0.25)' : 'none',
                    opacity: p.active ? 1 : 0.65,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* LEFT: PHASE TITLE & PULSE DOT */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {p.active && <span className="vv-pulse-indicator" />}
                    <span className="vv-nft-phase-text" style={{
                      fontFamily: 'var(--vv-pixel)',
                      fontSize: '9px',
                      color: p.active ? '#00ff88' : p.done ? '#ffd700' : '#ffffff',
                      whiteSpace: 'nowrap'
                    }}>
                      {p.phase} ({p.count}) {p.done ? '✓' : ''}
                    </span>
                  </div>

                  {/* RIGHT: COLORED PRICES */}
                  <div className="vv-nft-phase-prices" style={{
                    fontFamily: 'var(--vv-pixel)',
                    fontSize: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginLeft: 'auto',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}>
                    <span style={{ color: '#00f5ff' }}>{p.price}</span>
                    <span className="vv-phase-vibe-part" style={{ color: '#88aacc' }}>/</span>
                    <span className="vv-phase-vibe-part" style={{ color: '#ffd700' }}>{p.vibePrice}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FAQ & VIBE CLUB BENEFITS SECTION ── */}
        <div style={{
          marginTop: '48px',
          textAlign: 'left'
        }}>
          <h2 className="vv-faq-section-title" style={{
            fontFamily: 'var(--vv-pixel)',
            fontSize: '14px',
            color: '#00f5ff',
            textShadow: '0 0 16px rgba(0, 245, 255, 0.4)',
            marginBottom: '24px',
            letterSpacing: '0.6px',
            textAlign: 'center',
            whiteSpace: 'nowrap'
          }}>
            FAQ & CLUB BENEFITS
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* FAQ 1: 80% AUTO-BURN & 20% REWARDS POOL */}
            <div className="vv-faq-card" style={{
              background: 'rgba(4, 20, 48, 0.75)',
              border: '1.5px solid rgba(255, 68, 102, 0.35)',
              borderRadius: '16px',
              padding: '22px 24px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(12px)'
            }}>
              <div className="vv-faq-title" style={{
                fontFamily: 'var(--vv-pixel)',
                fontSize: '11px',
                color: '#ff4466',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '13px' }}>🔥</span> 80% AUTO-BURN & 20% REWARDS POOL
              </div>

              <div className="vv-faq-text" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontFamily: 'var(--vv-pixel)',
                fontSize: '8px',
                color: '#a0b5d0',
                lineHeight: 1.8,
                letterSpacing: '0.3px',
                textTransform: 'uppercase'
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#ff4466', fontSize: '9px' }}>•</span>
                  <span>80% OF ALL NFT MINT REVENUE AUTO BUYS & BURNS $VIBE TOKENS ON CONTRACT LEVEL.</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#00ff88', fontSize: '9px' }}>•</span>
                  <span>THE REMAINING 20% GOES DIRECTLY INTO THE VIBE VERSE REWARDS POOL.</span>
                </div>
              </div>
            </div>

            {/* FAQ 2: VIBE CLUB EXCLUSIVE PERKS */}
            <div className="vv-faq-card" style={{
              background: 'rgba(4, 20, 48, 0.75)',
              border: '1.5px solid rgba(0, 245, 255, 0.35)',
              borderRadius: '16px',
              padding: '22px 24px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(12px)'
            }}>
              <div className="vv-faq-title" style={{
                fontFamily: 'var(--vv-pixel)',
                fontSize: '11px',
                color: '#00f5ff',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '13px' }}>💎</span> VIBE CLUB EXCLUSIVE PERKS
              </div>

              <div className="vv-faq-text" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontFamily: 'var(--vv-pixel)',
                fontSize: '8px',
                color: '#a0b5d0',
                lineHeight: 1.8,
                letterSpacing: '0.3px',
                textTransform: 'uppercase'
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: '#00ff88', fontSize: '9px' }}>•</span>
                  <span>UNLOCKS EXCLUSIVE PERKS IN VIBE VERSE</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: '#ffd700', fontSize: '9px' }}>•</span>
                  <span>LIFETIME $VIBE DIVIDENDS FOR CLUB MEMBERS</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: '#00f5ff', fontSize: '9px' }}>•</span>
                  <span>DAO ACCESS AND MORE COMING SOON</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
