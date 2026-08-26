import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { createPublicClient, http, formatUnits, parseAbi } from 'viem';
import { base } from 'viem/chains';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  ArrowUpRight,
  Copy,
  Check,
  Clock,
  Calendar,
  ShieldCheck,
  Coins,
  Crown,
  Sparkles,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Lock,
  Gift,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import round1Data from './data/round_1_proofs.json';

const CA = '0xb200000000000000000000df24ecb8bf51100a01';
const NFT_CA = '0x9E92307Dbec2d0aE4BBF14cA93E1cA00edC4b886';
const O1 = 'https://launch.o1.exchange/token/0xb200000000000000000000df24ecb8bf51100a01?chain=8453';
const VIBECLUB_MINT_URL = 'https://vibeverse.dog/vibeclub';

const MIN_HOLDER_BALANCE = 5000000; // 5M $VIBE

const HOLDER_ROUNDS = [
  { id: 1, name: 'Round 1', pool: '10,000,000 $VIBE', snapshotTime: '26 Aug, 00:00 UTC', unlockDate: '26 Aug, 00:15 UTC', targetDate: '2026-08-26T00:15:00Z' },
  { id: 2, name: 'Round 2', pool: '10,000,000 $VIBE', snapshotTime: '25 Sep, 00:00 UTC', unlockDate: '25 Sep, 00:15 UTC', targetDate: '2026-09-25T00:15:00Z' },
  { id: 3, name: 'Round 3', pool: '10,000,000 $VIBE', snapshotTime: '25 Oct, 00:00 UTC', unlockDate: '25 Oct, 00:15 UTC', targetDate: '2026-10-25T00:15:00Z' },
  { id: 4, name: 'Round 4', pool: '10,000,000 $VIBE', snapshotTime: '24 Nov, 00:00 UTC', unlockDate: '24 Nov, 00:15 UTC', targetDate: '2026-11-24T00:15:00Z' },
];

const VIBECLUB_ROUNDS = [
  { id: 1, name: 'Royalty 1', pool: '15% Revenue Pool', snapshotTime: '28 Aug, 00:00 UTC', claimDate: '28 Aug, 00:00 UTC', targetDate: '2026-08-28T00:00:00Z' },
  { id: 2, name: 'Royalty 2', pool: '15% Revenue Pool', snapshotTime: '3 Sep, 00:00 UTC', claimDate: '3 Sep, 00:00 UTC', targetDate: '2026-09-03T00:00:00Z' },
  { id: 3, name: 'Royalty 3', pool: '15% Revenue Pool', snapshotTime: '13 Sep, 00:00 UTC', claimDate: '13 Sep, 00:00 UTC', targetDate: '2026-09-13T00:00:00Z' },
  { id: 4, name: 'Royalty 4', pool: '15% Revenue Pool', snapshotTime: '23 Sep, 00:00 UTC', claimDate: '23 Sep, 00:00 UTC', targetDate: '2026-09-23T00:00:00Z' },
];

const ERC20_ABI = parseAbi([
  'function balanceOf(address account) view returns (uint256)'
]);

const NFT_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function walletMintCount(address owner) view returns (uint256)'
]);

