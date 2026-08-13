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
  const currentPhase = 'Phase 1 — Whitelist & Public';

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

  const sampleNfts = [1, 2, 3, 4, 5, 6, 7, 8, 9];

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
          margin: '0 auto 36px auto',
          lineHeight: 1.8,
          letterSpacing: '0.4px'
        }}>
          Vibe Club is the early dogs who proved their loyalty building the vibe culture on B20 and across the Base Ecosystem. Joining Vibe Club unlocks exclusive perks in VibeVerse and a lifetime passive weekly income.
        </p>

        {/* ── MAIN MINT CONTAINER ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.1fr',
          gap: '32px',
          background: 'rgba(4, 20, 48, 0.85)',
          border: '2px solid #00f5ff',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 245, 255, 0.25)',
          backdropFilter: 'blur(16px)',
          textAlign: 'left'
        }} className="vv-nft-club-main-grid">

          {/* LEFT COLUMN: NFT PREVIEW & THUMBNAILS */}
          <div>
            <div style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '3px solid #ffd700',
              boxShadow: '0 0 28px rgba(255, 215, 0, 0.4)',
              marginBottom: '16px',
              background: '#020b1a',
              aspectRatio: '1/1'
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

            {/* Gallery Thumbnails */}
            <div style={{ fontSize: '8px', color: '#88aacc', marginBottom: '8px', letterSpacing: '0.4px' }}>
              PREVIEW COLLECTION:
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px'
            }}>
              {sampleNfts.map((num) => (
                <div
                  key={num}
                  onClick={() => setSelectedPreview(num)}
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: selectedPreview === num ? '2px solid #00f5ff' : '1px solid rgba(255, 255, 255, 0.15)',
                    cursor: 'pointer',
                    opacity: selectedPreview === num ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                    aspectRatio: '1/1'
                  }}
                >
                  <img
                    src={`/nft/images/${num}.png`}
                    onError={(e) => { e.target.src = '/vibe-dog.jpg'; }}
                    alt={`NFT #${num}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: MINT DETAILS & ACTION BUTTON */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Phase Badge */}
              <div style={{
                display: 'inline-block',
                background: 'rgba(0, 255, 136, 0.15)',
                border: '1.5px solid #00ff88',
                color: '#00ff88',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '8px',
                marginBottom: '20px',
                letterSpacing: '0.5px'
              }}>
                ● {currentPhase}
              </div>

              {/* Price & Supply Box */}
              <div style={{
                background: 'rgba(2, 11, 26, 0.6)',
                border: '1px solid rgba(0, 245, 255, 0.25)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '9px', color: '#aaa' }}>PRICE</span>
                  <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '11px', color: '#ffd700' }}>{pricePerNft}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '9px', color: '#aaa' }}>TOTAL MINTED</span>
                  <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '10px', color: '#00f5ff' }}>{totalMinted} / {maxSupply}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '9px', color: '#aaa' }}>LIMIT</span>
                  <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '9px', color: '#00ff88' }}>1 NFT PER WALLET</span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(totalMinted / maxSupply) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #00f5ff, #00ff88)' }} />
                </div>
              </div>
            </div>

            {/* Mint Action Button */}
            <button
              onClick={handleMint}
              disabled={isMinting}
              style={{
                width: '100%',
                height: '56px',
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

        {/* ── HOLDER UTILITY CARDS ── */}
        <div style={{
          marginTop: '40px',
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
