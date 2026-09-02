import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Crown, ArrowUpRight } from 'lucide-react';

function formatCompactBalance(val) {
  if (val === null || val === undefined) return '0 $VIBE';
  const num = Number(val);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M $VIBE`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K $VIBE`;
  }
  return `${num.toLocaleString('en-US', { maximumFractionDigits: 0 })} $VIBE`;
}

export function BaseAppProfileView(props) {
  const {
    address,
    login,
    balance,
    nftCount,
    userNft,
    loading,
    fetchBalances,
    claimedHistory,
    isHolderEligibleLive
  } = props;

  const totalClaimedTokens = (claimedHistory || []).reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0);
  const totalExpiredTokens = 0;
  const hasNft = Boolean(nftCount && nftCount > 0);

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      {/* ── 1. MODERN PROFILE HERO HEADER ── */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          marginBottom: '22px',
          padding: '12px 8px 8px 8px'
        }}
      >
        <h2
          style={{
            fontSize: '18px',
            margin: '0 0 12px 0',
            letterSpacing: '0.6px',
            color: '#ffffff',
            fontFamily: "'Press Start 2P', monospace",
            textAlign: 'center',
            width: '100%',
            lineHeight: 1.3
          }}
        >
          USER <span style={{ color: '#00f5ff' }}>PROFILE</span>
        </h2>

        {/* Subtitle Status Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'rgba(0, 245, 255, 0.08)',
            border: '1.5px solid rgba(0, 245, 255, 0.35)',
            borderRadius: '99px',
            padding: '7px 16px',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88', flexShrink: 0 }} />
          <span style={{ fontSize: '6.5px', color: '#00f5ff', letterSpacing: '0.5px', fontFamily: "'Press Start 2P', monospace", fontWeight: 800, textAlign: 'center', lineHeight: 1.4 }}>
            VIBE VERSE IDENTITY &amp; STATUS
          </span>
        </div>
      </div>

      {/* ── 2. USER PROFILE CARD ── */}
      {!address ? (
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(6, 26, 60, 0.95) 0%, rgba(2, 11, 26, 0.98) 100%)',
            border: '1.5px solid rgba(0, 245, 255, 0.3)',
            borderRadius: '18px',
            padding: '28px 16px',
            textAlign: 'center',
            marginBottom: '24px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)'
          }}
        >
          <div
            style={{
              width: '84px',
              height: '84px',
              margin: '0 auto 16px auto',
              borderRadius: '16px',
              border: '2px solid rgba(0, 245, 255, 0.5)',
              overflow: 'hidden',
              background: '#020b1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 245, 255, 0.35)'
            }}
          >
            <img src="/new-logo-vibe.png" alt="Vibe" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ fontSize: '10px', color: '#ffffff', fontFamily: "'Press Start 2P', monospace", marginBottom: '8px', fontWeight: 900 }}>
            CONNECT YOUR WALLET
          </div>
          <p style={{ fontSize: '7px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace", lineHeight: 1.6, margin: '0 0 18px 0' }}>
            Connect to view your identity, holding balances and Vibe Club status.
          </p>
          <button
            onClick={login}
            style={{
              background: 'linear-gradient(135deg, #00f5ff 0%, #0050ff 100%)',
              border: '2px solid #ffffff',
              color: '#ffffff',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8.5px',
              fontWeight: 900,
              padding: '12px 24px',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 0 18px rgba(0, 245, 255, 0.5)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            CONNECT WALLET ↗
          </button>
        </div>
      ) : (
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(6, 26, 60, 0.95) 0%, rgba(2, 11, 26, 0.98) 100%)',
            border: hasNft ? '1.5px solid #ffd700' : '1.5px solid rgba(0, 245, 255, 0.35)',
            borderRadius: '18px',
            padding: '16px 14px',
            marginBottom: '24px',
            boxShadow: hasNft ? '0 8px 28px rgba(0, 0, 0, 0.7), 0 0 14px rgba(255, 215, 0, 0.25)' : '0 8px 24px rgba(0, 0, 0, 0.7)'
          }}
        >
          {/* Top Profile Section: Equal height 84px */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
            {/* Large 84px Avatar */}
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '16px',
                border: hasNft ? '2.5px solid #ffd700' : '2px solid #64748b',
                overflow: 'hidden',
                background: '#020b1a',
                flexShrink: 0,
                boxShadow: hasNft ? '0 0 18px rgba(255, 215, 0, 0.45)' : '0 0 10px rgba(0, 0, 0, 0.6)'
              }}
            >
              <img
                src={hasNft ? (userNft?.image || '/nft/images/5.png') : '/new-logo-vibe.png'}
                alt="Profile Avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: hasNft ? 'none' : 'grayscale(1) brightness(0.6)'
                }}
              />
            </div>

            {/* Info Column */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '84px',
                minWidth: 0,
                flex: 1,
                boxSizing: 'border-box',
                padding: '1px 0'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div
                  style={{
                    fontSize: '15px',
                    color: '#ffffff',
                    fontFamily: "'Press Start 2P', monospace",
                    fontWeight: 900,
                    margin: 0,
                    lineHeight: 1.2,
                    letterSpacing: '0.2px',
                    wordBreak: 'break-word'
                  }}
                >
                  {hasNft ? (userNft?.name || `Vibe Club #${userNft?.id || 1}`) : 'Unknown Dog'}
                </div>

                {/* Member Status Pill */}
                <div>
                  {hasNft ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(0, 255, 136, 0.15)', border: '1px solid #00ff88', borderRadius: '6px', padding: '3.5px 7px', width: 'fit-content' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 6px #00ff88', flexShrink: 0 }} />
                      <span style={{ fontSize: '6px', color: '#00ff88', fontFamily: "'Press Start 2P', monospace", fontWeight: 800 }}>
                        Vibe Club Member
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255, 68, 102, 0.15)', border: '1px solid #ff4466', borderRadius: '6px', padding: '3.5px 7px', width: 'fit-content' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ff4466', boxShadow: '0 0 6px #ff4466', flexShrink: 0 }} />
                      <span style={{ fontSize: '6px', color: '#ff4466', fontFamily: "'Press Start 2P', monospace", fontWeight: 800 }}>
                        Not a Vibe Club Member
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Wallet Address + Refresh */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                <span style={{ fontSize: '6.5px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace" }}>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <button
                  onClick={() => fetchBalances(true)}
                  disabled={loading}
                  style={{
                    background: 'rgba(0, 245, 255, 0.12)',
                    border: '1px solid rgba(0, 245, 255, 0.35)',
                    color: '#00f5ff',
                    borderRadius: '5px',
                    padding: '3px 6px',
                    fontSize: '5.5px',
                    fontFamily: "'Press Start 2P', monospace",
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <RefreshCw size={8} className={loading ? 'spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Stats Grid (Claimed, Expired, Holding) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '6px',
              background: 'rgba(2, 11, 26, 0.85)',
              border: '1px solid rgba(0, 245, 255, 0.2)',
              borderRadius: '12px',
              padding: '10px 8px'
            }}
          >
            {/* Stat 1: Claimed */}
            <div style={{ textAlign: 'center', borderRight: '1px solid rgba(0, 245, 255, 0.15)', paddingRight: '4px' }}>
              <div style={{ fontSize: '5.5px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace", marginBottom: '4px' }}>
                CLAIMED
              </div>
              <div style={{ fontSize: '7.5px', color: '#00ff88', fontFamily: "'Press Start 2P', monospace", fontWeight: 900 }}>
                {totalClaimedTokens > 0 ? `${totalClaimedTokens.toLocaleString()}` : '0 $VIBE'}
              </div>
            </div>

            {/* Stat 2: Expired */}
            <div style={{ textAlign: 'center', borderRight: '1px solid rgba(0, 245, 255, 0.15)', paddingRight: '4px' }}>
              <div style={{ fontSize: '5.5px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace", marginBottom: '4px' }}>
                EXPIRED
              </div>
              <div style={{ fontSize: '7.5px', color: totalExpiredTokens > 0 ? '#ff4466' : '#88aacc', fontFamily: "'Press Start 2P', monospace", fontWeight: 900 }}>
                {totalExpiredTokens > 0 ? `${totalExpiredTokens.toLocaleString()}` : '0 $VIBE'}
              </div>
            </div>

            {/* Stat 3: Holding Balance */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '5.5px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace", marginBottom: '4px' }}>
                HOLDING
              </div>
              <div style={{ fontSize: '7.5px', color: isHolderEligibleLive ? '#00f5ff' : '#cbd5e1', fontFamily: "'Press Start 2P', monospace", fontWeight: 900 }}>
                {formatCompactBalance(balance)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. NFT CLUB STATUS CARD ── */}
      <div
        style={{
          background: 'rgba(4, 20, 48, 0.85)',
          border: '1.5px solid rgba(0, 245, 255, 0.25)',
          borderRadius: '16px',
          padding: '16px 14px',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crown size={16} color="#ffd700" />
            <span style={{ fontSize: '8.5px', color: '#ffffff', fontFamily: "'Press Start 2P', monospace", fontWeight: 900 }}>
              VIBE CLUB NFT
            </span>
          </div>
          <span style={{ fontSize: '7px', color: hasNft ? '#00ff88' : '#88aacc', fontFamily: "'Press Start 2P', monospace", fontWeight: 800 }}>
            {hasNft ? `${nftCount} OWNED` : '0 OWNED'}
          </span>
        </div>

        <p style={{ fontSize: '6.5px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace", lineHeight: 1.5, margin: '0 0 14px 0' }}>
          {hasNft
            ? 'You are an official Vibe Club Member! You receive 20% secondary royalties distributed every 10 days.'
            : 'Join the 333 Genesis Vibe Club to become eligible for automatic royalties and club perks.'}
        </p>

        {!hasNft && (
          <Link
            to="/app/vibeclub"
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '7.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              textDecoration: 'none',
              background: 'rgba(0, 245, 255, 0.12)',
              border: '1.5px solid #00f5ff',
              color: '#00f5ff',
              borderRadius: '8px',
              fontFamily: "'Press Start 2P', monospace",
              fontWeight: 900,
              boxSizing: 'border-box'
            }}
          >
            <span>MINT VIBE CLUB NFT</span>
            <ArrowUpRight size={12} color="#00f5ff" />
          </Link>
        )}
      </div>

      {/* ── 4. QUICK LINKS / ACTIONS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <Link
          to="/app/hub"
          style={{
            padding: '12px 10px',
            background: 'rgba(2, 11, 26, 0.8)',
            border: '1px solid rgba(0, 245, 255, 0.3)',
            borderRadius: '10px',
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <span style={{ fontSize: '7.5px', color: '#00f5ff', fontFamily: "'Press Start 2P', monospace", fontWeight: 900 }}>
            REWARDS HUB ↗
          </span>
          <span style={{ fontSize: '5.5px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace" }}>
            Track active unlocks &amp; royalties
          </span>
        </Link>

        <Link
          to="/app/claim"
          style={{
            padding: '12px 10px',
            background: 'rgba(2, 11, 26, 0.8)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: '10px',
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <span style={{ fontSize: '7.5px', color: '#00ff88', fontFamily: "'Press Start 2P', monospace", fontWeight: 900 }}>
            CLAIM PORTAL ↗
          </span>
          <span style={{ fontSize: '5.5px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace" }}>
            Claim your unlocked tokens
          </span>
        </Link>
      </div>
    </div>
  );
}