function formatCountdown(targetIso) {
  if (!targetIso) return '';
  const now = new Date().getTime();
  const target = new Date(targetIso).getTime();
  const diff = target - now;

  if (diff <= 0) return '00H:00M:00S';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const pad = (n) => String(n).padStart(2, '0');

  if (days > 0) {
    return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }
  return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

export default function Checker() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [balance, setBalance] = useState(null);
  const [nftCount, setNftCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'holders' | 'vibeclub'
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [claimStatus, setClaimStatus] = useState({}); // { [id]: 'idle' | 'claiming' | 'claimed' }

  // Live Timer Update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const address = user?.wallet?.address;

  // Fetch balances from on-chain RPC
  const fetchBalances = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const client = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });
      
      // 1. Fetch $VIBE balance
      const bal = await client.readContract({
        address: CA,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address]
      });
      setBalance(Number(formatUnits(bal, 18)));

      // 2. Fetch Vibe Club NFT balance
      try {
        const nfts = await client.readContract({
          address: NFT_CA,
          abi: NFT_ABI,
          functionName: 'balanceOf',
          args: [address]
        });
        setNftCount(Number(nfts));
      } catch (nftErr) {
        // Fallback to walletMintCount
        const minted = await client.readContract({
          address: NFT_CA,
          abi: NFT_ABI,
          functionName: 'walletMintCount',
          args: [address]
        });
        setNftCount(Number(minted));
      }
    } catch (e) {
      console.error("Failed to read balances:", e);
      if (balance === null) setBalance(0);
      if (nftCount === null) setNftCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated && address) {
      fetchBalances();
    } else {
      setBalance(null);
      setNftCount(null);
    }
  }, [authenticated, address]);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Counts for Available Rewards tabs
  const holderReadyCount = (isHolderRound1Live && (hasConfirmedHolderClaim || isHolderEligibleLive)) ? 1 : 0;
  const vibeClubReadyCount = (isRoyalty1Live && isVibeClubEligible) ? 1 : 0;
  const totalReadyCount = holderReadyCount + vibeClubReadyCount;

  return (
    <section id="claim-portal" style={{ minHeight: '80vh', padding: '130px 0 100px 0', background: 'var(--bg)' }}>
      <div className="wrap" style={{ maxWidth: '1200px' }}>
        
        {/* Portal Header */}
        <div className="sec-head" style={{ textAlign: 'center', alignItems: 'center', marginBottom: '40px' }}>
          <h2>Claim <span className="bl">Portal</span></h2>
          <p className="sec-sub" style={{ textAlign: 'center', margin: '0 auto' }}>
            Check your eligibility &amp; Claim rewards
          </p>
        </div>

        {/* ── NOT AUTHENTICATED STATE (Matching Prod Checker) ── */}
        {ready && !authenticated && (
          <div
            className="checker-card"
            style={{
              background: 'var(--surface)',
              padding: '40px',
              borderRadius: '24px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              textAlign: 'center',
              maxWidth: 600,
              margin: '0 auto'
            }}
          >
            <div className="ch-unauth">
              <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px', overflow: 'hidden' }}>
                <img src="/new-logo-vibe.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="VIBE" />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '8px', fontWeight: 800, color: 'var(--ink)' }}>
                Wallet not connected
              </h3>
              <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
                Please connect your wallet to check your eligibility and claim $VIBE rewards.
              </p>
              <button onClick={login} className="btn-fill" style={{ width: '100%', justifyContent: 'center' }}>
                Connect Wallet
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--muted)', fontSize: '0.8rem', marginTop: '16px' }}>
                Protected by <span style={{ fontWeight: '700', color: 'var(--ink)' }}>privy</span>
              </div>
            </div>
          </div>
        )}

        {/* ── LOADING STATE ── */}
        {!ready && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0', color: 'var(--blue)' }}>
            <Loader2 className="spin" size={40} />
          </div>
        )}

        {/* ── AUTHENTICATED PORTAL VIEW ── */}
        {ready && authenticated && (
          <div>
            
            {/* Top Connected Wallet Info Bar */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(0, 160, 255, 0.22)',
                borderRadius: '22px',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '28px',
                boxShadow: '0 4px 20px rgba(0, 82, 255, 0.05)'
              }}
            >
              {/* Left: User Address & Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--blue)', flexShrink: 0, boxShadow: '0 2px 10px rgba(0, 82, 255, 0.15)' }}>
                  <img src="/new-logo-vibe.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="VIBE" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', display: 'inline-block' }} />
                    <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', fontWeight: 800 }}>
                      Connected Wallet
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '0.96rem', color: 'var(--ink)', fontFamily: 'monospace', fontWeight: 800 }}>
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                    </strong>
                    <button
                      onClick={copyAddress}
                      title="Copy Address"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copied ? '#10b981' : 'var(--blue)', display: 'inline-flex', alignItems: 'center', padding: '2px' }}
                    >
                      {copied ? <Check size={15} strokeWidth={3} /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Middle: Live Balances */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {/* $VIBE Balance */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '9px 16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(0, 160, 255, 0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 2px 8px rgba(0, 82, 255, 0.04)'
                  }}
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(0, 82, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Coins size={16} color="var(--blue)" />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 800, display: 'block', letterSpacing: '0.04em' }}>$VIBE Balance</span>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--ink)', fontWeight: 900 }}>
                      {loading || balance === null ? <Loader2 size={13} className="spin" style={{ display: 'inline' }} /> : `${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} $VIBE`}
                    </strong>
                  </div>
                </div>

                {/* Vibe Club NFTs */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '9px 16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(16, 185, 129, 0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.04)'
                  }}
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Crown size={16} color="#10b981" />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 800, display: 'block', letterSpacing: '0.04em' }}>Vibe Club</span>
                    <strong style={{ fontSize: '0.92rem', color: '#10b981', fontWeight: 900 }}>
                      {loading || nftCount === null ? <Loader2 size={13} className="spin" style={{ display: 'inline' }} /> : `${nftCount} NFT${nftCount === 1 ? '' : 's'}`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Right: Refresh & Disconnect */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={fetchBalances}
                  disabled={loading}
                  title="Refresh On-Chain Balances"
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(0, 160, 255, 0.25)',
                    padding: '9px',
                    borderRadius: '11px',
                    cursor: 'pointer',
                    color: 'var(--blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s'
                  }}
                >
                  <RefreshCw size={15} className={loading ? 'spin' : ''} />
                </button>
                <button
                  onClick={logout}
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    padding: '9px 16px',
                    borderRadius: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* Sub-header: Available Rewards Label + Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', margin: 0 }}>
                Available Rewards
              </h3>

              <div style={{ display: 'flex', gap: '6px', background: 'rgba(255, 255, 255, 0.75)', padding: '5px', borderRadius: '16px', border: '1px solid rgba(0, 160, 255, 0.18)', boxShadow: '0 2px 10px rgba(0, 82, 255, 0.04)' }}>
                {[
                  { id: 'all', label: `All Available (${totalReadyCount})` },
                  { id: 'holders', label: `Holder Rewards (${holderReadyCount})` },
                  { id: 'vibeclub', label: `Vibe Club (${vibeClubReadyCount})` }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      fontFamily: 'var(--font)',
                      background: activeTab === t.id ? 'var(--blue)' : 'transparent',
                      color: activeTab === t.id ? '#ffffff' : '#64748b',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '12px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: activeTab === t.id ? '0 2px 10px rgba(0, 82, 255, 0.25)' : 'none'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── REWARDS CLAIM GRID ── */}
            <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'all' ? 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))' : '1fr', gap: '24px', marginBottom: '40px' }}>
              
              {/* ═════════ 1. HOLDER REWARDS CARD ═════════ */}
              {(activeTab === 'all' || activeTab === 'holders') && (
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '24px',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 6px 28px rgba(0, 82, 255, 0.05)',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0, 82, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Coins size={22} color="var(--blue)" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                          Holder Rewards · 1 Unlock
                        </h3>
                        <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>
                          10,000,000 $VIBE Pool
                        </span>
                      </div>
                    </div>

                    {/* ── Body: BEFORE LIVE CLAIM (UPCOMING / SNAPSHOT CHECK) ── */}
                    {!isHolderRound1Live && (
                      <div style={{ marginBottom: '24px' }}>
                        {isHolderEligibleLive ? (
                          <div
                            style={{
                              background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                              border: '1.5px solid #a7f3d0',
                              borderRadius: '20px',
                              padding: '24px 20px',
                              textAlign: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '10px'
                            }}
                          >
                            <img
                              src="/vibe-logo-nobg.png"
                              alt="Eligible VIBE"
                              style={{ width: 100, height: 100, objectFit: 'contain', margin: '-6px 0 -10px 0' }}
                            />
                            <h4 style={{ fontSize: '1.3rem', color: '#10b981', margin: 0, fontWeight: 900 }}>
                              You are Eligible!
                            </h4>
                            <p style={{ fontSize: '0.88rem', color: 'var(--ink)', margin: 0, fontWeight: 600 }}>
                              Your wallet qualifies for the 10M $VIBE distribution.
                            </p>
                            <div style={{ background: '#ffffff', padding: '10px 18px', borderRadius: '12px', color: '#047857', fontWeight: 800, fontSize: '0.84rem', border: '1px solid #a7f3d0', marginTop: '4px' }}>
                              Your Balance: {balance !== null ? `${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} $VIBE` : '...'}
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              background: '#fef2f2',
                              border: '1.5px solid #fecaca',
                              borderRadius: '20px',
                              padding: '24px 20px',
                              textAlign: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '10px'
                            }}
                          >
                            <img
                              src="/vibe-sad-logo-nobg.png"
                              alt="Sad VIBE"
                              style={{ width: 100, height: 100, objectFit: 'contain', margin: '-6px 0 -10px 0' }}
                            />
                            <h4 style={{ fontSize: '1.3rem', color: '#ef4444', margin: 0, fontWeight: 900 }}>
                              Not Eligible Yet
                            </h4>
                            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', margin: 0, fontWeight: 700 }}>
                              Hold 5M+ to become eligible.
                            </p>
                            <div style={{ background: '#ffffff', padding: '10px 18px', borderRadius: '12px', color: '#b91c1c', fontWeight: 800, fontSize: '0.84rem', border: '1px solid #fecaca', width: '100%', maxWidth: '320px' }}>
                              Your Balance: {balance !== null ? `${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} $VIBE` : '0 $VIBE'}
                            </div>
                            <a
                              href={O1}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-fill"
                              style={{
                                marginTop: '6px',
                                padding: '10px 20px',
                                fontSize: '0.84rem',
                                fontWeight: 800,
                                borderRadius: '12px',
                                textDecoration: 'none',
                                background: '#ef4444'
                              }}
                            >
                              Buy 5M+ on o1.exchange <ArrowUpRight size={15} />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Body: WHEN CLAIM IS LIVE ── */}
                    {isHolderRound1Live && (
                      <div style={{ marginBottom: '24px' }}>
                        {(hasConfirmedHolderClaim || isHolderEligibleLive) ? (
                          <div
                            style={{
                              background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                              border: '1.5px solid #a7f3d0',
                              borderRadius: '20px',
                              padding: '22px 20px',
                              textAlign: 'left'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                              <CheckCircle2 size={16} /> Eligible for Claim
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                              <div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                                  {holderRewardAmount.toLocaleString()} <span style={{ fontSize: '0.95rem', color: 'var(--blue)', fontWeight: 800 }}>$VIBE</span>
                                </div>
                                <span style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 700 }}>
                                  {userProofData ? `Snapshot Verified (Share: ${userProofData.sharePercent})` : 'Live Balance Verified (≥5M)'}
                                </span>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block' }}>Your Balance</span>
                                <strong style={{ fontSize: '0.88rem', color: 'var(--ink)' }}>{balance !== null ? `${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '...'} $VIBE</strong>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              background: '#fef2f2',
                              border: '1.5px solid #fecaca',
                              borderRadius: '20px',
                              padding: '24px 20px',
                              textAlign: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '10px'
                            }}
                          >
                            <img
                              src="/vibe-sad-logo-nobg.png"
                              alt="Sad VIBE"
                              style={{ width: 90, height: 90, objectFit: 'contain' }}
                            />
                            <h4 style={{ fontSize: '1.25rem', color: '#ef4444', margin: 0, fontWeight: 900 }}>
                              Not Eligible for Round 1
                            </h4>
                            <p style={{ fontSize: '0.85rem', color: '#991b1b', margin: 0 }}>
                              Your balance was below 5,000,000 $VIBE at the snapshot.
                            </p>
                            <a
                              href={O1}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#ef4444',
                                color: '#ffffff',
                                padding: '8px 16px',
                                borderRadius: '10px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                textDecoration: 'none',
                                marginTop: '4px'
                              }}
                            >
                              Buy 5M+ on o1.exchange <ArrowUpRight size={14} />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Button: Claim or Lock State */}
                  <div>
                    {isHolderRound1Live ? (
                      (hasConfirmedHolderClaim || isHolderEligibleLive) ? (
                        claimStatus['holder-1'] === 'claimed' ? (
                          <div
                            style={{
                              width: '100%',
                              padding: '13px 20px',
                              borderRadius: '14px',
                              background: '#ecfdf5',
                              border: '1.5px solid #a7f3d0',
                              color: '#059669',
                              fontWeight: 900,
                              fontSize: '0.92rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <Check size={18} strokeWidth={3} /> Rewards Claimed Successfully!
                          </div>
                        ) : (
                          <button
                            onClick={() => handleClaim('holder', 1, holderRewardAmount)}
                            disabled={claimStatus['holder-1'] === 'claiming'}
                            className="btn-fill"
                            style={{
                              width: '100%',
                              padding: '13px 20px',
                              borderRadius: '14px',
                              fontSize: '0.94rem',
                              fontWeight: 900,
                              justifyContent: 'center',
                              boxShadow: '0 4px 20px rgba(0, 82, 255, 0.35)',
                              cursor: 'pointer'
                            }}
                          >
                            {claimStatus['holder-1'] === 'claiming' ? (
                              <>
                                <Loader2 size={18} className="spin" /> Confirming Claim on Base...
                              </>
                            ) : (
                              <>
                                <Gift size={18} /> Claim {holderRewardAmount.toLocaleString()} $VIBE Rewards
                              </>
                            )}
                          </button>
                        )
                      ) : (
                        <button
                          disabled
                          style={{
                            width: '100%',
                            padding: '12px 20px',
                            borderRadius: '14px',
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            color: '#94a3b8',
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            cursor: 'not-allowed'
                          }}
                        >
                          Not Eligible for this Round
                        </button>
                      )
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          padding: '12px 18px',
                          borderRadius: '14px',
                          background: 'rgba(255, 255, 255, 0.75)',
                          border: '1.5px solid rgba(0, 160, 255, 0.2)',
                          color: '#64748b',
                          fontWeight: 800,
                          fontSize: '0.84rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Lock size={14} /> Claim opens at 00:15 UTC ({formatCountdown(HOLDER_ROUNDS[0].targetDate)})
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═════════ 2. VIBE CLUB ROYALTIES CARD ═════════ */}
              {(activeTab === 'all' || activeTab === 'vibeclub') && (
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '24px',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 6px 28px rgba(0, 82, 255, 0.05)',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Crown size={22} color="#10b981" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                          Vibe Club Royalties · Royalty 1
                        </h3>
                        <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>
                          15% Revenue Royalties Pool
                        </span>
                      </div>
                    </div>

                    {/* ── Body: BEFORE LIVE CLAIM (UPCOMING / SNAPSHOT CHECK) ── */}
                    {!isRoyalty1Live && (
                      <div style={{ marginBottom: '24px' }}>
                        {isVibeClubEligible ? (
                          <div
                            style={{
                              background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                              border: '1.5px solid #a7f3d0',
                              borderRadius: '20px',
                              padding: '24px 20px',
                              textAlign: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '10px'
                            }}
                          >
                            <img
                              src="/vibe-logo-nobg.png"
                              alt="Eligible NFT"
                              style={{ width: 100, height: 100, objectFit: 'contain', margin: '-6px 0 -10px 0' }}
                            />
                            <h4 style={{ fontSize: '1.3rem', color: '#10b981', margin: 0, fontWeight: 900 }}>
                              Eligible Vibe Club Member!
                            </h4>
                            <p style={{ fontSize: '0.88rem', color: 'var(--ink)', margin: 0, fontWeight: 600 }}>
                              All 333 NFTs receive equal royalty pool distributions.
                            </p>
                            <div style={{ background: '#ffffff', padding: '10px 18px', borderRadius: '12px', color: '#047857', fontWeight: 800, fontSize: '0.84rem', border: '1px solid #a7f3d0', marginTop: '4px' }}>
                              Holding: {nftCount} Vibe Club NFT{nftCount > 1 ? 's' : ''}
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              background: '#fef2f2',
                              border: '1.5px solid #fecaca',
                              borderRadius: '20px',
                              padding: '24px 20px',
                              textAlign: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '10px'
                            }}
                          >
                            <img
                              src="/vibe-sad-logo-nobg.png"
                              alt="Sad NFT"
                              style={{ width: 100, height: 100, objectFit: 'contain', margin: '-6px 0 -10px 0' }}
                            />
                            <h4 style={{ fontSize: '1.3rem', color: '#ef4444', margin: 0, fontWeight: 900 }}>
                              No NFTs Detected
                            </h4>
                            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', margin: 0, fontWeight: 700 }}>
                              Hold at least 1 Vibe Club NFT to become eligible.
                            </p>
                            <a
                              href={VIBECLUB_MINT_URL}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-fill"
                              style={{
                                marginTop: '6px',
                                padding: '10px 20px',
                                fontSize: '0.84rem',
                                fontWeight: 800,
                                borderRadius: '12px',
                                textDecoration: 'none',
                                background: '#10b981'
                              }}
                            >
                              Mint Vibe Club NFT ↗
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Body: WHEN CLAIM IS LIVE ── */}
                    {isRoyalty1Live && (
                      <div style={{ marginBottom: '24px' }}>
                        {isVibeClubEligible ? (
                          <div
                            style={{
                              background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                              border: '1.5px solid #a7f3d0',
                              borderRadius: '20px',
                              padding: '22px 20px',
                              textAlign: 'left'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                              <Crown size={16} /> Eligible Vibe Club Member
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                              <div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                                  Equal Pool Share <span style={{ fontSize: '0.95rem', color: '#10b981', fontWeight: 800 }}>({nftCount} NFT{nftCount > 1 ? 's' : ''})</span>
                                </div>
                                <span style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 700 }}>
                                  All 333 NFTs receive equal royalty distributions
                                </span>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block' }}>Holding</span>
                                <strong style={{ fontSize: '0.88rem', color: '#10b981' }}>{nftCount} Vibe Club NFT{nftCount > 1 ? 's' : ''}</strong>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              background: '#fef2f2',
                              border: '1.5px solid #fecaca',
                              borderRadius: '20px',
                              padding: '24px 20px',
                              textAlign: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '10px'
                            }}
                          >
                            <img
                              src="/vibe-sad-logo-nobg.png"
                              alt="Sad NFT"
                              style={{ width: 90, height: 90, objectFit: 'contain' }}
                            />
                            <h4 style={{ fontSize: '1.25rem', color: '#ef4444', margin: 0, fontWeight: 900 }}>
                              No NFTs Detected
                            </h4>
                            <p style={{ fontSize: '0.85rem', color: '#991b1b', margin: 0 }}>
                              You did not hold a Vibe Club NFT at the snapshot time.
                            </p>
                            <a
                              href={VIBECLUB_MINT_URL}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#10b981',
                                color: '#ffffff',
                                padding: '8px 16px',
                                borderRadius: '10px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                textDecoration: 'none',
                                marginTop: '4px'
                              }}
                            >
                              Mint Vibe Club NFT ↗
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div>
                    {isRoyalty1Live ? (
                      isVibeClubEligible ? (
                        claimStatus['vibeclub-1'] === 'claimed' ? (
                          <div
                            style={{
                              width: '100%',
                              padding: '13px 20px',
                              borderRadius: '14px',
                              background: '#ecfdf5',
                              border: '1.5px solid #a7f3d0',
                              color: '#059669',
                              fontWeight: 900,
                              fontSize: '0.92rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <Check size={18} strokeWidth={3} /> Royalty Claimed Successfully!
                          </div>
                        ) : (
                          <button
                            onClick={() => handleClaim('vibeclub', 1, 'Pool Share')}
                            disabled={claimStatus['vibeclub-1'] === 'claiming'}
                            className="btn-fill"
                            style={{
                              width: '100%',
                              padding: '13px 20px',
                              borderRadius: '14px',
                              fontSize: '0.94rem',
                              fontWeight: 900,
                              justifyContent: 'center',
                              background: 'var(--blue)',
                              boxShadow: '0 4px 20px rgba(0, 82, 255, 0.35)',
                              cursor: 'pointer'
                            }}
                          >
                            {claimStatus['vibeclub-1'] === 'claiming' ? (
                              <>
                                <Loader2 size={18} className="spin" /> Confirming Royalty Claim...
                              </>
                            ) : (
                              <>
                                <Crown size={18} /> Claim Vibe Club Royalties
                              </>
                            )}
                          </button>
                        )
                      ) : (
                        <button
                          disabled
                          style={{
                            width: '100%',
                            padding: '12px 20px',
                            borderRadius: '14px',
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            color: '#94a3b8',
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            cursor: 'not-allowed'
                          }}
                        >
                          Hold NFT to Claim Royalties
                        </button>
                      )
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          padding: '12px 18px',
                          borderRadius: '14px',
                          background: 'rgba(255, 255, 255, 0.75)',
                          border: '1.5px solid rgba(0, 160, 255, 0.2)',
                          color: '#64748b',
                          fontWeight: 800,
                          fontSize: '0.84rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Lock size={14} /> Claim opens Aug 28, 00:00 UTC ({formatCountdown(VIBECLUB_ROUNDS[0].targetDate)})
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </section>
  );
}
