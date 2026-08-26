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
  ChevronDown,
  User
} from 'lucide-react';
import round1Data from './data/round_1_proofs.json';
import nftNames from './data/nftNames.json';

const CA = '0xb200000000000000000000df24ecb8bf51100a01';
const NFT_CA = '0x9E92307Dbec2d0aE4BBF14cA93E1cA00edC4b886';
const DISTRIBUTOR_CA = '0x77e04dd8c45725d2b2b3c8eebac2f3f1708fd089';
const ADMIN_WALLET = '0x4c91d3bed372c11795b9ce9a9017dfe447bf050a';
const O1 = 'https://launch.o1.exchange/token/0xb200000000000000000000df24ecb8bf51100a01?chain=8453';
const VIBECLUB_MINT_URL = 'https://vibeverse.dog/vibeclub';

const BUILDER_CODE = 'bc_wsbqqe2u';
// Official ERC-8021 Data Suffix for Base Builder Code bc_wsbqqe2u:
const BUILDER_CODE_HEX = '62635f77736271716532750b0080218021802180218021802180218021';

const MIN_HOLDER_BALANCE = 5000000; // 5M $VIBE

const DISTRIBUTOR_ABI = parseAbi([
  'function owner() view returns (address)',
  'function setMerkleRoot(uint256 epochId, bytes32 _merkleRoot) external',
  'function claim(uint256 epochId, uint256 amount, bytes32[] merkleProof) external',
  'function hasClaimed(uint256 epochId, address account) view returns (bool)',
  'function emergencyWithdraw(address token, uint256 amount) external'
]);

const HOLDER_ROUNDS = [
  { id: 1, name: 'Unlock 1', pool: '10,000,000 $VIBE', snapshotDate: 'Aug 26, 00:00 UTC', snapshotIso: '2026-08-26T00:00:00Z', unlockDate: 'Aug 26', targetDate: '2026-08-26T14:00:00Z' },
  { id: 2, name: 'Unlock 2', pool: '10,000,000 $VIBE', snapshotDate: 'Sep 25, 00:00 UTC', snapshotIso: '2026-09-25T00:00:00Z', unlockDate: 'Sep 25', targetDate: '2026-09-25T14:00:00Z' },
  { id: 3, name: 'Unlock 3', pool: '10,000,000 $VIBE', snapshotDate: 'Oct 25, 00:00 UTC', snapshotIso: '2026-10-25T00:00:00Z', unlockDate: 'Oct 25', targetDate: '2026-10-25T14:00:00Z' },
  { id: 4, name: 'Unlock 4', pool: '10,000,000 $VIBE', snapshotDate: 'Nov 24, 00:00 UTC', snapshotIso: '2026-11-24T00:00:00Z', unlockDate: 'Nov 24', targetDate: '2026-11-24T14:00:00Z' },
];

