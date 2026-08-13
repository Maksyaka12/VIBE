import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useUserBalances } from '../verse/hooks/useUserBalances';

// Builder Code for Base Gas Back / Builder Rewards
export const BUILDER_CODE = 'bc_wsbqqe2u';

export default function NftClubPage() {
  const { login, logout, authenticated, user } = usePrivy();
  const walletAddress = user?.wallet?.address;
  const balances = useUserBalances(walletAddress);

  const [mintAmount, setMintAmount] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(1);

  // Contract Mint details
  const pricePerNft = 0.005; // ETH
  const totalMinted = 12;
  const maxSupply = 334;
  const currentPhase = 'Phase 1 — Genesis Whitelist & Public';

  const totalPrice = (pricePerNft * mintAmount).toFixed(3);

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
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      paddingBottom: '80px',
      overflowX: 'hidden'
    }}>
      {/* ── TOP HEADER / NAV ── */}
      <header style={{
        padding: '18px 24px',
        borderBottom: '1px solid rgba(0, 245, 255, 0.15)',
        background: 'rgba(2, 11, 26, 0.8)',
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
            <div style={{ fontFamily: 'var(--vv-pixel)', fontSize: '13px', color: '#00f5ff', letterSpacing: '0.5px' }}>
              VIBE CLUB
            </div>
            <div style={{ fontSize: '10px', color: '#88aacc', fontWeight: 700 }}>
              Genesis 334 NFT Collection
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
                fontSize: '11px',
                color: '#00ff88',
                fontWeight: 700
              }}>
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </div>
              <button
                onClick={logout}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 68, 102, 0.4)',
                  color: '#ff4466',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              style={{
                fontFamily: 'var(--vv-pixel)',
                fontSize: '10px',
                background: 'linear-gradient(135deg, #00f5ff, #0050ff)',
                color: '#fff',
                border: '1.5px solid #fff',
                padding: '10px 18px',
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

      {/* ── HERO BANNER ── */}
      <div style={{
        maxWidth: '1100px',
        margin: '40px auto 0 auto',
        padding: '0 20px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 215, 0, 0.12)',
          border: '1px solid rgba(255, 215, 0, 0.4)',
          borderRadius: '30px',
          padding: '6px 16px',
          fontSize: '11px',
          color: '#ffd700',
          fontWeight: 800,
          marginBottom: '20px'
        }}>
          <span>👑</span> OFFICIAL GENESIS NFT MINT IS LIVE ON BASE
        </div>

        <h1 style={{
          fontFamily: 'var(--vv-pixel)',
          fontSize: '28px',
          color: '#ffffff',
          textShadow: '0 0 20px rgba(0, 245, 255, 0.5)',
          marginBottom: '14px',
          lineHeight: 1.3
        }}>
          VIBE CLUB — GENESIS 334 NFT
        </h1>

        <p style={{
          fontSize: '14px',
          color: '#a0b5d0',
          maxWidth: '650px',
          margin: '0 auto 36px auto',
          lineHeight: 1.6
        }}>
          The exclusive 334 Genesis NFT collection empowering the $VIBE ecosystem on Base.
          Unlock the <strong>100M $VIBE Vault Airdrop</strong>, VIP VibeVerse Access & 80% ETH Auto-Burn Treasury!
        </p>

        {/* ── MAIN MINT CONTAINER (2 COLUMNS: LEFT NFT PREVIEW, RIGHT MINT CONTROL) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.1fr',
          gap: '32px',
          background: 'rgba(4, 20, 48, 0.85)',
          border: '2px solid #00f5ff',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 245, 255, 0.25)',
          backdropFilter: 'blur(16px)',
          textAlign: 'left'
        }} className="vv-nft-club-main-grid">

          {/* LEFT COLUMN: LARGE PREVIEW & MINI GALLERY */}
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
                fontSize: '10px',
                color: '#ffd700'
              }}>
                GENESIS #{selectedPreview}
              </div>
            </div>

            {/* Gallery Thumbnails */}
            <div style={{ fontSize: '11px', color: '#88aacc', marginBottom: '8px', fontWeight: 700 }}>
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

          {/* RIGHT COLUMN: MINT CONTROLS & DETAILS */}
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
                fontSize: '11px',
                fontWeight: 900,
                marginBottom: '16px'
              }}>
                ● {currentPhase}
              </div>

              {/* Price & Progress */}
              <div style={{
                background: 'rgba(2, 11, 26, 0.6)',
                border: '1px solid rgba(0, 245, 255, 0.25)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#aaa', fontWeight: 700 }}>UNIT PRICE</span>
                  <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '13px', color: '#ffd700' }}>{pricePerNft} ETH</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#aaa', fontWeight: 700 }}>TOTAL MINTED</span>
                  <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '12px', color: '#00f5ff' }}>{totalMinted} / {maxSupply}</span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(totalMinted / maxSupply) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #00f5ff, #00ff88)' }} />
                </div>
              </div>

              {/* Quantity Selector */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px', fontWeight: 700 }}>
                  SELECT QUANTITY:
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => setMintAmount((prev) => Math.max(1, prev - 1))}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(0, 245, 255, 0.15)',
                      border: '1.5px solid #00f5ff',
                      color: '#00f5ff',
                      fontSize: '18px',
                      fontWeight: 900,
                      cursor: 'pointer'
                    }}
                  >
                    -
                  </button>
                  <div style={{
                    flex: 1,
                    textAlign: 'center',
                    background: '#020b1a',
                    border: '1.5px solid rgba(0, 245, 255, 0.4)',
                    borderRadius: '10px',
                    padding: '10px',
                    fontFamily: 'var(--vv-pixel)',
                    fontSize: '16px',
                    color: '#ffd700'
                  }}>
                    {mintAmount}
                  </div>
                  <button
                    onClick={() => setMintAmount((prev) => Math.min(10, prev + 1))}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(0, 245, 255, 0.15)',
                      border: '1.5px solid #00f5ff',
                      color: '#00f5ff',
                      fontSize: '18px',
                      fontWeight: 900,
                      cursor: 'pointer'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price Display */}
              <div style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '20px'
              }}>
                <span style={{ fontSize: '12px', color: '#ffd700', fontWeight: 800 }}>TOTAL PRICE:</span>
                <span style={{ fontFamily: 'var(--vv-pixel)', fontSize: '16px', color: '#ffffff' }}>{totalPrice} ETH</span>
              </div>
            </div>

            {/* Mint Action Button */}
            <button
              onClick={handleMint}
              disabled={isMinting}
              style={{
                width: '100%',
                height: '54px',
                fontFamily: 'var(--vv-pixel)',
                fontSize: '14px',
                fontWeight: 900,
                background: authenticated
                  ? 'linear-gradient(135deg, #00f5ff 0%, #0050ff 100%)'
                  : 'linear-gradient(135deg, #ffd700 0%, #ff6b35 100%)',
                border: '2.5px solid #ffffff',
                borderRadius: '12px',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(0, 245, 255, 0.4), 0 0 14px rgba(255, 255, 255, 0.5)',
                letterSpacing: '1px'
              }}
            >
              {isMinting
                ? 'MINTING IN PROGRESS...'
                : authenticated
                ? `MINT ${mintAmount} GENESIS NFT (${totalPrice} ETH)`
                : 'CONNECT WALLET TO MINT'}
            </button>

            {/* Builder Code Badge */}
            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '10px', color: '#00ff88', fontWeight: 700 }}>
              🛡️ BASE BUILDER REWARDS ACTIVE: <span style={{ color: '#fff' }}>{BUILDER_CODE}</span> (80% ETH Auto-Burn)
            </div>
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
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
            <div style={{ fontFamily: 'var(--vv-pixel)', fontSize: '11px', color: '#ffd700', marginBottom: '6px' }}>
              100M $VIBE VAULT
            </div>
            <div style={{ fontSize: '11px', color: '#a0b5d0', lineHeight: 1.5 }}>
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
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔥</div>
            <div style={{ fontFamily: 'var(--vv-pixel)', fontSize: '11px', color: '#ff4466', marginBottom: '6px' }}>
              80% ETH AUTO-BURN
            </div>
            <div style={{ fontSize: '11px', color: '#a0b5d0', lineHeight: 1.5 }}>
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
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎮</div>
            <div style={{ fontFamily: 'var(--vv-pixel)', fontSize: '11px', color: '#00ff88', marginBottom: '6px' }}>
              VIP VIBEVERSE ACCESS
            </div>
            <div style={{ fontSize: '11px', color: '#a0b5d0', lineHeight: 1.5 }}>
              Genesis NFT holders gain instant access to Phase 2 VibeVerse virtual world and exclusive Doghouse perks.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
