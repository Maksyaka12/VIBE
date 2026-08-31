import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  Crown,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ArrowUpRight,
  ExternalLink,
  Share2,
  Search,
  ChevronDown,
  ShieldCheck,
  Lock,
  Sparkles,
  Flame,
  Download
} from 'lucide-react';

const O1 = 'https://launch.o1.exchange/token/0xb200000000000000000000df24ecb8bf51100a01?chain=8453';
const VIBECLUB_MINT_URL = 'https://vibeverse.dog/vibeclub';

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

function formatCountdownLive(targetIso) {
  if (!targetIso) return '';
  try {
    const now = new Date().getTime();
    const target = new Date(targetIso).getTime();
    const diff = target - now;

    if (diff <= 0) return '00H 00M 00S';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const pad = (n) => String(n).padStart(2, '0');

    if (days > 0) {
      return `${days}D ${pad(hours)}H ${pad(minutes)}M ${pad(seconds)}S`;
    }
    return `${pad(hours)}H ${pad(minutes)}M ${pad(seconds)}S`;
  } catch {
    return '';
  }
}

export function BaseAppClaimView(props) {
  const {
    address,
    ready,
    authenticated,
    login,
    logout,
    balance,
    nftCount,
    userNft,
    loading,
    copied,
    copyAddress,
    fetchBalances,
    currentTime,
    claimStatus,
    claimedHistory,
    handleClaim,
    isHolderEligibleLive,
    holderRewardAmount,
    hasConfirmedHolderClaim,
    isHolderRound1Available,
    isHolderRound1Claimed,
    isVibeClubEligible,
    vibeClubRewardAmount,
    hasConfirmedRoyaltyClaim,
    isVibeClubRoyalty1Available,
    isVibeClubRoyalty1Claimed,
    totalAvailableCount,
    upcomingHolderRound,
    upcomingVibeClubRound,
    HOLDER_ROUNDS,
    VIBECLUB_ROUNDS,
    round1Data,
    royalty1Data,
    isAdmin,
    adminMetrics,
    adminDistributorType,
    setAdminDistributorType,
    adminCustomRoyaltyCa,
    setAdminCustomRoyaltyCa,
    adminEpochId,
    setAdminEpochId,
    adminMerkleRoot,
    setAdminMerkleRoot,
    adminWithdrawAmount,
    setAdminWithdrawAmount,
    adminBurnAmount,
    setAdminBurnAmount,
    adminLoading,
    adminTxHash,
    adminError,
    adminSuccess,
    handleSetMerkleRoot,
    handleWithdrawTokens,
    handleBurnTokens,
    fetchAdminMetrics
  } = props;

  // Local state for Lookup
  const [lookupAddress, setLookupAddress] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupSearching, setLookupSearching] = useState(false);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const handleSearchLookup = () => {
    if (!lookupAddress || !lookupAddress.trim()) return;
    setLookupSearching(true);
    const cleanAddr = lookupAddress.trim().toLowerCase();

    setTimeout(() => {
      const hProof = round1Data?.claims?.[cleanAddr];
      const rProof = royalty1Data?.claims?.[cleanAddr];

      setLookupResult({
        address: cleanAddr,
        holderAmount: hProof ? (hProof.amount || 0) : 0,
        isHolderEligible: !!hProof,
        royaltyAmount: rProof ? (rProof.amount || 0) : 0,
        isRoyaltyEligible: !!rProof
      });
      setLookupSearching(false);
    }, 250);
  };

  const getShareUrl = (type, amount) => {
    const text = type === 'vibeclub'
      ? `I just claimed ${amount?.toLocaleString() || 'my'} $VIBE royalties from Vibe Club on @VIBEDOG_BASE! 👑🐶 Holding my NFT and sharing 20% royalties every 10 days.`
      : `I just claimed ${amount?.toLocaleString() || 'my'} $VIBE Holder Rewards on @VIBEDOG_BASE! 💎🐶 100M tokens distributed to 5M+ holders. Check eligibility:`;
    const url = 'https://vibe.dog/claim';
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      {/* ── 1. MODERN HERO HEADER ── */}
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
            textShadow: 'none',
            textAlign: 'center',
            width: '100%',
            lineHeight: 1.3
          }}
        >
          CLAIM <span style={{ color: '#00f5ff' }}>PORTAL</span>
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
            PERSONAL REWARDS &amp; CLAIM STATION
          </span>
        </div>
      </div>

      {/* ── 2. USER STATION / WALLET PROFILE CARD ── */}
      {!address ? (
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(6, 26, 60, 0.95) 0%, rgba(2, 11, 26, 0.98) 100%)',
            border: '1.5px solid rgba(0, 245, 255, 0.3)',
            borderRadius: '18px',
            padding: '24px 16px',
            textAlign: 'center',
            marginBottom: '24px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)'
          }}
        >
          <div style={{ width: '56px', height: '56px', margin: '0 auto 14px auto', borderRadius: '14px', border: '2px solid rgba(0, 245, 255, 0.5)', overflow: 'hidden', background: '#020b1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/new-logo-vibe.png" alt="Vibe" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ fontSize: '10px', color: '#ffffff', fontFamily: "'Press Start 2P', monospace", marginBottom: '8px', fontWeight: 900 }}>
            CONNECT YOUR WALLET
          </div>
          <p style={{ fontSize: '7px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace", lineHeight: 1.6, margin: '0 0 18px 0' }}>
            Connect to check your live eligibility, unlock $VIBE rewards and claim royalties.
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
            border: '1.5px solid rgba(0, 245, 255, 0.35)',
            borderRadius: '18px',
            padding: '16px 14px',
            marginBottom: '24px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)'
          }}
        >
          {/* Top Row: User Avatar, Address & Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Avatar: User NFT or Default Logo */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  border: (nftCount && nftCount > 0) ? '2px solid #ffd700' : '2px solid #00f5ff',
                  overflow: 'hidden',
                  background: '#020b1a',
                  flexShrink: 0,
                  boxShadow: (nftCount && nftCount > 0) ? '0 0 10px rgba(255, 215, 0, 0.4)' : '0 0 10px rgba(0, 245, 255, 0.3)'
                }}
              >
                <img
                  src={userNft?.image || '/new-logo-vibe.png'}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '7.5px', color: '#ffffff', fontFamily: "'Press Start 2P', monospace", fontWeight: 900 }}>
                    {userNft?.name || ((nftCount && nftCount > 0) ? `Vibe Club #${userNft?.id || 1}` : 'Community Member')}
                  </span>
                  {(nftCount && nftCount > 0) && (
                    <span style={{ fontSize: '5.5px', background: 'rgba(255, 215, 0, 0.15)', border: '1px solid #ffd700', color: '#ffd700', borderRadius: '4px', padding: '2px 4px', fontFamily: "'Press Start 2P', monospace", fontWeight: 800 }}>
                      👑 VIP
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '6.5px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace" }}>
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                  <button
                    onClick={copyAddress}
                    style={{
                      background: 'rgba(0, 245, 255, 0.1)',
                      border: '1px solid rgba(0, 245, 255, 0.3)',
                      color: copied ? '#00ff88' : '#00f5ff',
                      borderRadius: '4px',
                      padding: '3px 6px',
                      fontSize: '5.5px',
                      fontFamily: "'Press Start 2P', monospace",
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    {copied ? <Check size={8} /> : <Copy size={8} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Buttons: Refresh & Disconnect */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => fetchBalances(true)}
                disabled={loading}
                style={{
                  background: 'rgba(0, 245, 255, 0.12)',
                  border: '1px solid rgba(0, 245, 255, 0.35)',
                  color: '#00f5ff',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '6px',
                  fontFamily: "'Press Start 2P', monospace",
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RefreshCw size={10} className={loading ? 'spin' : ''} />
                <span>{loading ? '...' : 'Refresh'}</span>
              </button>

              <button
                onClick={logout}
                style={{
                  background: 'rgba(255, 68, 102, 0.12)',
                  border: '1px solid rgba(255, 68, 102, 0.35)',
                  color: '#ff4466',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '6px',
                  fontFamily: "'Press Start 2P', monospace",
                  cursor: 'pointer'
                }}
              >
                Exit
              </button>
            </div>
          </div>

          {/* 2 Live Eligibility Status Cards (Holders & Vibe Club) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '10px' }}>
            {/* Card 1: Holder Eligibility */}
            <div
              style={{
                background: 'rgba(2, 11, 26, 0.75)',
                border: isHolderEligibleLive ? '1.5px solid #00ff88' : '1.5px solid rgba(255, 68, 102, 0.35)',
                borderRadius: '14px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '12px' }}>💎</span>
                  <span style={{ fontSize: '7px', color: '#ffffff', fontFamily: "'Press Start 2P', monospace", fontWeight: 900 }}>
                    HOLDER STATUS
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '6px',
                    fontFamily: "'Press Start 2P', monospace",
                    fontWeight: 800,
                    color: isHolderEligibleLive ? '#00ff88' : '#ff4466',
                    background: isHolderEligibleLive ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 68, 102, 0.15)',
                    border: isHolderEligibleLive ? '1px solid #00ff88' : '1px solid #ff4466',
                    borderRadius: '6px',
                    padding: '3px 6px'
                  }}
                >
                  {isHolderEligibleLive ? '✓ ELIGIBLE' : 'NOT ELIGIBLE'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '6px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace" }}>Balance:</span>
                <span style={{ fontSize: '8px', color: '#00f5ff', fontFamily: "'Press Start 2P', monospace", fontWeight: 800 }}>
                  {formatCompactBalance(balance)}
                </span>
              </div>

              <div style={{ fontSize: '6px', color: isHolderEligibleLive ? '#00ff88' : '#cbd5e1', lineHeight: 1.4, fontFamily: "'Press Start 2P', monospace" }}>
                {isHolderEligibleLive
                  ? '✓ Holding 5M+ $VIBE. Qualified for monthly 10M unlocks!'
                  : 'Requires 5M+ $VIBE at each snapshot to qualify.'}
              </div>

              {!isHolderEligibleLive && (
                <a
                  href={O1}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '6.5px',
                    color: '#ffd700',
                    border: '1px solid #ffd700',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    fontFamily: "'Press Start 2P', monospace",
                    fontWeight: 800,
                    background: 'rgba(255, 215, 0, 0.12)',
                    marginTop: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <span>BUY $VIBE ON O1</span> <ArrowUpRight size={10} />
                </a>
              )}
            </div>

            {/* Card 2: Vibe Club Royalty Eligibility */}
            <div
              style={{
                background: 'rgba(2, 11, 26, 0.75)',
                border: (nftCount && nftCount > 0) ? '1.5px solid #00ff88' : '1.5px solid rgba(255, 68, 102, 0.35)',
                borderRadius: '14px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '12px' }}>👑</span>
                  <span style={{ fontSize: '7px', color: '#ffffff', fontFamily: "'Press Start 2P', monospace", fontWeight: 900 }}>
                    VIBE CLUB ROYALTIES
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '6px',
                    fontFamily: "'Press Start 2P', monospace",
                    fontWeight: 800,
                    color: (nftCount && nftCount > 0) ? '#00ff88' : '#ff4466',
                    background: (nftCount && nftCount > 0) ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 68, 102, 0.15)',
                    border: (nftCount && nftCount > 0) ? '1px solid #00ff88' : '1px solid #ff4466',
                    borderRadius: '6px',
                    padding: '3px 6px'
                  }}
                >
                  {(nftCount && nftCount > 0) ? '✓ ELIGIBLE' : 'NOT ELIGIBLE'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '6px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace" }}>NFTs Owned:</span>
                <span style={{ fontSize: '8px', color: '#ffd700', fontFamily: "'Press Start 2P', monospace", fontWeight: 800 }}>
                  {nftCount || 0} NFT{nftCount === 1 ? '' : 's'}
                </span>
              </div>

              <div style={{ fontSize: '6px', color: (nftCount && nftCount > 0) ? '#00ff88' : '#cbd5e1', lineHeight: 1.4, fontFamily: "'Press Start 2P', monospace" }}>
                {(nftCount && nftCount > 0)
                  ? '✓ Sharing 20% mint royalties pool every 10 days!'
                  : 'Hold Vibe Club NFT at each snapshot to share royalties.'}
              </div>

              {(!nftCount || nftCount === 0) && (
                <Link
                  to="/vibeclub"
                  style={{
                    fontSize: '6.5px',
                    color: '#00f5ff',
                    border: '1px solid #00f5ff',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    fontFamily: "'Press Start 2P', monospace",
                    fontWeight: 800,
                    background: 'rgba(0, 245, 255, 0.12)',
                    marginTop: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <span>MINT VIBE CLUB NFT</span> <ArrowUpRight size={10} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 3. SECTION 1: AVAILABLE TO CLAIM (ACTIONABLE REWARDS) ── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: totalAvailableCount > 0 ? '#00ff88' : '#64748b', boxShadow: totalAvailableCount > 0 ? '0 0 8px #00ff88' : 'none' }} />
          <h3 style={{ fontSize: '10px', color: '#ffffff', fontFamily: "'Press Start 2P', monospace", margin: 0, fontWeight: 900 }}>
            AVAILABLE TO CLAIM ({totalAvailableCount})
          </h3>
        </div>

        {totalAvailableCount === 0 ? (
          <div
            style={{
              background: 'rgba(4, 20, 48, 0.85)',
              border: '1.5px solid rgba(0, 245, 255, 0.2)',
              borderRadius: '16px',
              padding: '18px 14px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '8px', color: '#00ff88', fontFamily: "'Press Start 2P', monospace", marginBottom: '6px', fontWeight: 800 }}>
              ✓ ALL REWARDS UP TO DATE
            </div>
            <p style={{ fontSize: '6.5px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace", lineHeight: 1.5, margin: 0 }}>
              No unclaimed rewards waiting on this wallet. Next upcoming snapshots and rewards are detailed below.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Holder Unlock 1 Claim Card */}
            {isHolderRound1Available && (hasConfirmedHolderClaim || isHolderEligibleLive) && (
              <div
                style={{
                  background: 'linear-gradient(180deg, rgba(6, 26, 60, 0.95) 0%, rgba(2, 11, 26, 0.98) 100%)',
                  border: '1.5px solid #00ff88',
                  borderRadius: '16px',
                  padding: '16px 14px',
                  boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px' }}>💎</span>
                    <span style={{ fontSize: '8.5px', color: '#ffffff', fontFamily: "'Press Start 2P', monospace", fontWeight: 900 }}>
                      HOLDER REWARDS · UNLOCK 1
                    </span>
                  </div>
                  <span style={{ fontSize: '6px', color: '#00ff88', background: 'rgba(0, 255, 136, 0.15)', border: '1px solid #00ff88', borderRadius: '6px', padding: '3px 6px', fontFamily: "'Press Start 2P', monospace", fontWeight: 800 }}>
                    🟢 READY
                  </span>
                </div>

                <div
                  style={{
                    background: 'rgba(2, 11, 26, 0.8)',
                    border: '1px solid rgba(0, 245, 255, 0.25)',
                    borderRadius: '12px',
                    padding: '12px',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{ fontSize: '6px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace", marginBottom: '4px' }}>
                    YOUR UNLOCKED REWARD:
                  </div>
                  <div style={{ fontSize: '13px', color: '#00ff88', fontFamily: "'Press Start 2P', monospace", fontWeight: 900 }}>
                    +{holderRewardAmount.toLocaleString()} $VIBE
                  </div>
                </div>

                <button
                  onClick={() => handleClaim('holder', 1, holderRewardAmount)}
                  disabled={claimStatus['holder-1'] === 'claiming'}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 255, 136, 0.18)',
                    border: '2px solid #00ff88',
                    borderRadius: '12px',
                    padding: '12px',
                    color: '#00ff88',
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '8.5px',
                    fontWeight: 900,
                    cursor: claimStatus['holder-1'] === 'claiming' ? 'not-allowed' : 'pointer',
                    boxShadow: '0 0 16px rgba(0, 255, 136, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ color: '#00ff88' }}>
                    {claimStatus['holder-1'] === 'claiming' ? 'CLAIMING ON BASE...' : 'CLAIM REWARD NOW'}
                  </span>
                  <ArrowUpRight size={14} color="#00ff88" strokeWidth={2.5} />
                </button>
              </div>
            )}

            {/* Vibe Club Royalty 1 Claim Card */}
            {isVibeClubRoyalty1Available && isVibeClubEligible && (
              <div
                style={{
                  background: 'linear-gradient(180deg, rgba(6, 26, 60, 0.95) 0%, rgba(2, 11, 26, 0.98) 100%)',
                  border: '1.5px solid #00ff88',
                  borderRadius: '16px',
                  padding: '16px 14px',
                  boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px' }}>👑</span>
                    <span style={{ fontSize: '8.5px', color: '#ffffff', fontFamily: "'Press Start 2P', monospace", fontWeight: 900 }}>
                      VIBE CLUB · ROYALTY 1
                    </span>
                  </div>
                  <span style={{ fontSize: '6px', color: '#00ff88', background: 'rgba(0, 255, 136, 0.15)', border: '1px solid #00ff88', borderRadius: '6px', padding: '3px 6px', fontFamily: "'Press Start 2P', monospace", fontWeight: 800 }}>
                    🟢 READY
                  </span>
                </div>

                <div
                  style={{
                    background: 'rgba(2, 11, 26, 0.8)',
                    border: '1px solid rgba(0, 245, 255, 0.25)',
                    borderRadius: '12px',
                    padding: '12px',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{ fontSize: '6px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace", marginBottom: '4px' }}>
                    YOUR ROYALTY PAYOUT:
                  </div>
                  <div style={{ fontSize: '13px', color: '#ffd700', fontFamily: "'Press Start 2P', monospace", fontWeight: 900 }}>
                    +{vibeClubRewardAmount.toLocaleString()} $VIBE
                  </div>
                </div>

                <button
                  onClick={() => handleClaim('vibeclub', 1, vibeClubRewardAmount)}
                  disabled={claimStatus['vibeclub-1'] === 'claiming'}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 255, 136, 0.18)',
                    border: '2px solid #00ff88',
                    borderRadius: '12px',
                    padding: '12px',
                    color: '#00ff88',
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '8.5px',
                    fontWeight: 900,
                    cursor: claimStatus['vibeclub-1'] === 'claiming' ? 'not-allowed' : 'pointer',
                    boxShadow: '0 0 16px rgba(0, 255, 136, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ color: '#00ff88' }}>
                    {claimStatus['vibeclub-1'] === 'claiming' ? 'CLAIMING ON BASE...' : 'CLAIM ROYALTIES NOW'}
                  </span>
                  <ArrowUpRight size={14} color="#00ff88" strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 4. SECTION 2: UPCOMING SNAPSHOTS & QUALIFICATION ── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffd700', boxShadow: '0 0 8px #ffd700' }} />
          <h3 style={{ fontSize: '10px', color: '#ffffff', fontFamily: "'Press Start 2P', monospace", margin: 0, fontWeight: 900 }}>
            UPCOMING REWARDS STATUS
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Upcoming Holder Unlock 2 */}
          <div
            style={{
              background: 'rgba(4, 20, 48, 0.88)',
              border: '1.5px solid rgba(0, 245, 255, 0.25)',
              borderRadius: '16px',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px' }}>💎</span>
                <span style={{ fontSize: '8px', color: '#ffffff', fontFamily: "'Press Start 2P', monospace", fontWeight: 900 }}>
                  {upcomingHolderRound?.name || 'Unlock 2'} (10,000,000 $VIBE)
                </span>
              </div>
              <span style={{ fontSize: '6px', color: '#ffd700', fontFamily: "'Press Start 2P', monospace", fontWeight: 800 }}>
                {upcomingHolderRound?.snapshotDate || 'Sep 25, 00:00 UTC'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2, 11, 26, 0.75)', border: '1px solid rgba(0, 245, 255, 0.15)', borderRadius: '10px', padding: '8px 10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '6px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace" }}>
                SNAPSHOT COUNTDOWN:
              </span>
              <span style={{ fontSize: '6.5px', color: '#ffd700', fontFamily: "'Press Start 2P', monospace", fontWeight: 800 }}>
                {formatCountdownLive(upcomingHolderRound?.snapshotIso)}
              </span>
            </div>

            <div style={{ fontSize: '6px', color: isHolderEligibleLive ? '#00ff88' : '#cbd5e1', lineHeight: 1.4, fontFamily: "'Press Start 2P', monospace" }}>
              {isHolderEligibleLive
                ? `✓ You are holding ${formatCompactBalance(balance)}. Qualified for this snapshot!`
                : 'Action required: Hold 5M+ $VIBE before snapshot to share the 10,000,000 $VIBE pool.'}
            </div>
          </div>

          {/* Upcoming Vibe Club Royalty 2 */}
          <div
            style={{
              background: 'rgba(4, 20, 48, 0.88)',
              border: '1.5px solid rgba(0, 245, 255, 0.25)',
              borderRadius: '16px',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px' }}>👑</span>
                <span style={{ fontSize: '8px', color: '#ffffff', fontFamily: "'Press Start 2P', monospace", fontWeight: 900 }}>
                  {upcomingVibeClubRound?.name || 'Royalty 2'} (20% Royalty Pool)
                </span>
              </div>
              <span style={{ fontSize: '6px', color: '#ffd700', fontFamily: "'Press Start 2P', monospace", fontWeight: 800 }}>
                {upcomingVibeClubRound?.snapshotDate || 'Sep 7, 00:00 UTC'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2, 11, 26, 0.75)', border: '1px solid rgba(0, 245, 255, 0.15)', borderRadius: '10px', padding: '8px 10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '6px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace" }}>
                SNAPSHOT COUNTDOWN:
              </span>
              <span style={{ fontSize: '6.5px', color: '#ffd700', fontFamily: "'Press Start 2P', monospace", fontWeight: 800 }}>
                {formatCountdownLive(upcomingVibeClubRound?.snapshotIso)}
              </span>
            </div>

            <div style={{ fontSize: '6px', color: (nftCount && nftCount > 0) ? '#00ff88' : '#cbd5e1', lineHeight: 1.4, fontFamily: "'Press Start 2P', monospace" }}>
              {(nftCount && nftCount > 0)
                ? `✓ You hold ${nftCount} NFT${nftCount === 1 ? '' : 's'}. Qualified to receive royalties at this snapshot!`
                : 'Action required: Hold Vibe Club NFT before snapshot to share the 20% royalty pool.'}
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. SECTION 3: CLAIM HISTORY & SHARE ON X ── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f5ff', boxShadow: '0 0 8px #00f5ff' }} />
          <h3 style={{ fontSize: '10px', color: '#ffffff', fontFamily: "'Press Start 2P', monospace", margin: 0, fontWeight: 900 }}>
            CLAIM HISTORY ({claimedHistory?.length || 0})
          </h3>
        </div>

        {(!claimedHistory || claimedHistory.length === 0) ? (
          <div
            style={{
              background: 'rgba(4, 20, 48, 0.75)',
              border: '1.5px solid rgba(0, 245, 255, 0.2)',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: '6.5px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace", margin: 0 }}>
              No claims made on this wallet yet.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {claimedHistory.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  background: 'rgba(4, 20, 48, 0.88)',
                  border: '1.5px solid rgba(0, 255, 136, 0.35)',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}
              >
                <div>
                  <div style={{ fontSize: '7.5px', color: '#ffffff', fontFamily: "'Press Start 2P', monospace", fontWeight: 900, marginBottom: '4px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '8px', color: '#00ff88', fontFamily: "'Press Start 2P', monospace", fontWeight: 800, marginBottom: '4px' }}>
                    +{Number(item.amount || 0).toLocaleString()} $VIBE
                  </div>
                  <div style={{ fontSize: '5.5px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace" }}>
                    {new Date(item.timestamp || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {/* Share on X button */}
                  <a
                    href={getShareUrl(item.type, item.amount)}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '6px',
                      fontFamily: "'Press Start 2P', monospace",
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Share2 size={10} />
                    <span>Share on 𝕏</span>
                  </a>

                  {/* BaseScan Tx Link */}
                  {item.txHash && (
                    <a
                      href={`https://basescan.org/tx/${item.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: 'rgba(0, 245, 255, 0.1)',
                        border: '1px solid rgba(0, 245, 255, 0.35)',
                        color: '#00f5ff',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        fontSize: '6px',
                        fontFamily: "'Press Start 2P', monospace",
                        fontWeight: 800,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>BaseScan</span>
                      <ArrowUpRight size={10} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 6. SECTION 4: WALLET LOOKUP (CHECK ANY ADDRESS) ── */}
      <div style={{ marginBottom: '28px' }}>
        <button
          onClick={() => setIsLookupOpen(!isLookupOpen)}
          style={{
            width: '100%',
            background: 'rgba(4, 20, 48, 0.85)',
            border: '1.5px solid rgba(0, 245, 255, 0.25)',
            borderRadius: '14px',
            padding: '12px 14px',
            color: '#00f5ff',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '7.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={12} color="#00f5ff" />
            <span>CHECK OTHER WALLET ELIGIBILITY</span>
          </div>
          <ChevronDown size={14} style={{ transform: isLookupOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {isLookupOpen && (
          <div
            style={{
              background: 'rgba(2, 11, 26, 0.9)',
              border: '1px solid rgba(0, 245, 255, 0.25)',
              borderRadius: '14px',
              padding: '14px',
              marginTop: '8px'
            }}
          >
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Enter 0x... address"
                value={lookupAddress}
                onChange={e => setLookupAddress(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchLookup()}
                style={{
                  flex: 1,
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(0, 245, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: '#ffffff',
                  fontSize: '7px',
                  fontFamily: "'Press Start 2P', monospace",
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSearchLookup}
                disabled={lookupSearching}
                style={{
                  background: 'linear-gradient(135deg, #00f5ff 0%, #0050ff 100%)',
                  border: '1px solid #ffffff',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  color: '#ffffff',
                  fontSize: '7px',
                  fontFamily: "'Press Start 2P', monospace",
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                {lookupSearching ? '...' : 'Search'}
              </button>
            </div>

            {lookupResult && (
              <div style={{ background: 'rgba(4, 20, 48, 0.95)', border: '1px solid rgba(0, 245, 255, 0.2)', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontSize: '6px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace", marginBottom: '8px', wordBreak: 'break-all' }}>
                  Address: {lookupResult.address}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: '8px', padding: '8px' }}>
                    <div style={{ fontSize: '5.5px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace", marginBottom: '3px' }}>
                      Unlock 1 Allocation:
                    </div>
                    <div style={{ fontSize: '7.5px', color: lookupResult.isHolderEligible ? '#00ff88' : '#ff4466', fontFamily: "'Press Start 2P', monospace", fontWeight: 800 }}>
                      {lookupResult.isHolderEligible ? `+${lookupResult.holderAmount.toLocaleString()} $VIBE` : 'Not In Snapshot'}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: '8px', padding: '8px' }}>
                    <div style={{ fontSize: '5.5px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace", marginBottom: '3px' }}>
                      Royalty 1 Allocation:
                    </div>
                    <div style={{ fontSize: '7.5px', color: lookupResult.isRoyaltyEligible ? '#ffd700' : '#ff4466', fontFamily: "'Press Start 2P', monospace", fontWeight: 800 }}>
                      {lookupResult.isRoyaltyEligible ? `+${lookupResult.royaltyAmount.toLocaleString()} $VIBE` : 'Not In Snapshot'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 7. ADMIN TOOLS (IF ADMIN WALLET CONNECTED) ── */}
      {isAdmin && (
        <div style={{ marginBottom: '28px' }}>
          <button
            onClick={() => setIsAdminOpen(!isAdminOpen)}
            style={{
              width: '100%',
              background: 'rgba(255, 68, 102, 0.12)',
              border: '1.5px solid #ff4466',
              borderRadius: '14px',
              padding: '12px 14px',
              color: '#ff4466',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7.5px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#ff4466" />
              <span>ADMIN CONTRACT CONTROLS</span>
            </div>
            <ChevronDown size={14} style={{ transform: isAdminOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {isAdminOpen && (
            <div
              style={{
                background: 'rgba(2, 11, 26, 0.95)',
                border: '1.5px solid #ff4466',
                borderRadius: '14px',
                padding: '16px 14px',
                marginTop: '8px'
              }}
            >
              {/* Type Switcher */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <button
                  onClick={() => {
                    setAdminDistributorType('holder');
                    fetchAdminMetrics('holder', adminEpochId, null);
                  }}
                  style={{
                    flex: 1,
                    background: adminDistributorType === 'holder' ? '#0052ff' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(0, 245, 255, 0.3)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '6.5px',
                    fontFamily: "'Press Start 2P', monospace",
                    cursor: 'pointer'
                  }}
                >
                  Holders Distributor
                </button>
                <button
                  onClick={() => {
                    setAdminDistributorType('royalty');
                    fetchAdminMetrics('royalty', adminEpochId, adminCustomRoyaltyCa);
                  }}
                  style={{
                    flex: 1,
                    background: adminDistributorType === 'royalty' ? '#ffd700' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    color: adminDistributorType === 'royalty' ? '#000000' : '#ffffff',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '6.5px',
                    fontFamily: "'Press Start 2P', monospace",
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Royalty Distributor
                </button>
              </div>

              {/* Admin Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(0, 0, 0, 0.5)', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ fontSize: '5.5px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace", marginBottom: '3px' }}>Contract Balance:</div>
                  <div style={{ fontSize: '7.5px', color: '#00f5ff', fontFamily: "'Press Start 2P', monospace", fontWeight: 800 }}>
                    {(adminMetrics?.contractBalance || 0).toLocaleString()} $VIBE
                  </div>
                </div>
                <div style={{ background: 'rgba(0, 0, 0, 0.5)', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ fontSize: '5.5px', color: '#88aacc', fontFamily: "'Press Start 2P', monospace", marginBottom: '3px' }}>Claimed Wallets:</div>
                  <div style={{ fontSize: '7.5px', color: '#00ff88', fontFamily: "'Press Start 2P', monospace", fontWeight: 800 }}>
                    {adminMetrics?.claimedWalletsCount || 0} / {adminMetrics?.totalWalletsCount || 0}
                  </div>
                </div>
              </div>

              {/* Merkle Root Update */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '6px', color: '#ffffff', fontFamily: "'Press Start 2P', monospace", marginBottom: '4px' }}>
                  Set Merkle Root (Epoch {adminEpochId}):
                </div>
                <input
                  type="text"
                  value={adminMerkleRoot}
                  onChange={e => setAdminMerkleRoot(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(0, 245, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: '#ffffff',
                    fontSize: '6px',
                    fontFamily: "'Press Start 2P', monospace",
                    boxSizing: 'border-box',
                    marginBottom: '6px'
                  }}
                />
                <button
                  onClick={handleSetMerkleRoot}
                  disabled={adminLoading}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #00f5ff 0%, #0050ff 100%)',
                    border: '1px solid #ffffff',
                    borderRadius: '8px',
                    padding: '8px',
                    color: '#ffffff',
                    fontSize: '6.5px',
                    fontFamily: "'Press Start 2P', monospace",
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                >
                  {adminLoading ? 'Processing...' : 'UPDATE MERKLE ROOT'}
                </button>
              </div>

              {/* Emergency Withdraw & Burn */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <input
                    type="number"
                    placeholder="Amount to withdraw"
                    value={adminWithdrawAmount}
                    onChange={e => setAdminWithdrawAmount(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(0, 245, 255, 0.3)',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#ffffff',
                      fontSize: '6px',
                      fontFamily: "'Press Start 2P', monospace",
                      boxSizing: 'border-box',
                      marginBottom: '6px'
                    }}
                  />
                  <button
                    onClick={handleWithdrawTokens}
                    disabled={adminLoading}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 245, 255, 0.15)',
                      border: '1px solid #00f5ff',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#00f5ff',
                      fontSize: '6px',
                      fontFamily: "'Press Start 2P', monospace",
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Withdraw
                  </button>
                </div>

                <div>
                  <input
                    type="number"
                    placeholder="Amount to burn"
                    value={adminBurnAmount}
                    onChange={e => setAdminBurnAmount(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(255, 68, 102, 0.3)',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#ffffff',
                      fontSize: '6px',
                      fontFamily: "'Press Start 2P', monospace",
                      boxSizing: 'border-box',
                      marginBottom: '6px'
                    }}
                  />
                  <button
                    onClick={handleBurnTokens}
                    disabled={adminLoading}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 68, 102, 0.15)',
                      border: '1px solid #ff4466',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#ff4466',
                      fontSize: '6px',
                      fontFamily: "'Press Start 2P', monospace",
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Burn Tokens 🔥
                  </button>
                </div>
              </div>

              {adminSuccess && (
                <div style={{ marginTop: '8px', fontSize: '6px', color: '#00ff88', fontFamily: "'Press Start 2P', monospace" }}>
                  ✓ Transaction confirmed! {adminTxHash ? `Tx: ${adminTxHash.slice(0, 10)}...` : ''}
                </div>
              )}
              {adminError && (
                <div style={{ marginTop: '8px', fontSize: '6px', color: '#ff4466', fontFamily: "'Press Start 2P', monospace" }}>
                  ⚠️ {adminError}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