const VIBECLUB_ROUNDS = [
  { id: 1, name: 'Royalty 1', pool: 'TBA', snapshotDate: 'Aug 28, 00:00 UTC', snapshotIso: '2026-08-28T00:00:00Z', claimDate: 'Aug 28', targetDate: '2026-08-28T14:00:00Z' },
  { id: 2, name: 'Royalty 2', pool: 'TBA', snapshotDate: 'Sep 3, 00:00 UTC', snapshotIso: '2026-09-03T00:00:00Z', claimDate: 'Sep 3', targetDate: '2026-09-03T14:00:00Z' },
  { id: 3, name: 'Royalty 3', pool: 'TBA', snapshotDate: 'Sep 13, 00:00 UTC', snapshotIso: '2026-09-13T00:00:00Z', claimDate: 'Sep 13', targetDate: '2026-09-13T14:00:00Z' },
  { id: 4, name: 'Royalty 4', pool: 'TBA', snapshotDate: 'Sep 23, 00:00 UTC', snapshotIso: '2026-09-23T00:00:00Z', claimDate: 'Sep 23', targetDate: '2026-09-23T14:00:00Z' },
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

function formatDigitalCountdown(targetIso) {
  if (!targetIso) return '';
  try {
    const now = new Date().getTime();
    const target = new Date(targetIso).getTime();
    const diff = target - now;

    if (diff <= 0) return '00D:00H:00M';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    const pad = (n) => String(n).padStart(2, '0');

    return `${pad(days)}D:${pad(hours)}H:${pad(minutes)}M`;
  } catch (e) {
    return '';
  }
}

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

export default function Checker() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [balance, setBalance] = useState(null);
  const [nftCount, setNftCount] = useState(null);
  const [userNft, setUserNft] = useState(null);
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
  const [adminWithdrawAmount, setAdminWithdrawAmount] = useState('');
  const [adminBurnAmount, setAdminBurnAmount] = useState('');
  const [adminMetrics, setAdminMetrics] = useState({
    contractBalance: 0,
    claimedWalletsCount: 0,
    totalWalletsCount: 0,
    claimedTokens: 0,
    metricsLoading: false
  });
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

  // Smooth Scroll Helper
  const scrollToSection = (sectionId, setOpenState) => {
    if (setOpenState) setOpenState(true);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

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

  // Fetch user specific Vibe Club NFT for avatar & name
  const fetchUserNft = async (userAddress, count) => {
    if (!userAddress || !count || count <= 0) {
      setUserNft(null);
      return;
    }
    try {
      const client = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });
      const calls = [];
      const checkLimit = 120;
      for (let i = 1; i <= checkLimit; i++) {
        calls.push({
          address: NFT_CA,
          abi: parseAbi(['function ownerOf(uint256) view returns (address)']),
          functionName: 'ownerOf',
          args: [BigInt(i)]
        });
      }
      const results = await client.multicall({ contracts: calls, allowFailure: true });
      for (let i = 0; i < results.length; i++) {
        if (results[i].status === 'success' && results[i].result && results[i].result.toLowerCase() === userAddress.toLowerCase()) {
          const tokenId = i + 1;
          const name = nftNames[String(tokenId)] || `Vibe Club #${tokenId}`;
          setUserNft({
            id: tokenId,
            name,
            image: `/nft/images/${tokenId}.png`
          });
          return;
        }
      }
      setUserNft({
        id: 1,
        name: 'Vibe Club Member',
        image: '/new-logo-vibe.png'
      });
    } catch (err) {
      console.error("Error finding user NFT:", err);
      setUserNft(null);
    }
  };

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
      let currentNfts = 0;
      try {
        const nfts = await client.readContract({
          address: NFT_CA,
          abi: NFT_ABI,
          functionName: 'balanceOf',
          args: [address]
        });
        currentNfts = Number(nfts);
        setNftCount(currentNfts);
      } catch (nftErr) {
        const minted = await client.readContract({
          address: NFT_CA,
          abi: NFT_ABI,
          functionName: 'walletMintCount',
          args: [address]
        });
        currentNfts = Number(minted);
        setNftCount(currentNfts);
      }

      if (currentNfts > 0) {
        fetchUserNft(address, currentNfts);
      } else {
        setUserNft(null);
      }
    } catch (e) {
      console.error("Failed to read balances:", e);
      if (balance === null) setBalance(0);
      if (nftCount === null) setNftCount(0);
      setUserNft(null);
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

  // Fetch Admin Metrics on-chain
  const fetchAdminMetrics = async () => {
    try {
      setAdminMetrics(prev => ({ ...prev, metricsLoading: true }));
      const client = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });

      // 1. Live $VIBE balance of distributor contract
      const balWei = await client.readContract({
        address: CA,
        abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
        functionName: 'balanceOf',
        args: [DISTRIBUTOR_CA]
      });
      const contractBalance = Number(formatUnits(balWei, 18));

      // 2. Snapshot claims & claimed count
      const claims = Object.values(round1Data?.claims || {});
      const totalWalletsCount = claims.length;

      let claimedWalletsCount = 0;
      let claimedTokens = 0;

      if (totalWalletsCount > 0) {
        const calls = claims.map(c => ({
          address: DISTRIBUTOR_CA,
          abi: parseAbi(['function hasClaimed(uint256, address) view returns (bool)']),
          functionName: 'hasClaimed',
          args: [BigInt(adminEpochId || '1'), c.address]
        }));
        const results = await client.multicall({ contracts: calls, allowFailure: true });
        for (let i = 0; i < claims.length; i++) {
          if (results[i]?.status === 'success' && results[i]?.result === true) {
            claimedWalletsCount++;
            claimedTokens += (claims[i].amount || 0);
          }
        }
      }

      setAdminMetrics({
        contractBalance,
        claimedWalletsCount,
        totalWalletsCount,
        claimedTokens,
        metricsLoading: false
      });
    } catch (e) {
      console.error('Failed to fetch admin metrics:', e);
      setAdminMetrics(prev => ({ ...prev, metricsLoading: false }));
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminMetrics();
    }
  }, [isAdmin, adminEpochId]);

  // Generic Admin Transaction Sender (supports Smart Wallet batching & EOA)
  const sendAdminTx = async (to, data) => {
    const activeWallet = wallets.find(w => w.address.toLowerCase() === address?.toLowerCase()) || wallets[0];
    const provider = await activeWallet.getEthereumProvider();
    const calldata = data.includes(BUILDER_CODE_HEX) ? data : (data + BUILDER_CODE_HEX);

    try {
      const callsRes = await provider.request({
        method: 'wallet_sendCalls',
        params: [{
          version: '1.0',
          chainId: '0x2105',
          from: address,
          calls: [{ to, value: '0x0', data: calldata }],
          capabilities: { dataSuffix: { value: '0x' + BUILDER_CODE_HEX, optional: true } }
        }]
      });

      if (callsRes) {
        if (typeof callsRes === 'string' && callsRes.startsWith('0x') && callsRes.length === 66) {
          return callsRes;
        }
        const callId = typeof callsRes === 'object' ? (callsRes.id || callsRes) : callsRes;
        for (let i = 0; i < 30; i++) {
          await new Promise(r => setTimeout(r, 1000));
          try {
            const status = await provider.request({
              method: 'wallet_getCallsStatus',
              params: [callId]
            });
            if (status?.receipts?.[0]?.transactionHash) {
              return status.receipts[0].transactionHash;
            }
          } catch (e) {}
        }
        return typeof callId === 'string' ? callId : 'Confirmed';
      }
    } catch (errCalls) {
      console.warn('wallet_sendCalls not supported, falling back to eth_sendTransaction:', errCalls);
      return await provider.request({
        method: 'eth_sendTransaction',
        params: [{ from: address, to, data: calldata, value: '0x0' }]
      });
    }
  };

  // 1. Set Merkle Root Function
  const handleSetMerkleRoot = async () => {
    if (!wallets || wallets.length === 0) {
      setAdminError('No connected wallet detected.');
      return;
    }
    setAdminLoading(true);
    setAdminError('');
    setAdminSuccess(false);
    setAdminTxHash('');

    try {
      const calldata = encodeFunctionData({
        abi: DISTRIBUTOR_ABI,
        functionName: 'setMerkleRoot',
        args: [BigInt(adminEpochId || '1'), adminMerkleRoot]
      });
      const txHash = await sendAdminTx(DISTRIBUTOR_CA, calldata);
      setAdminTxHash(txHash || 'Confirmed');
      setAdminSuccess(true);
      setTimeout(fetchAdminMetrics, 3000);
    } catch (err) {
      console.error('Failed to set Merkle root:', err);
      setAdminError(err?.message || 'Failed to publish Merkle root.');
    } finally {
      setAdminLoading(false);
    }
  };

  // 2. Withdraw Tokens to Admin Wallet Function
  const handleWithdrawTokens = async () => {
    if (!wallets || wallets.length === 0) {
      setAdminError('No connected wallet detected.');
      return;
    }
    if (!adminWithdrawAmount || Number(adminWithdrawAmount) <= 0) {
      setAdminError('Please enter a valid amount of $VIBE to withdraw.');
      return;
    }
    setAdminLoading(true);
    setAdminError('');
    setAdminSuccess(false);
    setAdminTxHash('');

    try {
      const amountWei = parseUnits(adminWithdrawAmount.toString(), 18);
      const calldata = encodeFunctionData({
        abi: DISTRIBUTOR_ABI,
        functionName: 'emergencyWithdraw',
        args: [CA, amountWei]
      });
      const txHash = await sendAdminTx(DISTRIBUTOR_CA, calldata);
      setAdminTxHash(txHash || 'Confirmed');
      setAdminSuccess(true);
      setAdminWithdrawAmount('');
      setTimeout(fetchAdminMetrics, 3000);
    } catch (err) {
      console.error('Failed to withdraw tokens:', err);
      setAdminError(err?.message || 'Withdraw transaction failed.');
    } finally {
      setAdminLoading(false);
    }
  };

  // 3. Burn Unclaimed Tokens Function (withdraws to admin and burns to 0x0...dead)
  const handleBurnTokens = async () => {
    if (!wallets || wallets.length === 0) {
      setAdminError('No connected wallet detected.');
      return;
    }
    if (!adminBurnAmount || Number(adminBurnAmount) <= 0) {
      setAdminError('Please enter a valid amount of $VIBE to burn.');
      return;
    }
    setAdminLoading(true);
    setAdminError('');
    setAdminSuccess(false);
    setAdminTxHash('');

    try {
      const amountWei = parseUnits(adminBurnAmount.toString(), 18);
      
      // Step 1: Withdraw from distributor contract to admin
      const withdrawCalldata = encodeFunctionData({
        abi: DISTRIBUTOR_ABI,
        functionName: 'emergencyWithdraw',
        args: [CA, amountWei]
      });
      await sendAdminTx(DISTRIBUTOR_CA, withdrawCalldata);

      // Step 2: Transfer to Dead address
      const burnCalldata = encodeFunctionData({
        abi: parseAbi(['function transfer(address to, uint256 amount) returns (bool)']),
        functionName: 'transfer',
        args: ['0x000000000000000000000000000000000000dead', amountWei]
      });
      const txHash = await sendAdminTx(CA, burnCalldata);

      setAdminTxHash(txHash || 'Confirmed');
      setAdminSuccess(true);
      setAdminBurnAmount('');
      setTimeout(fetchAdminMetrics, 3000);
    } catch (err) {
      console.error('Failed to burn tokens:', err);
      setAdminError(err?.message || 'Burn transaction failed.');
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
        const calldataRaw = encodeFunctionData({
          abi: DISTRIBUTOR_ABI,
          functionName: 'claim',
          args: [BigInt(roundId), amountWei, userProofData.proof]
        });
        // Append Official ERC-8021 Data Suffix for Base Builder Code
        const calldata = calldataRaw.includes(BUILDER_CODE_HEX) ? calldataRaw : (calldataRaw + BUILDER_CODE_HEX);

        try {
          const callsRes = await provider.request({
            method: 'wallet_sendCalls',
            params: [{
              version: '1.0',
              chainId: '0x2105',
              from: address,
              calls: [{ to: DISTRIBUTOR_CA, value: '0x0', data: calldata }],
              capabilities: {
                dataSuffix: {
                  value: '0x' + BUILDER_CODE_HEX,
                  optional: true
                }
              }
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
            
            {/* 👤 FULL STYLISH WEB3 USER DASHBOARD */}
            <div className="checker-user-card">
              {/* Top Hero Row: Big Avatar + Name (Left) & Wallet / Actions (Right) */}
              <div className="checker-profile-header">
                {/* Left: Big Avatar + Name + Badge (Matched in height) */}
                <div className="checker-profile-avatar-info">
                  {/* Big Avatar Container */}
                  <div
                    className="checker-avatar-box"
                    style={{
                      border: userNft ? '3px solid var(--blue)' : '2.5px solid #cbd5e1',
                      background: userNft ? '#ffffff' : '#f1f5f9',
                      boxShadow: userNft ? '0 8px 24px rgba(0, 82, 255, 0.2)' : '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  >
                    {userNft ? (
                      <img
                        src={userNft.image}
                        alt={userNft.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = '/new-logo-vibe.png'; }}
                      />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#94a3b8' }}>
                        <User size={36} color="#64748b" />
                      </div>
                    )}
                  </div>

                  {/* Name (Top) & Vibe Club Member Badge (Bottom) */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      gap: '2px',
                      minWidth: 0
                    }}
                  >
                    <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>
                      Profile:
                    </div>
                    <h3 className="checker-profile-name">
                      {userNft ? userNft.name : 'Unknown Dog'}
                    </h3>

                    <div>
                      {userNft ? (
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: '#10b981',
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1.5px solid rgba(16, 185, 129, 0.28)',
                            padding: '2px 10px',
                            borderRadius: '99px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            lineHeight: 1.2
                          }}
                        >
                          Vibe Club Member
                        </span>
                      ) : (
                        <a
                          href={VIBECLUB_MINT_URL}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: '#059669',
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1.5px solid rgba(16, 185, 129, 0.3)',
                            padding: '2px 10px',
                            borderRadius: '99px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            lineHeight: 1.2,
                            textDecoration: 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          Join Vibe Club ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Wallet Address Pill + Actions */}
                <div className="checker-actions-header">
                  {/* Connected Wallet Address Pill */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid rgba(0, 140, 255, 0.2)',
                      borderRadius: '14px',
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(0, 82, 255, 0.03)'
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.90rem', color: 'var(--ink)', fontWeight: 600 }}>
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                    </span>
                    <button
                      onClick={copyAddress}
                      title="Copy Address"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: copied ? '#10b981' : 'var(--blue)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px',
                        marginLeft: '2px'
                      }}
                    >
                      {copied ? <Check size={15} strokeWidth={2.5} /> : <Copy size={15} />}
                    </button>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="checker-buttons-row">
                    {/* Refresh Button */}
                    <button
                      onClick={fetchBalances}
                      disabled={loading}
                      title="Refresh On-Chain Balances"
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid rgba(0, 140, 255, 0.22)',
                        padding: '10px 14px',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        color: 'var(--blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(0, 82, 255, 0.04)',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <RefreshCw size={15} className={loading ? 'spin' : ''} />
                      <span>Refresh</span>
                    </button>

                    {/* Disconnect Button */}
                    <button
                      onClick={logout}
                      style={{
                        background: 'rgba(239, 68, 68, 0.06)',
                        border: '1.5px solid rgba(239, 68, 68, 0.22)',
                        color: '#ef4444',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        padding: '10px 18px',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>

              {/* Dashboard Metric & Quick-Nav Tiles Grid (5 Columns in Single Row) */}
              <div className="dashboard-metrics-5">
                {/* 1. $VIBE Balance Tile */}
                <div
                  className="checker-metric-tile"
                  style={{
                    border: '1.5px solid rgba(0, 140, 255, 0.2)'
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', whiteSpace: 'nowrap' }}>
                    $VIBE Balance
                  </div>
                  <div>
                    <div style={{ fontSize: '1.20rem', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.15, marginBottom: '4px', whiteSpace: 'nowrap' }}>
                      {loading || balance === null ? <Loader2 size={15} className="spin" /> : formatCompactBalance(balance)}
                    </div>
                    <div className="checker-tile-eligibility" style={{ fontSize: '0.67rem', color: isHolderEligibleLive ? '#10b981' : '#ef4444', fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>
                      {isHolderEligibleLive ? '✓ Eligible for Holder Rewards' : 'Not Eligible for Holder Rewards'}
                    </div>
                  </div>
                </div>

                {/* 2. Vibe Club Member Tile */}
                <div
                  className="checker-metric-tile"
                  style={{
                    border: '1.5px solid rgba(16, 185, 129, 0.24)'
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', whiteSpace: 'nowrap' }}>
                    Vibe Club Member
                  </div>
                  <div>
                    <div style={{ fontSize: '1.20rem', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.15, marginBottom: '4px', whiteSpace: 'nowrap' }}>
                      {loading || nftCount === null ? <Loader2 size={15} className="spin" /> : `${nftCount || 0} NFT${nftCount === 1 ? '' : 's'}`}
                    </div>
                    <div className="checker-tile-eligibility" style={{ fontSize: '0.67rem', color: (nftCount && nftCount > 0) ? '#10b981' : '#ef4444', fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>
                      {(nftCount && nftCount > 0) ? '✓ Eligible for NFT Royalties' : 'Not Eligible for NFT Royalties'}
                    </div>
                  </div>
                </div>

                {/* 3. Available Rewards Quick-Nav Tile */}
                <div
                  onClick={() => scrollToSection('available-rewards-section', setIsAvailableOpen)}
                  className="checker-metric-tile"
                  style={{
                    border: isHolderRound1Available ? '1.5px solid rgba(0, 140, 255, 0.35)' : '1.5px solid rgba(0, 140, 255, 0.18)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', whiteSpace: 'nowrap' }}>
                    Available Rewards
                  </div>
                  <div>
                    <div style={{ fontSize: '1.20rem', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.15, marginBottom: '4px', whiteSpace: 'nowrap' }}>
                      {totalAvailableCount} Available
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                      <span>Claim Rewards</span> ↓
                    </div>
                  </div>
                </div>

                {/* 4. Upcoming Rewards Quick-Nav Tile */}
                <div
                  onClick={() => scrollToSection('upcoming-rewards-section', setIsUpcomingOpen)}
                  className="checker-metric-tile"
                  style={{
                    border: '1.5px solid rgba(0, 140, 255, 0.18)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', whiteSpace: 'nowrap' }}>
                    Upcoming Unlocks
                  </div>
                  <div>
                    <div style={{ fontSize: '1.20rem', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.15, marginBottom: '4px', whiteSpace: 'nowrap' }}>
                      2 Upcoming
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                      <span>View Schedule</span> ↓
                    </div>
                  </div>
                </div>

                {/* 5. Claim History Quick-Nav Tile */}
                <div
                  onClick={() => scrollToSection('claimed-rewards-section', setIsHistoryOpen)}
                  className="checker-metric-tile"
                  style={{
                    border: '1.5px solid rgba(16, 185, 129, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', whiteSpace: 'nowrap' }}>
                    Claim History
                  </div>
                  <div>
                    <div style={{ fontSize: '1.20rem', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.15, marginBottom: '4px', whiteSpace: 'nowrap' }}>
                      {claimedHistory?.length || 0} Claimed
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                      <span>View History</span> ↓
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════════════════ */}
            {/* 🟢 SECTION 1: AVAILABLE TO CLAIM (Active Unclaimed Rewards)            */}
            {/* ═════════════════════════════════════════════════════════════════════════ */}
            <div id="available-rewards-section" style={{ marginBottom: '40px' }}>
              {/* Section Header (Outside Panel) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
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
                    display: 'inline-flex',
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
                <div className="checker-section-panel">
                  {isHolderRound1Available ? (
                    <div className="rewards-grid-2">
                      
                      {/* Holder Rewards Active Claim Card */}
                      <div
                        className="checker-reward-card"
                        style={{
                          border: '2px solid var(--blue)',
                          boxShadow: '0 10px 32px rgba(0, 82, 255, 0.12), 0 2px 6px rgba(0, 0, 0, 0.03)',
                          position: 'relative'
                        }}
                      >
                        <div>
                          {/* Header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                              <img
                                src="/new-logo-vibe.png"
                                alt="VIBE"
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  border: '2px solid var(--blue)',
                                  boxShadow: '0 2px 8px rgba(0, 82, 255, 0.15)',
                                  flexShrink: 0
                                }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                                  Holder Rewards
                                </h4>
                                <span style={{ fontSize: '0.66rem', fontWeight: 800, background: 'rgba(0, 82, 255, 0.08)', color: 'var(--blue)', border: '1px solid rgba(0, 82, 255, 0.2)', padding: '2px 7px', borderRadius: '99px', lineHeight: 1.2, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                                  Unlock 1
                                </span>
                              </div>
                            </div>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '99px',
                                fontSize: '0.66rem',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                background: '#ecfdf5',
                                color: '#059669',
                                border: '1px solid #a7f3d0',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', flexShrink: 0 }} />
                              Claim Live
                            </span>
                          </div>

                          {/* Metric Box (Rewards Pool) */}
                          <div
                            style={{
                              background: '#f8fafc',
                              borderRadius: '16px',
                              padding: '12px 16px',
                              border: '1px solid rgba(0, 140, 255, 0.18)',
                              boxShadow: '0 2px 8px rgba(0, 82, 255, 0.03)',
                              marginBottom: '14px'
                            }}
                          >
                            <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                              <Coins size={12} color="var(--blue)" /> Rewards Pool
                            </div>
                            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                              10,000,000 <span style={{ fontSize: '0.86rem', color: 'var(--blue)', fontWeight: 800 }}>$VIBE</span>
                            </div>
                          </div>

                          {/* Allocation / Eligibility Box */}
                          <div style={{ marginBottom: '18px' }}>
                            {(hasConfirmedHolderClaim || isHolderEligibleLive) ? (
                              <div
                                style={{
                                  background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                                  border: '1.5px solid #a7f3d0',
                                  borderRadius: '18px',
                                  padding: '16px 14px',
                                  textAlign: 'center',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  minHeight: '145px',
                                  boxSizing: 'border-box',
                                  gap: '8px'
                                }}
                              >
                                <h5 style={{ fontSize: '1.10rem', color: '#10b981', margin: 0, fontWeight: 900 }}>
                                  You're eligible for claim
                                </h5>
                                
                                <div style={{ fontSize: '2.0rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1, margin: 0 }}>
                                  {(holderRewardAmount || 0).toLocaleString('en-US')} <span style={{ fontSize: '1.0rem', color: 'var(--blue)', fontWeight: 900 }}>$VIBE</span>
                                </div>
                              </div>
                            ) : (
                              <div
                                style={{
                                  background: '#fef2f2',
                                  border: '1.5px solid #fecaca',
                                  borderRadius: '18px',
                                  padding: '16px 14px',
                                  textAlign: 'center',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  minHeight: '145px',
                                  boxSizing: 'border-box',
                                  gap: '8px'
                                }}
                              >
                                <img
                                  src="/vibe-sad-logo-nobg.png"
                                  alt="Sad VIBE"
                                  style={{ width: 70, height: 70, objectFit: 'contain' }}
                                />
                                <h5 style={{ fontSize: '1.05rem', color: '#ef4444', margin: 0, fontWeight: 900 }}>
                                  Not Eligible for Round 1
                                </h5>
                                <a
                                  href={O1}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: '#ef4444',
                                    color: '#ffffff',
                                    padding: '7px 14px',
                                    borderRadius: '10px',
                                    fontSize: '0.78rem',
                                    fontWeight: 800,
                                    textDecoration: 'none'
                                  }}
                                >
                                  Buy & Hold 5M+ $VIBE <ArrowUpRight size={13} />
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
                                padding: '12px 18px',
                                borderRadius: '12px',
                                fontSize: '0.90rem',
                                fontWeight: 900,
                                justifyContent: 'center',
                                boxShadow: '0 4px 18px rgba(0, 82, 255, 0.32)',
                                cursor: 'pointer'
                              }}
                            >
                              {claimStatus['holder-1'] === 'claiming' ? (
                                <>
                                  <Loader2 size={16} className="spin" /> Confirming Claim...
                                </>
                              ) : (
                                <>
                                  <Gift size={16} /> Claim {(holderRewardAmount || 0).toLocaleString('en-US')} $VIBE
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              disabled
                              style={{
                                width: '100%',
                                padding: '11px 16px',
                                borderRadius: '12px',
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                color: '#94a3b8',
                                fontWeight: 800,
                                fontSize: '0.84rem',
                                cursor: 'not-allowed'
                              }}
                            >
                              Not Eligible for this Round
                            </button>
                          )}

                          {/* Claim window ends caption with countdown */}
                          <div
                            style={{
                              marginTop: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              fontSize: '0.74rem',
                              color: '#64748b',
                              fontWeight: 700
                            }}
                          >
                            <Clock size={12} color="#64748b" />
                            <span>Claim window ends:</span>
                            <span
                              style={{
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                fontSize: '0.74rem',
                                fontWeight: 900,
                                color: '#0284c7',
                                background: 'rgba(2, 132, 199, 0.08)',
                                border: '1px solid rgba(2, 132, 199, 0.2)',
                                padding: '2px 6px',
                                borderRadius: '6px',
                                letterSpacing: '0.03em'
                              }}
                            >
                              {formatDigitalCountdown(upcomingHolderRound?.targetDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid rgba(0, 140, 255, 0.22)',
                        borderRadius: '18px',
                        padding: '24px 20px',
                        textAlign: 'center',
                        color: '#64748b',
                        fontSize: '0.90rem',
                        fontWeight: 700,
                        boxShadow: '0 4px 16px rgba(0, 82, 255, 0.04)'
                      }}
                    >
                      No active claims available right now. Check upcoming rewards below.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ═════════════════════════════════════════════════════════════════════════ */}
            {/* ⏳ SECTION 2: UPCOMING REWARDS (Next Scheduled Unlocks & Royalties)    */}
            {/* ═════════════════════════════════════════════════════════════════════════ */}
            <div id="upcoming-rewards-section" style={{ marginBottom: '40px' }}>
              {/* Section Header (Outside Panel) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
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
                    display: 'inline-flex',
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
                <div className="checker-section-panel">
                  <div className="rewards-grid-2">
                    
                    {/* 1. Next Holder Rewards Unlock Card */}
                    <div
                      className="checker-reward-card"
                      style={{
                        border: '1.5px solid rgba(0, 160, 255, 0.25)',
                        boxShadow: '0 6px 24px rgba(0, 82, 255, 0.06), 0 2px 6px rgba(0, 0, 0, 0.03)',
                        position: 'relative'
                      }}
                    >
                      <div>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <img
                              src="/new-logo-vibe.png"
                              alt="VIBE"
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '1.5px solid rgba(0, 160, 255, 0.3)',
                                boxShadow: '0 2px 8px rgba(0, 82, 255, 0.15)',
                                flexShrink: 0
                              }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                                Holder Rewards
                              </h4>
                              <span style={{ fontSize: '0.66rem', fontWeight: 800, background: 'rgba(0, 82, 255, 0.08)', color: 'var(--blue)', border: '1px solid rgba(0, 82, 255, 0.2)', padding: '2px 7px', borderRadius: '99px', lineHeight: 1.2, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                                {upcomingHolderRound?.name || 'Unlock 1'}
                              </span>
                            </div>
                          </div>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '99px',
                              fontSize: '0.66rem',
                              fontWeight: 900,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              background: 'rgba(255, 255, 255, 0.9)',
                              color: '#64748b',
                              border: '1px solid rgba(0, 160, 255, 0.25)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                            }}
                          >
                            <Lock size={11} color="#64748b" style={{ flexShrink: 0 }} />
                            Locked
                          </span>
                        </div>

                        {/* Metric Box (Rewards Pool) */}
                        <div
                          style={{
                            background: '#f8fafc',
                            borderRadius: '16px',
                            padding: '12px 16px',
                            border: '1px solid rgba(0, 140, 255, 0.18)',
                            boxShadow: '0 2px 8px rgba(0, 82, 255, 0.03)',
                            marginBottom: '14px'
                          }}
                        >
                          <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                            <Coins size={12} color="var(--blue)" /> Rewards Pool
                          </div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                            {upcomingHolderRound?.pool || '10,000,000 $VIBE'}
                          </div>
                        </div>

                        {/* Eligibility Box with Mascot */}
                        <div style={{ marginBottom: '18px' }}>
                          {isHolderEligibleLive ? (
                            <div
                              style={{
                                background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                                border: '1.5px solid #a7f3d0',
                                borderRadius: '18px',
                                padding: '16px 14px',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '145px',
                                boxSizing: 'border-box',
                                gap: '6px'
                              }}
                            >
                              <img
                                src="/vibe-logo-nobg.png"
                                alt="Eligible VIBE"
                                style={{ width: 72, height: 72, objectFit: 'contain', margin: '-2px 0' }}
                              />
                              <h5 style={{ fontSize: '1.10rem', color: '#10b981', margin: 0, fontWeight: 900 }}>
                                You are Eligible!
                              </h5>
                            </div>
                          ) : (
                            <div
                              style={{
                                background: '#fef2f2',
                                border: '1.5px solid #fecaca',
                                borderRadius: '18px',
                                padding: '16px 14px',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '145px',
                                boxSizing: 'border-box',
                                gap: '6px'
                              }}
                            >
                              <img
                                src="/vibe-sad-logo-nobg.png"
                                alt="Sad VIBE"
                                style={{ width: 68, height: 68, objectFit: 'contain', margin: '-2px 0' }}
                              />
                              <h5 style={{ fontSize: '1.05rem', color: '#ef4444', margin: 0, fontWeight: 900 }}>
                                Not Eligible Yet
                              </h5>
                              <a
                                href={O1}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-fill"
                                style={{
                                  marginTop: '2px',
                                  padding: '7px 14px',
                                  fontSize: '0.78rem',
                                  fontWeight: 800,
                                  borderRadius: '10px',
                                  textDecoration: 'none',
                                  background: '#ef4444'
                                }}
                              >
                                Buy & Hold 5M+ $VIBE <ArrowUpRight size={13} />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Countdown Status Pill */}
                      <div
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '12px',
                          background: '#f8fafc',
                          border: '1.5px solid rgba(0, 140, 255, 0.18)',
                          color: '#475569',
                          fontWeight: 800,
                          fontSize: '0.84rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxSizing: 'border-box'
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '0.80rem', whiteSpace: 'nowrap' }}>
                          <Lock size={13} /> Claim opens {upcomingHolderRound?.unlockDate || 'Sep 25'}
                        </span>
                        <span
                          style={{
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            fontSize: '0.76rem',
                            fontWeight: 900,
                            background: 'rgba(0, 82, 255, 0.08)',
                            color: 'var(--blue)',
                            border: '1px solid rgba(0, 82, 255, 0.2)',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            letterSpacing: '0.03em',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {formatDigitalCountdown(upcomingHolderRound?.targetDate)}
                        </span>
                      </div>

                      {/* Snapshot Status Caption */}
                      <div
                        style={{
                          marginTop: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '0.74rem',
                          color: '#64748b',
                          fontWeight: 700
                        }}
                      >
                        {currentTime >= new Date(upcomingHolderRound?.snapshotIso) ? (
                          <>
                            <Check size={12} color="#10b981" strokeWidth={3} />
                            <span>Snapshot taken: {upcomingHolderRound?.snapshotDate || 'Aug 26, 00:00 UTC'}</span>
                          </>
                        ) : (
                          <>
                            <Clock size={12} color="#64748b" />
                            <span>Snapshot date: {upcomingHolderRound?.snapshotDate || 'Aug 26, 00:00 UTC'}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 2. Next Vibe Club Royalty Card */}
                    <div
                      className="checker-reward-card"
                      style={{
                        border: '1.5px solid rgba(0, 160, 255, 0.25)',
                        boxShadow: '0 6px 24px rgba(0, 82, 255, 0.06), 0 2px 6px rgba(0, 0, 0, 0.03)',
                        position: 'relative'
                      }}
                    >
                      <div>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'rgba(0, 82, 255, 0.1)',
                                border: '1.5px solid rgba(0, 160, 255, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0, 82, 255, 0.15)',
                                flexShrink: 0
                              }}
                            >
                              <Crown size={17} color="var(--blue)" />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                                Vibe Club
                              </h4>
                              <span style={{ fontSize: '0.66rem', fontWeight: 800, background: 'rgba(0, 82, 255, 0.08)', color: 'var(--blue)', border: '1px solid rgba(0, 82, 255, 0.2)', padding: '2px 7px', borderRadius: '99px', lineHeight: 1.2, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                                {upcomingVibeClubRound?.name || 'Royalty 1'}
                              </span>
                            </div>
                          </div>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '99px',
                              fontSize: '0.66rem',
                              fontWeight: 900,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              background: 'rgba(255, 255, 255, 0.9)',
                              color: '#64748b',
                              border: '1px solid rgba(0, 160, 255, 0.25)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                            }}
                          >
                            <Lock size={11} color="#64748b" style={{ flexShrink: 0 }} />
                            Locked
                          </span>
                        </div>

                        {/* Metric Box (Royalty Pool) */}
                        <div
                          style={{
                            background: '#f8fafc',
                            borderRadius: '16px',
                            padding: '12px 16px',
                            border: '1px solid rgba(0, 140, 255, 0.18)',
                            boxShadow: '0 2px 8px rgba(0, 82, 255, 0.03)',
                            marginBottom: '14px'
                          }}
                        >
                          <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                            <Crown size={12} color="var(--blue)" /> Royalty Pool
                          </div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                            TBA
                          </div>
                        </div>

                        {/* Eligibility Box with Mascot */}
                        <div style={{ marginBottom: '18px' }}>
                          {isVibeClubEligible ? (
                            <div
                              style={{
                                background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                                border: '1.5px solid #a7f3d0',
                                borderRadius: '18px',
                                padding: '16px 14px',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '145px',
                                boxSizing: 'border-box',
                                gap: '6px'
                              }}
                            >
                              <img
                                src="/vibe-logo-nobg.png"
                                alt="Eligible NFT"
                                style={{ width: 72, height: 72, objectFit: 'contain', margin: '-2px 0' }}
                              />
                              <h5 style={{ fontSize: '1.10rem', color: '#10b981', margin: 0, fontWeight: 900 }}>
                                Eligible Member!
                              </h5>
                            </div>
                          ) : (
                            <div
                              style={{
                                background: '#fef2f2',
                                border: '1.5px solid #fecaca',
                                borderRadius: '18px',
                                padding: '16px 14px',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '145px',
                                boxSizing: 'border-box',
                                gap: '6px'
                              }}
                            >
                              <img
                                src="/vibe-sad-logo-nobg.png"
                                alt="Sad VIBE"
                                style={{ width: 68, height: 68, objectFit: 'contain', margin: '-2px 0' }}
                              />
                              <h5 style={{ fontSize: '1.05rem', color: '#ef4444', margin: 0, fontWeight: 900 }}>
                                Not Eligible Yet
                              </h5>
                              <a
                                href={VIBECLUB_MINT_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-fill"
                                style={{
                                  marginTop: '2px',
                                  padding: '7px 14px',
                                  fontSize: '0.78rem',
                                  fontWeight: 800,
                                  borderRadius: '10px',
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
                          padding: '11px 14px',
                          borderRadius: '12px',
                          background: '#f8fafc',
                          border: '1.5px solid rgba(0, 140, 255, 0.18)',
                          color: '#475569',
                          fontWeight: 800,
                          fontSize: '0.84rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxSizing: 'border-box'
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '0.80rem', whiteSpace: 'nowrap' }}>
                          <Lock size={13} /> Claim opens {upcomingVibeClubRound?.claimDate || 'Aug 28'}
                        </span>
                        <span
                          style={{
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            fontSize: '0.76rem',
                            fontWeight: 900,
                            background: 'rgba(0, 82, 255, 0.08)',
                            color: 'var(--blue)',
                            border: '1px solid rgba(0, 82, 255, 0.2)',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            letterSpacing: '0.03em',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {formatDigitalCountdown(upcomingVibeClubRound?.targetDate)}
                        </span>
                      </div>

                      {/* Snapshot Status Caption */}
                      <div
                        style={{
                          marginTop: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '0.74rem',
                          color: '#64748b',
                          fontWeight: 700
                        }}
                      >
                        {currentTime >= new Date(upcomingVibeClubRound?.snapshotIso) ? (
                          <>
                            <Check size={12} color="#10b981" strokeWidth={3} />
                            <span>Snapshot taken: {upcomingVibeClubRound?.snapshotDate || 'Aug 28, 00:00 UTC'}</span>
                          </>
                        ) : (
                          <>
                            <Clock size={12} color="#64748b" />
                            <span>Snapshot date: {upcomingVibeClubRound?.snapshotDate || 'Aug 28, 00:00 UTC'}</span>
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* ═════════════════════════════════════════════════════════════════════════ */}
            {/* ✅ SECTION 3: CLAIMED REWARDS HISTORY                                 */}
            {/* ═════════════════════════════════════════════════════════════════════════ */}
            <div id="claimed-rewards-section" style={{ marginBottom: '40px' }}>
              {/* Section Header (Outside Panel) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={20} color="#10b981" /> Claimed Rewards ({claimedHistory?.length || 0})
                </h3>
                <button
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: '1.5px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '10px',
                    padding: '5px 9px',
                    cursor: 'pointer',
                    display: 'inline-flex',
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
                <div className="checker-section-panel">
                  {Array.isArray(claimedHistory) && claimedHistory.length > 0 ? (
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
                                border: '1px solid rgba(2, 132, 199, 0.2)',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              View on Basescan <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '18px',
                        padding: '24px 20px',
                        textAlign: 'center',
                        color: '#64748b',
                        fontSize: '0.90rem',
                        fontWeight: 700,
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.04)'
                      }}
                    >
                      No claimed rewards yet. Check available rewards above to claim.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ═════════════════════════════════════════════════════════════════════════ */}
            {/* SECTION 4: ADMIN PANEL (Contract Owner Only)                          */}
            {/* ═════════════════════════════════════════════════════════════════════════ */}
            {isAdmin && (
              <div
                style={{
                  background: '#0f172a',
                  borderRadius: '20px',
                  padding: '24px',
                  marginTop: '40px',
                  marginBottom: '20px',
                  color: '#ffffff',
                  border: '1px solid #1e293b',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '20px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                    Admin Panel
                  </h3>
                  <a
                    href={`https://basescan.org/address/${DISTRIBUTOR_CA}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '0.78rem',
                      color: '#94a3b8',
                      textDecoration: 'none',
                      fontFamily: 'monospace',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    Contract: {DISTRIBUTOR_CA.slice(0, 6)}...{DISTRIBUTOR_CA.slice(-4)} ↗
                  </a>
                </div>

                {/* 4. Live Metrics */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                    marginBottom: '24px'
                  }}
                >
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '14px 16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.70rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '4px' }}>
                      Contract $VIBE Balance
                    </div>
                    <div style={{ fontSize: '1.20rem', fontWeight: 800, color: '#38bdf8' }}>
                      {adminMetrics.metricsLoading ? '...' : (adminMetrics.contractBalance || 0).toLocaleString('en-US') + ' $VIBE'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '14px 16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.70rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '4px' }}>
                      Wallets Claimed
                    </div>
                    <div style={{ fontSize: '1.20rem', fontWeight: 800, color: '#10b981' }}>
                      {adminMetrics.metricsLoading ? '...' : `${adminMetrics.claimedWalletsCount} / ${adminMetrics.totalWalletsCount}`}
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginLeft: '6px' }}>
                        ({adminMetrics.totalWalletsCount > 0 ? ((adminMetrics.claimedWalletsCount / adminMetrics.totalWalletsCount) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '14px 16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.70rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '4px' }}>
                      Total Claimed
                    </div>
                    <div style={{ fontSize: '1.20rem', fontWeight: 800, color: '#f8fafc' }}>
                      {adminMetrics.metricsLoading ? '...' : (adminMetrics.claimedTokens || 0).toLocaleString('en-US') + ' $VIBE'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '14px 16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.70rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '4px' }}>
                      Unclaimed in Round
                    </div>
                    <div style={{ fontSize: '1.20rem', fontWeight: 800, color: '#fbbf24' }}>
                      {adminMetrics.metricsLoading ? '...' : Math.max(0, 10000000 - (adminMetrics.claimedTokens || 0)).toLocaleString('en-US') + ' $VIBE'}
                    </div>
                  </div>
                </div>

                {/* 1. Set Merkle Root */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', marginBottom: '12px' }}>
                    1. Publish Merkle Root Proof
                  </div>
                  <div className="admin-action-row" style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={adminEpochId}
                      onChange={(e) => setAdminEpochId(e.target.value)}
                      placeholder="Round"
                      style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(148, 163, 184, 0.25)',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <input
                      type="text"
                      value={adminMerkleRoot}
                      onChange={(e) => setAdminMerkleRoot(e.target.value)}
                      placeholder="0x... Merkle Root"
                      style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(148, 163, 184, 0.25)',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        color: '#38bdf8',
                        fontFamily: 'monospace',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      onClick={handleSetMerkleRoot}
                      disabled={adminLoading}
                      style={{
                        background: 'var(--blue)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 18px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: adminLoading ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {adminLoading ? 'Processing...' : 'Set Merkle Root'}
                    </button>
                  </div>
                </div>

                {/* 2. Withdraw Tokens to Admin Wallet */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', marginBottom: '12px' }}>
                    2. Withdraw Tokens to Admin Wallet
                  </div>
                  <div className="admin-action-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        value={adminWithdrawAmount}
                        onChange={(e) => setAdminWithdrawAmount(e.target.value)}
                        placeholder="Amount in $VIBE (e.g. 10000000)"
                        style={{
                          width: '100%',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(148, 163, 184, 0.25)',
                          borderRadius: '10px',
                          padding: '10px 65px 10px 14px',
                          color: '#ffffff',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        onClick={() => setAdminWithdrawAmount(String(adminMetrics.contractBalance || 0))}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#94a3b8',
                          fontSize: '0.70rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        MAX
                      </button>
                    </div>
                    <button
                      onClick={handleWithdrawTokens}
                      disabled={adminLoading}
                      style={{
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 18px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: adminLoading ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {adminLoading ? 'Processing...' : 'Withdraw to Admin'}
                    </button>
                  </div>
                </div>

                {/* 3. Burn Unclaimed Tokens */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', marginBottom: '12px' }}>
                    3. Burn Unclaimed Tokens (Send to Dead Address)
                  </div>
                  <div className="admin-action-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        value={adminBurnAmount}
                        onChange={(e) => setAdminBurnAmount(e.target.value)}
                        placeholder="Amount in $VIBE to burn"
                        style={{
                          width: '100%',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(148, 163, 184, 0.25)',
                          borderRadius: '10px',
                          padding: '10px 110px 10px 14px',
                          color: '#ffffff',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        onClick={() => setAdminBurnAmount(String(Math.max(0, 10000000 - (adminMetrics.claimedTokens || 0))))}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          fontSize: '0.70rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        ALL UNCLAIMED
                      </button>
                    </div>
                    <button
                      onClick={handleBurnTokens}
                      disabled={adminLoading}
                      style={{
                        background: '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 18px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: adminLoading ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {adminLoading ? 'Processing...' : 'Burn Tokens'}
                    </button>
                  </div>
                </div>

                {/* Status Feedback */}
                {adminSuccess && (
                  <div style={{ marginTop: '14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '10px', padding: '10px 14px', color: '#a7f3d0', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <span>Transaction confirmed successfully on Base!</span>
                    {adminTxHash && adminTxHash.startsWith('0x') && (
                      <a
                        href={`https://basescan.org/tx/${adminTxHash}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#34d399', textDecoration: 'underline', fontWeight: 800 }}
                      >
                        View on Basescan ↗
                      </a>
                    )}
                  </div>
                )}

                {adminError && (
                  <div style={{ marginTop: '14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '10px', padding: '10px 14px', color: '#fca5a5', fontSize: '0.82rem' }}>
                    {adminError}
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
