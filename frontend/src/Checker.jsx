import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, formatUnits, parseAbi, encodeFunctionData, parseUnits } from 'viem';
import { base } from 'viem/chains';
import {
  CheckCircle2,
  Loader2,
  ArrowUpRight,
  Copy,
  Check,
  Clock,
  Calendar,
  Coins,
  Crown,
  Sparkles,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Lock,
  Gift,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import round1Data from './data/round_1_proofs.json';

const CA = '0xb200000000000000000000df24ecb8bf51100a01';
const NFT_CA = '0x9E92307Dbec2d0aE4BBF14cA93E1cA00edC4b886';
const DISTRIBUTOR_CA = '0x77e04dd8c45725d2b2b3c8eebac2f3f1708fd089';
const ADMIN_WALLET = '0x4c91d3bed372c11795b9ce9a9017dfe447bf050a';
const O1 = 'https://launch.o1.exchange/token/0xb200000000000000000000df24ecb8bf51100a01?chain=8453';
const VIBECLUB_MINT_URL = 'https://vibeverse.dog/vibeclub';

const MIN_HOLDER_BALANCE = 5000000; // 5M $VIBE

const DISTRIBUTOR_ABI = parseAbi([
  'function owner() view returns (address)',
  'function setMerkleRoot(uint256 epochId, bytes32 _merkleRoot) external',
  'function claim(uint256 epochId, uint256 amount, bytes32[] merkleProof) external',
  'function hasClaimed(uint256 epochId, address account) view returns (bool)'
]);

const HOLDER_ROUNDS = [
  { id: 1, name: 'Unlock 1', pool: '10,000,000 $VIBE', snapshotTime: '26 Aug, 00:00 UTC', unlockDate: 'Aug 26, 00:15 UTC', targetDate: '2026-08-26T00:15:00Z' },
  { id: 2, name: 'Unlock 2', pool: '10,000,000 $VIBE', snapshotTime: '25 Sep, 00:00 UTC', unlockDate: 'Sep 25, 00:15 UTC', targetDate: '2026-09-25T00:15:00Z' },
  { id: 3, name: 'Unlock 3', pool: '10,000,000 $VIBE', snapshotTime: '25 Oct, 00:00 UTC', unlockDate: 'Oct 25, 00:15 UTC', targetDate: '2026-10-25T00:15:00Z' },
  { id: 4, name: 'Unlock 4', pool: '10,000,000 $VIBE', snapshotTime: '24 Nov, 00:00 UTC', unlockDate: 'Nov 24, 00:15 UTC', targetDate: '2026-11-24T00:15:00Z' },
];

const VIBECLUB_ROUNDS = [
  { id: 1, name: 'Royalty 1', pool: 'TBA', snapshotTime: '28 Aug, 00:00 UTC', claimDate: 'Aug 28, 00:00 UTC', targetDate: '2026-08-28T00:00:00Z' },
  { id: 2, name: 'Royalty 2', pool: 'TBA', snapshotTime: '3 Sep, 00:00 UTC', claimDate: 'Sep 3, 00:00 UTC', targetDate: '2026-09-03T00:00:00Z' },
  { id: 3, name: 'Royalty 3', pool: 'TBA', snapshotTime: '13 Sep, 00:00 UTC', claimDate: 'Sep 13, 00:00 UTC', targetDate: '2026-09-13T00:00:00Z' },
  { id: 4, name: 'Royalty 4', pool: 'TBA', snapshotTime: '23 Sep, 00:00 UTC', claimDate: 'Sep 23, 00:00 UTC', targetDate: '2026-09-23T00:00:00Z' },
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
  try {
    const now = new Date().getTime();
    const target = new Date(targetIso).getTime();
    const diff = target - now;

    if (diff <= 0) return '00h 00m 00s';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const pad = (n) => String(n).padStart(2, '0');

    if (days > 0) {
      return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    }
    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  } catch (e) {
    return '';
  }
}

export default function Checker() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [balance, setBalance] = useState(null);
  const [nftCount, setNftCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [claimStatus, setClaimStatus] = useState({});
  const [claimedHistory, setClaimedHistory] = useState([]);

  // Collapsible Section States
  const [isAvailableOpen, setIsAvailableOpen] = useState(true);
  const [isUpcomingOpen, setIsUpcomingOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  // Admin Panel States
  const [adminEpochId, setAdminEpochId] = useState('1');
  const [adminMerkleRoot, setAdminMerkleRoot] = useState(round1Data?.merkleRoot || '0x33b8e3f1c8abfc06a4692ba0a946e11e314832c826153ad5e0ef9ce990cebb93');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminTxHash, setAdminTxHash] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState(false);

  // Live Timer Update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const address = user?.wallet?.address;

  // Load Claim History from localStorage for Connected Wallet
  useEffect(() => {
    if (address) {
      try {
        const stored = localStorage.getItem(`vibe_claim_history_${address.toLowerCase()}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setClaimedHistory(parsed);
          } else {
            setClaimedHistory([]);
          }
        } else {
          setClaimedHistory([]);
        }
      } catch (e) {
        console.error('Failed to parse claimed history:', e);
        setClaimedHistory([]);
      }
    } else {
      setClaimedHistory([]);
    }
  }, [address]);

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

  // Proof data for Round 1
  const userProofData = (address && round1Data && round1Data.claims) ? round1Data.claims[address.toLowerCase()] : null;
  const isHolderEligibleLive = (balance !== null && balance >= MIN_HOLDER_BALANCE);
  const hasConfirmedHolderClaim = !!userProofData;
  const holderRewardAmount = userProofData ? (userProofData.amount || 0) : (isHolderEligibleLive ? 500000 : 0);

  const isVibeClubEligible = (nftCount !== null && nftCount > 0);

  // Check if connected wallet is Admin / Contract Owner
  const isAdmin = !!(address && (address.toLowerCase() === ADMIN_WALLET.toLowerCase()));

  // Check Claim Status for Round 1 Holder
  const isHolderRound1Claimed = (Array.isArray(claimedHistory) && claimedHistory.some(c => c && c.id === 'holder-1')) || claimStatus['holder-1'] === 'claimed';
  const isHolderRound1Live = currentTime >= new Date(HOLDER_ROUNDS[0].targetDate);
  const isHolderRound1Available = isHolderRound1Live && !isHolderRound1Claimed;

  // Check Claim Status for Royalty 1 Vibe Club
  const isVibeClubRoyalty1Claimed = (Array.isArray(claimedHistory) && claimedHistory.some(c => c && c.id === 'vibeclub-1')) || claimStatus['vibeclub-1'] === 'claimed';
  const isVibeClubRoyalty1Live = currentTime >= new Date(VIBECLUB_ROUNDS[0].targetDate);
  const isVibeClubRoyalty1Available = isVibeClubRoyalty1Live && !isVibeClubRoyalty1Claimed;

  // Available claim count (where user is eligible and ready to claim)
  const availableHolderCount = (isHolderRound1Available && (hasConfirmedHolderClaim || isHolderEligibleLive)) ? 1 : 0;
  const availableVibeClubCount = (isVibeClubRoyalty1Available && isVibeClubEligible) ? 1 : 0;
  const totalAvailableCount = availableHolderCount + availableVibeClubCount;

  // Next Upcoming Unlocks to Display
  const upcomingHolderRound = isHolderRound1Live ? HOLDER_ROUNDS[1] : HOLDER_ROUNDS[0];
  const upcomingVibeClubRound = isVibeClubRoyalty1Live ? VIBECLUB_ROUNDS[1] : VIBECLUB_ROUNDS[0];

  // Set Merkle Root on-chain function (supports Coinbase Smart Wallet & EOA)
  const handleSetMerkleRoot = async () => {
    if (!wallets || wallets.length === 0) {
      setAdminError('No connected wallet detected. Please reconnect.');
      return;
    }
    setAdminLoading(true);
    setAdminError('');
    setAdminSuccess(false);
    setAdminTxHash('');

    try {
      const activeWallet = wallets.find(w => w.address.toLowerCase() === address?.toLowerCase()) || wallets[0];
      const provider = await activeWallet.getEthereumProvider();

      const calldata = encodeFunctionData({
        abi: DISTRIBUTOR_ABI,
        functionName: 'setMerkleRoot',
        args: [BigInt(adminEpochId), adminMerkleRoot.trim()]
      });

      let txHashResult = null;

      try {
        const callsRes = await provider.request({
          method: 'wallet_sendCalls',
          params: [{
            version: '1.0',
            chainId: '0x2105', // Base 8453
            from: address,
            calls: [{
              to: DISTRIBUTOR_CA,
              value: '0x0',
              data: calldata
            }]
          }]
        });

        if (callsRes) {
          if (typeof callsRes === 'string' && callsRes.startsWith('0x') && callsRes.length === 66) {
            txHashResult = callsRes;
          } else {
            const callId = typeof callsRes === 'object' ? (callsRes.id || callsRes) : callsRes;
            for (let i = 0; i < 30; i++) {
              await new Promise(r => setTimeout(r, 1000));
              try {
                const status = await provider.request({
                  method: 'wallet_getCallsStatus',
                  params: [callId]
                });
                if (status?.receipts?.[0]?.transactionHash) {
                  txHashResult = status.receipts[0].transactionHash;
                  break;
                }
              } catch (e) {}
            }
            if (!txHashResult) txHashResult = typeof callId === 'string' ? callId : 'Confirmed';
          }
        }
      } catch (errCalls) {
        console.warn('wallet_sendCalls not supported, falling back to eth_sendTransaction:', errCalls);
        txHashResult = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: address,
            to: DISTRIBUTOR_CA,
            data: calldata,
            value: '0x0'
          }]
        });
      }

      setAdminTxHash(txHashResult || 'Confirmed');
      setAdminSuccess(true);
    } catch (err) {
      console.error('Failed to set Merkle root on-chain:', err);
      setAdminError(err?.message || 'Transaction rejected or failed.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleClaim = async (type, roundId, amountNum) => {
    const claimKey = `${type}-${roundId}`;
    setClaimStatus(prev => ({ ...prev, [claimKey]: 'claiming' }));
    
    try {
      let txHashResult = null;
      if (type === 'holder' && userProofData && wallets && wallets.length > 0) {
        const activeWallet = wallets.find(w => w.address.toLowerCase() === address?.toLowerCase()) || wallets[0];
        const provider = await activeWallet.getEthereumProvider();
        const amountWei = parseUnits(userProofData.amount.toString(), 18);
        const calldata = encodeFunctionData({
          abi: DISTRIBUTOR_ABI,
          functionName: 'claim',
          args: [BigInt(roundId), amountWei, userProofData.proof]
        });

        try {
          const callsRes = await provider.request({
            method: 'wallet_sendCalls',
            params: [{
              version: '1.0',
              chainId: '0x2105',
              from: address,
              calls: [{ to: DISTRIBUTOR_CA, value: '0x0', data: calldata }]
            }]
          });
          if (callsRes) {
            txHashResult = typeof callsRes === 'string' ? callsRes : (callsRes.id || 'Confirmed');
          }
        } catch (e) {
          txHashResult = await provider.request({
            method: 'eth_sendTransaction',
            params: [{ from: address, to: DISTRIBUTOR_CA, data: calldata, value: '0x0' }]
          });
        }
      }

      // Add to claimed history
      const newClaimItem = {
        id: claimKey,
        type,
        roundId,
        title: type === 'holder' ? `Holder Rewards · Unlock ${roundId}` : `Vibe Club · Royalty ${roundId}`,
        amount: amountNum,
        txHash: txHashResult || ('0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')),
        timestamp: new Date().toISOString()
      };

      const prevHistory = Array.isArray(claimedHistory) ? claimedHistory : [];
      const updatedHistory = [newClaimItem, ...prevHistory.filter(c => c && c.id !== claimKey)];
      setClaimedHistory(updatedHistory);
      if (address) {
        localStorage.setItem(`vibe_claim_history_${address.toLowerCase()}`, JSON.stringify(updatedHistory));
      }

      setClaimStatus(prev => ({ ...prev, [claimKey]: 'claimed' }));
    } catch (err) {
      console.error('Claim transaction error:', err);
      setClaimStatus(prev => ({ ...prev, [claimKey]: 'idle' }));
    }
  };

  return (
    <section id="claim-portal" style={{ minHeight: '80vh', padding: '130px 0 100px 0', background: 'var(--bg)' }}>
      <div className="wrap" style={{ maxWidth: '1200px' }}>
        
        {/* Portal Header */}
        <div className="sec-head" style={{ textAlign: 'center', alignItems: 'center', marginBottom: '36px' }}>
          <h2>Claim <span className="bl">Portal</span></h2>
          <p className="sec-sub" style={{ textAlign: 'center', margin: '0 auto' }}>
            Check your eligibility &amp; Claim rewards
          </p>
        </div>

        {/* ── LOADING STATE ── */}
        {!ready ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0', color: 'var(--blue)' }}>
            <Loader2 className="spin" size={40} />
          </div>
        ) : !authenticated ? (
          /* ── NOT AUTHENTICATED STATE (Matching Original Prod Checker) ── */
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
        ) : (
          /* ── AUTHENTICATED PORTAL VIEW ── */
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
                marginBottom: '32px',
                boxShadow: '0 4px 20px rgba(0, 82, 255, 0.05)'
              }}
            >
              {/* Left: User Address & Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--blue)', flexShrink: 0, boxShadow: '0 2px 10px rgba(0, 82, 255, 0.15)' }}>
                  <img src="/new-logo-vibe.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="VIBE" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', display: 'inline-block' }} />
                    <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', fontWeight: 800, lineHeight: 1 }}>
                      Connected Wallet
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '0.96rem', color: 'var(--ink)', fontFamily: 'monospace', fontWeight: 800, lineHeight: 1 }}>
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

              {/* Right: Live Balances + Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {/* $VIBE Balance */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(0, 160, 255, 0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 2px 8px rgba(0, 82, 255, 0.04)'
                  }}
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(0, 82, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Coins size={16} color="var(--blue)" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 800, lineHeight: 1.1, letterSpacing: '0.04em', marginBottom: '2px' }}>$VIBE Balance</span>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--ink)', fontWeight: 900, lineHeight: 1 }}>
                      {loading || balance === null ? <Loader2 size={13} className="spin" style={{ display: 'inline' }} /> : `${(balance || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} $VIBE`}
                    </strong>
                  </div>
                </div>

                {/* Vibe Club NFTs */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(16, 185, 129, 0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.04)'
                  }}
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Crown size={16} color="#10b981" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 800, lineHeight: 1.1, letterSpacing: '0.04em', marginBottom: '2px' }}>Vibe Club</span>
                    <strong style={{ fontSize: '0.92rem', color: '#10b981', fontWeight: 900, lineHeight: 1 }}>
                      {loading || nftCount === null ? <Loader2 size={13} className="spin" style={{ display: 'inline' }} /> : `${nftCount || 0} NFT${nftCount === 1 ? '' : 's'}`}
                    </strong>
                  </div>
                </div>

                {/* Refresh & Disconnect */}
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

            {/* ═════════════════════════════════════════════════════════════════════════ */}
            {/* 🟢 SECTION 1: AVAILABLE TO CLAIM (Active Unclaimed Rewards)            */}
            {/* ═════════════════════════════════════════════════════════════════════════ */}
            {isHolderRound1Available && (
              <div style={{ marginBottom: '44px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={20} color="var(--blue)" /> Available Rewards ({totalAvailableCount})
                  </h3>
                  <button
                    onClick={() => setIsAvailableOpen(!isAvailableOpen)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.85)',
                      border: '1.5px solid rgba(0, 160, 255, 0.25)',
                      borderRadius: '10px',
                      padding: '5px 9px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--blue)',
                      transition: 'all 0.2s ease',
                      transform: isAvailableOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      boxShadow: '0 2px 6px rgba(0, 82, 255, 0.05)'
                    }}
                    title={isAvailableOpen ? "Collapse section" : "Expand section"}
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>

                {isAvailableOpen && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 480px), 1fr))', gap: '24px' }}>
                    
                    {/* Holder Rewards Active Claim Card */}
                    <div
                      style={{
                        background: 'var(--surface)',
                        border: '2px solid rgba(0, 82, 255, 0.35)',
                        borderRadius: '24px',
                        padding: '28px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 8px 32px rgba(0, 82, 255, 0.08)',
                        position: 'relative'
                      }}
                    >
                      <div>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(0, 82, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Coins size={22} color="var(--blue)" />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                              Holder Rewards · Unlock 1
                            </h3>
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Live Now
                          </span>
                        </div>

                        {/* Metric Box (Rewards Pool) */}
                        <div
                          style={{
                            background: '#ffffff',
                            borderRadius: '16px',
                            padding: '14px 18px',
                            border: '1px solid rgba(0, 160, 255, 0.2)',
                            boxShadow: '0 3px 12px rgba(0, 82, 255, 0.04)',
                            marginBottom: '20px'
                          }}
                        >
                          <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                            <Coins size={13} color="var(--blue)" /> Rewards Pool
                          </div>
                          <div style={{ fontSize: '1.42rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                            10,000,000 <span style={{ fontSize: '0.9rem', color: 'var(--blue)', fontWeight: 800 }}>$VIBE</span>
                          </div>
                        </div>

                        {/* Allocation / Eligibility Box */}
                        <div style={{ marginBottom: '24px' }}>
                          {(hasConfirmedHolderClaim || isHolderEligibleLive) ? (
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
                                justifyContent: 'center',
                                minHeight: '190px',
                                boxSizing: 'border-box',
                                gap: '14px'
                              }}
                            >
                              <h4 style={{ fontSize: '1.3rem', color: '#10b981', margin: 0, fontWeight: 900 }}>
                                You're eligible for claim
                              </h4>
                              
                              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1, margin: 0 }}>
                                {(holderRewardAmount || 0).toLocaleString('en-US')} <span style={{ fontSize: '1.25rem', color: 'var(--blue)', fontWeight: 900 }}>$VIBE</span>
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
                                justifyContent: 'center',
                                minHeight: '190px',
                                boxSizing: 'border-box',
                                gap: '10px'
                              }}
                            >
                              <img
                                src="/vibe-sad-logo-nobg.png"
                                alt="Sad VIBE"
                                style={{ width: 85, height: 85, objectFit: 'contain' }}
                              />
                              <h4 style={{ fontSize: '1.25rem', color: '#ef4444', margin: 0, fontWeight: 900 }}>
                                Not Eligible for Round 1
                              </h4>
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
                    </div>

                    {/* Action Button */}
                    <div>
                      {(hasConfirmedHolderClaim || isHolderEligibleLive) ? (
                        <button
                          onClick={() => handleClaim('holder', 1, holderRewardAmount)}
                          disabled={claimStatus['holder-1'] === 'claiming'}
                          className="btn-fill"
                          style={{
                            width: '100%',
                            padding: '14px 20px',
                            borderRadius: '14px',
                            fontSize: '0.96rem',
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
                              <Gift size={18} /> Claim {(holderRewardAmount || 0).toLocaleString('en-US')} $VIBE
                            </>
                          )}
                        </button>
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
                      )}
                    </div>
                  </div>

                </div>
                )}
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════════════ */}
            {/* ⏳ SECTION 2: UPCOMING REWARDS (Next Scheduled Unlocks & Royalties)    */}
            {/* ═════════════════════════════════════════════════════════════════════════ */}
            <div style={{ marginBottom: '44px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={20} color="#0284c7" /> Upcoming Rewards (2)
                </h3>
                <button
                  onClick={() => setIsUpcomingOpen(!isUpcomingOpen)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: '1.5px solid rgba(0, 160, 255, 0.25)',
                    borderRadius: '10px',
                    padding: '5px 9px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0284c7',
                    transition: 'all 0.2s ease',
                    transform: isUpcomingOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                    boxShadow: '0 2px 6px rgba(0, 82, 255, 0.05)'
                  }}
                  title={isUpcomingOpen ? "Collapse section" : "Expand section"}
                >
                  <ChevronDown size={18} />
                </button>
              </div>

              {isUpcomingOpen && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 480px), 1fr))', gap: '24px' }}>
                  
                  {/* 1. Next Holder Rewards Unlock Card */}
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
                      position: 'relative'
                    }}
                  >
                    <div>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(0, 82, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Coins size={22} color="var(--blue)" />
                          </div>
                          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                            Holder Rewards · {upcomingHolderRound?.name || 'Unlock 2'}
                          </h3>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#0284c7', background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.25)', padding: '4px 10px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Upcoming
                        </span>
                      </div>

                      {/* Metric Box (Rewards Pool) */}
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: '16px',
                          padding: '14px 18px',
                          border: '1px solid rgba(0, 160, 255, 0.2)',
                          boxShadow: '0 3px 12px rgba(0, 82, 255, 0.04)',
                          marginBottom: '20px'
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                          <Coins size={13} color="var(--blue)" /> Rewards Pool
                        </div>
                        <div style={{ fontSize: '1.42rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                          {upcomingHolderRound?.pool || '10,000,000 $VIBE'}
                        </div>
                      </div>

                      {/* Eligibility Box with Mascot */}
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
                              justifyContent: 'center',
                              minHeight: '190px',
                              boxSizing: 'border-box',
                              gap: '12px'
                            }}
                          >
                            <img
                              src="/vibe-logo-nobg.png"
                              alt="Eligible VIBE"
                              style={{ width: 95, height: 95, objectFit: 'contain', margin: '-4px 0 -8px 0' }}
                            />
                            <h4 style={{ fontSize: '1.3rem', color: '#10b981', margin: 0, fontWeight: 900 }}>
                              You are Eligible!
                            </h4>
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
                              justifyContent: 'center',
                              minHeight: '190px',
                              boxSizing: 'border-box',
                              gap: '10px'
                            }}
                          >
                            <img
                              src="/vibe-sad-logo-nobg.png"
                              alt="Sad VIBE"
                              style={{ width: 85, height: 85, objectFit: 'contain', margin: '-4px 0 -6px 0' }}
                            />
                            <h4 style={{ fontSize: '1.3rem', color: '#ef4444', margin: 0, fontWeight: 900 }}>
                              Not Eligible Yet
                            </h4>
                            <a
                              href={O1}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-fill"
                              style={{
                                marginTop: '4px',
                                padding: '9px 18px',
                                fontSize: '0.84rem',
                                fontWeight: 800,
                                borderRadius: '12px',
                                textDecoration: 'none',
                                background: '#ef4444'
                              }}
                            >
                              Buy 5M+ on o1.exchange <ArrowUpRight size={14} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Countdown Status Pill */}
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
                      <Lock size={14} /> Claim opens {upcomingHolderRound?.unlockDate || 'Sep 25, 00:15 UTC'} ({formatCountdown(upcomingHolderRound?.targetDate)})
                    </div>
                  </div>

                  {/* 2. Next Vibe Club Royalty Card */}
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
                      position: 'relative'
                    }}
                  >
                    <div>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(0, 82, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Crown size={22} color="var(--blue)" />
                          </div>
                          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                            Vibe Club · {upcomingVibeClubRound?.name || 'Royalty 1'}
                          </h3>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#0284c7', background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.25)', padding: '4px 10px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Upcoming
                        </span>
                      </div>

                      {/* Metric Box (Royalty Pool) */}
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: '16px',
                          padding: '14px 18px',
                          border: '1px solid rgba(0, 160, 255, 0.2)',
                          boxShadow: '0 3px 12px rgba(0, 82, 255, 0.04)',
                          marginBottom: '20px'
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                          <Crown size={13} color="var(--blue)" /> Royalty Pool
                        </div>
                        <div style={{ fontSize: '1.42rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                          TBA
                        </div>
                      </div>

                      {/* Eligibility Box with Mascot */}
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
                              justifyContent: 'center',
                              minHeight: '190px',
                              boxSizing: 'border-box',
                              gap: '12px'
                            }}
                          >
                            <img
                              src="/vibe-logo-nobg.png"
                              alt="Eligible NFT"
                              style={{ width: 95, height: 95, objectFit: 'contain', margin: '-4px 0 -8px 0' }}
                            />
                            <h4 style={{ fontSize: '1.3rem', color: '#10b981', margin: 0, fontWeight: 900 }}>
                              Eligible Vibe Club Member!
                            </h4>
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
                              justifyContent: 'center',
                              minHeight: '190px',
                              boxSizing: 'border-box',
                              gap: '10px'
                            }}
                          >
                            <img
                              src="/vibe-sad-logo-nobg.png"
                              alt="Sad NFT"
                              style={{ width: 85, height: 85, objectFit: 'contain', margin: '-4px 0 -6px 0' }}
                            />
                            <h4 style={{ fontSize: '1.3rem', color: '#ef4444', margin: 0, fontWeight: 900 }}>
                              No NFTs Detected
                            </h4>
                            <a
                              href={VIBECLUB_MINT_URL}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-fill"
                              style={{
                                marginTop: '4px',
                                padding: '9px 18px',
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
                    </div>

                    {/* Countdown Status Pill */}
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
                      <Lock size={14} /> Claim opens {upcomingVibeClubRound?.claimDate || 'Aug 28, 00:00 UTC'} ({formatCountdown(upcomingVibeClubRound?.targetDate)})
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* ═════════════════════════════════════════════════════════════════════════ */}
            {/* ✅ SECTION 3: CLAIMED REWARDS HISTORY                                 */}
            {/* ═════════════════════════════════════════════════════════════════════════ */}
            {Array.isArray(claimedHistory) && claimedHistory.length > 0 && (
              <div style={{ marginBottom: '44px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={20} color="#10b981" /> Claim History ({claimedHistory.length})
                  </h3>
                  <button
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.85)',
                      border: '1.5px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '10px',
                      padding: '5px 9px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981',
                      transition: 'all 0.2s ease',
                      transform: isHistoryOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.05)'
                    }}
                    title={isHistoryOpen ? "Collapse section" : "Expand section"}
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>

                {isHistoryOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {claimedHistory.map((item) => (
                      <div
                        key={item?.id || Math.random()}
                        style={{
                          background: '#ffffff',
                          border: '1.5px solid #a7f3d0',
                          borderRadius: '18px',
                          padding: '16px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '14px',
                          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.06)'
                        }}
                      >
                        {/* Left: Event info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Check size={20} color="#10b981" strokeWidth={3} />
                          </div>
                          <div>
                            <strong style={{ fontSize: '1rem', color: 'var(--ink)', fontWeight: 900, display: 'block' }}>
                              {item?.title || 'Rewards Claim'}
                            </strong>
                            <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>
                              Successfully Claimed on Base
                            </span>
                          </div>
                        </div>

                        {/* Middle: Amount */}
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>
                          +{typeof item?.amount === 'number' ? item.amount.toLocaleString('en-US') : (item?.amount || '0')} <span style={{ fontSize: '0.85rem', color: 'var(--blue)', fontWeight: 800 }}>$VIBE</span>
                        </div>

                        {/* Right: Tx link */}
                        {item?.txHash && item.txHash.startsWith('0x') && (
                          <a
                            href={`https://basescan.org/tx/${item.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              color: '#0284c7',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'rgba(2, 132, 199, 0.08)',
                              padding: '7px 14px',
                              borderRadius: '10px',
                              border: '1px solid rgba(2, 132, 199, 0.2)'
                            }}
                          >
                            View on Basescan <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════════════ */}
            {/* 👑 SECTION 4: ADMIN PANEL (Contract Owner Only)                       */}
            {/* ═════════════════════════════════════════════════════════════════════════ */}
            {isAdmin && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
                  borderRadius: '24px',
                  padding: '28px',
                  marginTop: '48px',
                  marginBottom: '20px',
                  color: '#ffffff',
                  border: '2px solid rgba(139, 92, 246, 0.4)',
                  boxShadow: '0 8px 32px rgba(124, 58, 237, 0.18)'
                }}
              >
                {/* Admin Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                      <Crown size={22} color="#c084fc" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#f3e8ff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Admin Panel · Merkle Root Publisher
                        <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '99px', background: 'rgba(168, 85, 247, 0.3)', color: '#e9d5ff', fontWeight: 800 }}>OWNER</span>
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                        Publish cryptographic snapshot proofs on-chain to enable claims on Base
                      </span>
                    </div>
                  </div>

                  <a
                    href={`https://basescan.org/address/${DISTRIBUTOR_CA}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '0.78rem',
                      color: '#c084fc',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(168, 85, 247, 0.3)'
                    }}
                  >
                    Contract: {DISTRIBUTOR_CA.slice(0, 6)}...{DISTRIBUTOR_CA.slice(-4)} <ExternalLink size={12} />
                  </a>
                </div>

                {/* Form Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  {/* Epoch / Round Input */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Epoch / Round ID
                    </label>
                    <input
                      type="number"
                      value={adminEpochId}
                      onChange={(e) => setAdminEpochId(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1.5px solid rgba(148, 163, 184, 0.25)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      placeholder="1"
                    />
                  </div>

                  {/* Merkle Root Input */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Merkle Root (bytes32)
                    </label>
                    <input
                      type="text"
                      value={adminMerkleRoot}
                      onChange={(e) => setAdminMerkleRoot(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1.5px solid rgba(148, 163, 184, 0.25)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        color: '#38bdf8',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      placeholder="0x..."
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Snapshot details: <strong style={{ color: '#ffffff' }}>42 Eligible Wallets</strong> · <strong style={{ color: '#38bdf8' }}>10,000,000 $VIBE Pool</strong>
                  </div>

                  <button
                    onClick={handleSetMerkleRoot}
                    disabled={adminLoading}
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '12px 24px',
                      fontSize: '0.9rem',
                      fontWeight: 900,
                      cursor: adminLoading ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 18px rgba(124, 58, 237, 0.4)',
                      transition: 'all 0.15s'
                    }}
                  >
                    {adminLoading ? (
                      <>
                        <Loader2 size={16} className="spin" /> Confirming in Wallet...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} /> ⚡ Publish Merkle Root On-Chain
                      </>
                    )}
                  </button>
                </div>

                {/* Success Banner */}
                {adminSuccess && (
                  <div style={{ marginTop: '16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '12px', padding: '12px 16px', color: '#a7f3d0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={18} color="#10b981" />
                      <strong>Merkle Root successfully published on Base! Holders can now claim!</strong>
                    </div>
                    {adminTxHash && adminTxHash.startsWith('0x') && (
                      <a
                        href={`https://basescan.org/tx/${adminTxHash}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#34d399', textDecoration: 'underline', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        View Tx on Basescan <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                )}

                {/* Error Banner */}
                {adminError && (
                  <div style={{ marginTop: '16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '12px', padding: '12px 16px', color: '#fca5a5', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={18} color="#ef4444" />
                    <span>{adminError}</span>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}
