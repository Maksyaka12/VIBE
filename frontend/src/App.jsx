import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Copy, Check, Menu, X, ArrowRight, ArrowUpRight, ArrowRightCircle, TrendingUp, Clock, Rocket, Globe, Star, Crown, Laptop, Loader2, Flame, Gift, Users, ShieldCheck, Calculator, Calendar, RotateCcw, Gamepad2, Coins, Sparkles, Lock, ChevronDown, HelpCircle } from 'lucide-react';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider as PrivyWagmiProvider } from '@privy-io/wagmi';
import { privyWagmiConfig } from './config/privyWagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createPublicClient, http, formatUnits, parseAbiItem, parseAbi } from 'viem';
import { base } from 'viem/chains';
import Checker from './Checker';
import VibeVerse from './verse/VibeVerse';
import VibeVerseLockScreen from './verse/VibeVerseLockScreen';
import NftClubPage from './pages/NftClubPage';
import './index.css';

const CA      = '0xb200000000000000000000df24ecb8bf51100a01';
const O1      = 'https://launch.o1.exchange/token/0xb200000000000000000000df24ecb8bf51100a01?chain=8453';
const O1_STAKING_VAULT = 'https://launch.o1.exchange/staking/vaults/0xafa3ce23e0043b651d98e5a89b55a80b71be2f4a945a745cd6e37316b5075663?chain=8453';
const DEX     = 'https://dexscreener.com/base/0xa1a4159e61ac9fc48aa9e9992c8d4870ef8a496d5749af1d219e8002f74835c5';
const DEX_EMB = 'https://dexscreener.com/base/0xa1a4159e61ac9fc48aa9e9992c8d4870ef8a496d5749af1d219e8002f74835c5?embed=1&theme=dark&activeTab=chart';

const UNLOCKS = [
  {d:'Aug 26, 2026', a:'10M'},{d:'Sep 25, 2026', a:'20M'},
  {d:'Oct 25, 2026', a:'30M'},{d:'Nov 24, 2026', a:'40M'},
  {d:'Dec 24, 2026', a:'50M'},{d:'Jan 23, 2027', a:'60M'},
  {d:'Feb 22, 2027', a:'70M'},{d:'Mar 24, 2027', a:'80M'},
  {d:'Apr 23, 2027', a:'90M'},{d:'May 23, 2027', a:'100M'},
];

const BUYBACK_WALLET = '0x067c66aDdD3C6D484c1882B68E197B614f7f3Ebf';
const BURN_WALLET = '0x000000000000000000000000000000000000dEaD';
const DIST_WALLET = '0x3b277d566b4557a53392712b1dc830da5d13ba91';

// Historical data constants (RPC getLogs is impossible for 31M block range on frontend)
const CONST_TOTAL_BUYBACK = 8441747.16191129 + 585682 + 2822654 + 2070000 + 422000 + 2250000 + 1421729 + 2602000 + 2684253 + 3578868;
const CONST_DISTRIBUTED = 920000;

const TICKS = [
  '🐾 $VIBE ON BASE','🐶 THE BASE DOG','✨ B20 STANDARD','💙 GOOD BOY COIN',
  '🚀 UNLIMITED VIBES','🐾 HAPPY PAWS','💎 COMMUNITY FIRST','🌊 RIDE THE VIBE',
  '🤝 BASED & LOYAL','🔥 MALTIPOO COIN',
];

/* hooks */
function useCopy(txt) {
  const [ok, setOk] = useState(false);
  const go = useCallback(() => {
    navigator.clipboard.writeText(txt).catch(()=>{});
    setOk(true); setTimeout(() => setOk(false), 2000);
  }, [txt]);
  return { ok, go };
}
function useRev() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add('on'); }, { threshold: 0.1 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return ref;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/* NAV */
function Nav() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen]   = useState(false);
  useEffect(() => {
    const h = () => setStuck(window.scrollY > 50);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'tokenomics', label: 'Tokenomics' },
    { id: 'rewards', label: 'Rewards Hub' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'chart', label: 'Chart' },
    { id: 'trade', label: 'Trade' },
    { id: 'checker', label: 'Checker' }
  ];

  return (
    <>
      <nav className={stuck ? 'stuck' : ''}>
        <div className="nav-inner">
          <Link to="/" className="nav-brand" onClick={() => setOpen(false)}>
            <img src="/new-logo-vibe.png" className="nav-logo" alt="$VIBE" />
            $VIBE
          </Link>
          <ul className="nav-menu">
            {navLinks.map(({ id, label }) => (
              <li key={id}>
                <Link
                  to={`/${id}`}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    ...(id === 'rewards' ? {
                      color: '#ff6600',
                      fontWeight: 800
                    } : {})
                  }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
            <a href="https://vibeverse.dog/vibeclub" target="_blank" rel="noreferrer" className="nav-mint">
              Mint NFT <ArrowUpRight size={14} strokeWidth={2.5} />
            </a>
            <a href={O1} target="_blank" rel="noreferrer" className="nav-buy">
              Buy $VIBE <ArrowUpRight size={14} strokeWidth={2.5} />
            </a>
            <button className="ham" onClick={() => setOpen(!open)}>
              {open ? <X size={24} color="var(--ink)" /> : <Menu size={24} color="var(--ink)" />}
            </button>
          </div>
        </div>
      </nav>
      <div className={`mob-menu ${open ? 'open' : ''}`}>
        <div className="mob-links">
          {navLinks.map(({ id, label }) => (
            <Link
              key={id}
              to={`/${id}`}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                ...(id === 'rewards' ? {
                  color: '#ff6600',
                  fontWeight: 800
                } : {})
              }}
            >
              {label}
            </Link>
          ))}
          <a href="https://vibeverse.dog/vibeclub" target="_blank" rel="noreferrer" className="mob-mint" onClick={() => setOpen(false)}>
            Mint NFT <ArrowUpRight size={20} strokeWidth={2.5} />
          </a>
          <a href={O1} target="_blank" rel="noreferrer" className="mob-buy" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}} onClick={() => setOpen(false)}>
            Buy $VIBE <ArrowUpRight size={20} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </>
  );
}

/* HERO */
function Hero() {
  const { ok, go } = useCopy(CA);
  return (
    <section id="hero">
      <div className="hero-inner">
        <div>
          <div className="hero-eyebrow">
            <div className="eyebrow-dot"/>
            Live on Base B20
          </div>
          <h1>I AM THE <span className="blue">VIBE.</span><br/>THE <span className="blue">BASE</span> DOG.</h1>
          <p className="hero-desc">
            Meet $VIBE — the Base Dog and the ultimate mood maker on Base B20.
            Good vibes and positive energy only.
            Every great journey starts with a single paw print 🐾
          </p>
          <div className="hero-btns">
            <a href={O1} target="_blank" rel="noreferrer" className="btn-fill">
              Buy $VIBE <ArrowRight size={20} strokeWidth={2.5} />
            </a>
            <a href={DEX} target="_blank" rel="noreferrer" className="btn-line">
              Dexscreener <ArrowUpRight size={20} strokeWidth={2.5} />
            </a>
          </div>
          <div className="hero-ca-wrap">
            <div className="hero-ca-lbl">$VIBE Contract Address (Base)</div>
            <div className="hero-ca-box">
              <span className="hero-ca-addr">{CA}</span>
              <button className={`hero-ca-btn${ok?' ok':''}`} onClick={go} title="Copy Address">
                {ok ? <Check size={20} strokeWidth={3} /> : <Copy size={20} />}
              </button>
            </div>
          </div>
        </div>
        <div className="dog-wrap">
          <img
            src="/new-logo-vibe.png"
            onError={e=>{e.target.onerror=null;e.target.src='/mascot.png';}}
            alt="$VIBE The Base Dog"
            className="dog-img"
          />
        </div>
      </div>
    </section>
  );
}






/* ABOUT */
function About() {
  const r1=useRev(), r2=useRev();
  return (
    <section id="about">
      <div className="wrap">
        <div className="sec-head rv" ref={r1}>
          <h2>More than a meme.<br/>The real <span className="bl">Base Dog</span>.</h2>
          <p className="sec-sub">The fluffiest, most loyal dog onchain & offchain.</p>
          <div style={{
            marginTop: '20px',
            background: 'rgba(255, 255, 255, 0.65)',
            borderLeft: '4px solid var(--blue)',
            borderRadius: '0 12px 12px 0',
            padding: '12px 18px',
            display: 'inline-block',
            borderTop: '1px solid rgba(0, 82, 255, 0.12)',
            borderRight: '1px solid rgba(0, 82, 255, 0.12)',
            borderBottom: '1px solid rgba(0, 82, 255, 0.12)'
          }}>
            <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)', lineHeight: '1.5' }}>
              Vibe belongs to only one owner offchain.<br/>
              <span style={{ color: 'var(--blue)', fontWeight: 700 }}>$VIBE belongs to everyone onchain.</span>
            </p>
          </div>
        </div>
        <div className="about-grid">
          <div className="rv d1" ref={r2}>
            <p>
              $VIBE is a real Maltipoo Dog who came to B20 to become the ultimate mood maker,
              spread positive energy and immaculate vibes with the based community.
            </p>
            <div className="traits">
              <div className="trait"><span className="t-ico">🐶</span><div className="t-txt"><strong>Real Dog Energy</strong>Inspired by a real Maltipoo — the cutest, most vibing dog alive</div></div>
              <div className="trait"><div className="t-ico-img-wrap"><img src="/b20-logo.png" alt="B20" /></div><div className="t-txt"><strong>B20 on Base</strong>Community-driven standard, fully transparent tokenomics</div></div>
              <div className="trait"><span className="t-ico">🤝</span><div className="t-txt"><strong>100% to Holders</strong>Every vested token distributed to the community — zero team bags</div></div>
              <div className="trait"><span className="t-ico">🐾</span><div className="t-txt"><strong>Good Vibes Only</strong>Every paw print forward is a step toward the moon</div></div>
            </div>
          </div>
          <div className="about-img-wrap">
            <img src="/picture-vibe.jfif" alt="The real VIBE dog" className="about-img" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* TOKENOMICS */
function useRevenueStats() {
  const [stats, setStats] = useState({
    totalBuybacks: '...',
    totalBurned: '...',
    totalBurnedNum: 0,
    communityRewards: '...',
    distributedRewards: '...',
    loading: true
  });

  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      try {
        const client = createPublicClient({ chain: base, transport: http() });
        const abiBalance = parseAbiItem('function balanceOf(address account) view returns (uint256)');
        
        const [burnedRaw, rewardsRaw] = await Promise.all([
          client.readContract({ address: CA, abi: [abiBalance], functionName: 'balanceOf', args: [BURN_WALLET] }),
          client.readContract({ address: CA, abi: [abiBalance], functionName: 'balanceOf', args: [BUYBACK_WALLET] })
        ]);

        const formatNumber = (numStr) => {
          const num = parseFloat(numStr);
          if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
          if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
          return num.toLocaleString();
        };

        if (mounted) {
          setStats({
            totalBurned: formatNumber(formatUnits(burnedRaw, 18)),
            totalBurnedNum: parseFloat(formatUnits(burnedRaw, 18)),
            communityRewards: formatNumber(formatUnits(rewardsRaw, 18)),
            totalBuybacks: formatNumber(CONST_TOTAL_BUYBACK),
            distributedRewards: formatNumber(CONST_DISTRIBUTED),
            loading: false
          });
        }
      } catch (err) {
        console.error("Error fetching revenue stats", err);
        if (mounted) setStats(s => ({ ...s, loading: false }));
      }
    }
    fetchStats();
    return () => { mounted = false; };
  }, []);

  return stats;
}

function Tokenomics() {
  const r = useRev();
  const { totalBurned, totalBurnedNum, totalBuybacks, communityRewards, distributedRewards, loading } = useRevenueStats();
  
  const now = new Date();
  const unlockedCount = UNLOCKS.filter(u => new Date(u.d) <= now).length;
  const unlockedTokens = unlockedCount * 10_000_000;
  
  const baseCirculating = 900_000_000;
  const currentCirculating = baseCirculating + unlockedTokens - (totalBurnedNum || 0);
  
  const formatCirculating = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2).replace(/\.00$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const circulatingStr = loading ? <Loader2 size={24} className="spin"/> : formatCirculating(currentCirculating);

  return (
    <section id="tokenomics" className="alt">
      <div className="wrap">
        
        {/* BLOCK 1: TOKENOMICS INFO */}
        <div className="sec-head rv" ref={r} style={{ marginBottom: '40px' }}>
          <h2>$VIBE <span className="bl">Tokenomics</span>.</h2>
          <p className="sec-sub">Fair launch via o1.exchange. $VIBE B20 launch time was publicly announced in advance. Zero BS. No team allocations. No insider buys.</p>
        </div>
        
        <div className="stat-tiles wide-stats" style={{ marginBottom: '60px' }}>
          <div className="stile"><span className="v">1B</span><span className="l">Total Supply</span></div>
          <div className="stile">
            <span className="v">{circulatingStr}</span>
            <span className="l">Circulating</span>
            {!loading && totalBurnedNum > 0 && (
              <div className="d" style={{ marginTop: '8px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#ef4444',
                  padding: '2px 8px',
                  borderRadius: '99px',
                  fontWeight: '800',
                  lineHeight: '1'
                }}>
                  <Flame size={14} strokeWidth={2.5} /> {totalBurned}
                </span>
              </div>
            )}
          </div>
          <div className="stile"><span className="v">100M</span><span className="l">Vesting Community Rewards</span><div className="d">10% unlocks monthly</div></div>
          <div className="stile"><span className="v">10M</span><span className="l">Monthly Unlock</span><div className="d">Straight to holders</div></div>
        </div>

        {/* BLOCK 2: REVENUE ECONOMY */}
        <div className="sec-head" style={{ marginBottom: '40px', marginTop: '40px' }}>
          <h2>Revenue <span className="bl">Economy</span>.</h2>
          <p className="sec-sub">Creator Revenue is going towards buybacks and actions aimed at strengthening the token economy, driving long-term value for all holders.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '24px', marginBottom: '60px' }}>
          
          {/* Left Side: Stat Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="stile" style={{ margin: 0, padding: '24px', minHeight: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span className="v">{loading ? <Loader2 size={24} className="spin"/> : totalBuybacks}</span>
              <span className="l">Total Buyback</span>
            </div>
            <div className="stile" style={{ margin: 0, padding: '24px', minHeight: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span className="v" style={{ color: '#ef4444' }}>{loading ? <Loader2 size={24} className="spin"/> : totalBurned}</span>
              <span className="l">Total Burned</span>
            </div>
            <div className="stile" style={{ margin: 0, padding: '24px', minHeight: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span className="v">{loading ? <Loader2 size={24} className="spin"/> : communityRewards}</span>
              <span className="l">Reserved for Community</span>
            </div>
            <div className="stile" style={{ margin: 0, padding: '24px', minHeight: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span className="v">{loading ? <Loader2 size={24} className="spin"/> : distributedRewards}</span>
              <span className="l">Distributed to Community</span>
            </div>
          </div>

          {/* Right Side: Buyback Program */}
          <div className="tok-card" style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px', color: 'var(--ink)' }}>Buyback Program</h3>
              <p className="sub" style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>Strategic utilization of revenue generated.</p>
            </div>
            
            <div style={{ position: 'relative', width: '100%', maxWidth: '420px', margin: '16px auto 8px', flexShrink: 0 }}>
              <svg viewBox="0 0 420 280" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="burnGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff5f5f" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#0052ff" />
                  </linearGradient>

                  <filter id="redGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#ef4444" floodOpacity="0.25" />
                  </filter>
                  <filter id="blueGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0052ff" floodOpacity="0.25" />
                  </filter>
                </defs>

                <g transform="translate(210, 140)">
                  {/* Track Ring */}
                  <circle cx="0" cy="0" r="80" fill="none" stroke="#f1f5f9" strokeWidth="18" />

                  {/* 70% Reserved for Community */}
                  <circle cx="0" cy="0" r="80" fill="none" stroke="url(#blueGradient)" strokeWidth="18"
                          strokeLinecap="round" pathLength="100" strokeDasharray="65 100" strokeDashoffset="-2.5"
                          transform="rotate(-90)" filter="url(#blueGlow)" style={{ transition: 'all 0.5s ease' }} />

                  {/* 30% Burn */}
                  <circle cx="0" cy="0" r="80" fill="none" stroke="url(#burnGradient)" strokeWidth="18"
                          strokeLinecap="round" pathLength="100" strokeDasharray="25 100" strokeDashoffset="-72.5"
                          transform="rotate(-90)" filter="url(#redGlow)" style={{ transition: 'all 0.5s ease' }} />

                  {/* Left Callout (Burn 30% - Top Left) */}
                  <circle cx="-65" cy="-47" r="4" fill="#ef4444" />
                  <polyline points="-65,-47 -95,-70 -125,-70" fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3 3" />
                  <text x="-130" y="-64" fill="#ef4444" fontSize="13" fontWeight="800" textAnchor="end">Burn 30%</text>

                  {/* Right Callout (Reserved for Community 70% - Bottom Right) */}
                  <circle cx="47" cy="65" r="4" fill="#0052ff" />
                  <polyline points="47,65 75,90 115,90" fill="none" stroke="#0052ff" strokeWidth="1.2" strokeDasharray="3 3" />
                  <text x="122" y="84" fill="#0052ff" fontSize="13" fontWeight="800" textAnchor="start">Reserved for</text>
                  <text x="122" y="99" fill="#0052ff" fontSize="13" fontWeight="800" textAnchor="start">Community 70%</text>

                  {/* Center Text */}
                  <text x="0" y="-3" fill="var(--ink)" fontSize="30" fontWeight="900" textAnchor="middle" letterSpacing="-0.5px">100%</text>
                  <text x="0" y="18" fill="var(--muted)" fontSize="10" fontWeight="800" textAnchor="middle" letterSpacing="1.5px">BUYBACKS</text>
                </g>
              </svg>
            </div>

            {/* Bottom Legend Pills */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '5px 12px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 800, color: '#ef4444' }}>
                <Flame size={14} /> Burn 30%
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 82, 255, 0.08)', border: '1px solid rgba(0, 82, 255, 0.2)', padding: '5px 12px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--blue)' }}>
                <Users size={14} /> Community 70%
              </div>
            </div>
          </div>
        </div>

        {/* BLOCK 3: COMMUNITY REWARDS ECONOMY */}
        <div className="sec-head" style={{ marginBottom: '40px', marginTop: '60px' }}>
          <h2>Community Rewards <span className="bl">Economy</span>.</h2>
          <p className="sec-sub">
            The 70% Reserved for Community from buybacks belongs entirely to the community, distributed across continuous 10-day rolling epoch cycles.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '24px', marginBottom: '60px' }}>
          
          {/* Left Side: 4 Pillar Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            {/* 1. VibeVerse App Rewards */}
            <div className="tok-card" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #0052ff' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(0, 82, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0052ff' }}>
                    <Gamepad2 size={22} />
                  </div>
                  <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0052ff', letterSpacing: '-0.5px' }}>30%</span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--ink)' }}>VibeVerse App</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0, lineHeight: '1.45' }}>
                  Rewards pool in Vibe Verse App.
                </p>
              </div>
              <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 800, color: '#0052ff', background: 'rgba(0, 82, 255, 0.06)', padding: '4px 8px', borderRadius: '6px', width: 'fit-content' }}>
                <Clock size={12} /> 10-Day Epoch Cycles
              </div>
            </div>

            {/* 2. $VIBE Staking Pool */}
            <div className="tok-card" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #7c3aed' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                    <Coins size={22} />
                  </div>
                  <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#7c3aed', letterSpacing: '-0.5px' }}>15%</span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--ink)' }}>$VIBE Staking</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0, lineHeight: '1.45' }}>
                  Yield generation for holders locking $VIBE, reducing circulating supply.
                </p>
              </div>
              <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 800, color: '#7c3aed', background: 'rgba(124, 58, 237, 0.06)', padding: '4px 8px', borderRadius: '6px', width: 'fit-content' }}>
                <Clock size={12} /> 10-Day Epoch Cycles
              </div>
            </div>

            {/* 3. Vibe Club NFT Holders */}
            <div className="tok-card" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #10b981' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                    <Crown size={22} />
                  </div>
                  <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#10b981', letterSpacing: '-0.5px' }}>15%</span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--ink)' }}>Vibe Club NFTs</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0, lineHeight: '1.45' }}>
                  Direct royalties for holders of the 333 Vibe Club NFTs.
                </p>
              </div>
              <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.06)', padding: '4px 8px', borderRadius: '6px', width: 'fit-content' }}>
                <Clock size={12} /> 10-Day Epoch Cycles
              </div>
            </div>

            {/* 4. Strategic Reserve & Marketing */}
            <div className="tok-card" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #f59e0b' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                    <ShieldCheck size={22} />
                  </div>
                  <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#f59e0b', letterSpacing: '-0.5px' }}>40%</span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--ink)' }}>Reserve &amp; Growth</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0, lineHeight: '1.45' }}>
                  Stability buffer for continuous reward pools and marketing campaigns.
                </p>
              </div>
              <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.06)', padding: '4px 8px', borderRadius: '6px', width: 'fit-content' }}>
                <Sparkles size={12} /> Perpetual Buffer
              </div>
            </div>

          </div>

          {/* Right Side: Donut Chart */}
          <div className="tok-card" style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px', color: 'var(--ink)' }}>Community Pool Distribution</h3>
              <p className="sub" style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>Allocation of the 70% Revenue Share (Normalized to 100%).</p>
            </div>

            <div style={{ position: 'relative', width: '100%', maxWidth: '420px', margin: '16px auto 8px', flexShrink: 0 }}>
              <svg viewBox="0 0 420 280" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="commBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#0052ff" />
                  </linearGradient>
                  <linearGradient id="commPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                  <linearGradient id="commGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient id="commAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>

                  <filter id="commBlueGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0052ff" floodOpacity="0.25" />
                  </filter>
                  <filter id="commPurpleGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#7c3aed" floodOpacity="0.25" />
                  </filter>
                  <filter id="commGreenGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#10b981" floodOpacity="0.25" />
                  </filter>
                  <filter id="commAmberGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.25" />
                  </filter>
                </defs>

                <g transform="translate(210, 140)">
                  {/* Track Ring */}
                  <circle cx="0" cy="0" r="80" fill="none" stroke="#f1f5f9" strokeWidth="18" />

                  {/* 1. VibeVerse App 30% (Spans 0 to 30 -> Offset -2, length 26) */}
                  <circle cx="0" cy="0" r="80" fill="none" stroke="url(#commBlueGrad)" strokeWidth="18"
                          strokeLinecap="round" pathLength="100" strokeDasharray="26 100" strokeDashoffset="-2"
                          transform="rotate(-90)" filter="url(#commBlueGlow)" style={{ transition: 'all 0.5s ease' }} />

                  {/* 2. $VIBE Staking 15% (Spans 30 to 45 -> Offset -32, length 11) */}
                  <circle cx="0" cy="0" r="80" fill="none" stroke="url(#commPurpleGrad)" strokeWidth="18"
                          strokeLinecap="round" pathLength="100" strokeDasharray="11 100" strokeDashoffset="-32"
                          transform="rotate(-90)" filter="url(#commPurpleGlow)" style={{ transition: 'all 0.5s ease' }} />

                  {/* 3. Vibe Club NFT 15% (Spans 45 to 60 -> Offset -47, length 11) */}
                  <circle cx="0" cy="0" r="80" fill="none" stroke="url(#commGreenGrad)" strokeWidth="18"
                          strokeLinecap="round" pathLength="100" strokeDasharray="11 100" strokeDashoffset="-47"
                          transform="rotate(-90)" filter="url(#commGreenGlow)" style={{ transition: 'all 0.5s ease' }} />

                  {/* 4. Reserve & Growth 40% (Spans 60 to 100 -> Offset -62, length 36) */}
                  <circle cx="0" cy="0" r="80" fill="none" stroke="url(#commAmberGrad)" strokeWidth="18"
                          strokeLinecap="round" pathLength="100" strokeDasharray="36 100" strokeDashoffset="-62"
                          transform="rotate(-90)" filter="url(#commAmberGlow)" style={{ transition: 'all 0.5s ease' }} />

                  {/* Callout 1: VibeVerse 30% (Originates from Blue Arc Center at 54°) */}
                  <circle cx="65" cy="-47" r="4" fill="#0052ff" />
                  <polyline points="65,-47 95,-70 125,-70" fill="none" stroke="#0052ff" strokeWidth="1.2" strokeDasharray="3 3" />
                  <text x="130" y="-64" fill="#0052ff" fontSize="12" fontWeight="800" textAnchor="start">VibeVerse 30%</text>

                  {/* Callout 2: Staking 15% (Originates from Purple Arc Center at 135°) */}
                  <circle cx="57" cy="57" r="4" fill="#7c3aed" />
                  <polyline points="57,57 85,80 115,80" fill="none" stroke="#7c3aed" strokeWidth="1.2" strokeDasharray="3 3" />
                  <text x="120" y="85" fill="#7c3aed" fontSize="12" fontWeight="800" textAnchor="start">Staking 15%</text>

                  {/* Callout 3: NFT Club 15% (Originates from Green Arc Center at 189°) */}
                  <circle cx="-13" cy="79" r="4" fill="#10b981" />
                  <polyline points="-13,79 -40,95 -80,95" fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 3" />
                  <text x="-85" y="100" fill="#10b981" fontSize="12" fontWeight="800" textAnchor="end">NFT Club 15%</text>

                  {/* Callout 4: Reserve 40% (Originates from Amber Arc Center at 288°) */}
                  <circle cx="-76" cy="-25" r="4" fill="#f59e0b" />
                  <polyline points="-76,-25 -105,-55 -135,-55" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3 3" />
                  <text x="-140" y="-49" fill="#f59e0b" fontSize="12" fontWeight="800" textAnchor="end">Reserve 40%</text>

                  {/* Center Text */}
                  <text x="0" y="-3" fill="var(--ink)" fontSize="28" fontWeight="900" textAnchor="middle" letterSpacing="-0.5px">100%</text>
                  <text x="0" y="16" fill="var(--muted)" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="1px">COMMUNITY</text>
                </g>
              </svg>
            </div>

            {/* Legend Pills */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(0, 82, 255, 0.08)', border: '1px solid rgba(0, 82, 255, 0.2)', padding: '4px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--blue)' }}>
                <Gamepad2 size={13} /> VibeVerse 30%
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.2)', padding: '4px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed' }}>
                <Coins size={13} /> Staking 15%
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '4px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>
                <Crown size={13} /> NFT Club 15%
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '4px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b' }}>
                <ShieldCheck size={13} /> Reserve 40%
              </div>
            </div>
          </div>

        </div>

        {/* BLOCK 4: VESTING DETAILS */}
        <div id="vesting-details" className="sec-head" style={{ marginBottom: '40px', marginTop: '40px' }}>
          <h2>Vesting <span className="bl">Details</span>.</h2>
          <p className="sec-sub">100M tokens vested. Every month 10M unlocks and get distributed among holders.</p>
        </div>

        <div className="tok-layout">
          <div>
            <div className="tok-card">
              <h3>Holder Rewards · 100M $VIBE</h3>
              <p className="sub">10M unlocks monthly · starts Aug 26, 2026</p>
              <div className="prog"><div className="prog-f" style={{width:'10%'}}/></div>
              <div className="prog-labs"><span>0M today</span><span>100M total</span></div>
              <div className="who">
                <div className="who-r">
                  <div className="who-ico"><img src="/vibe-logo.png" className="who-img-sq" /></div>
                  <div className="who-t">$VIBE Holders<span>Hold 5M+ $VIBE to qualify</span></div>
                </div>
                <div className="who-r">
                  <div className="who-ico" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><TrendingUp color="var(--blue)" size={20}/></div>
                  <div className="who-t">Allocation Size<span>The more you hold, the larger your allocation</span></div>
                </div>
                <div className="who-r">
                  <div className="who-ico" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><ShieldCheck color="var(--blue)" size={20}/></div>
                  <div className="who-t">Max Allocation Cap<span>Set to prevent whale dominance & ensure fair distribution</span></div>
                </div>
                <div className="who-r">
                  <div className="who-ico" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><Calculator color="var(--blue)" size={20}/></div>
                  <div className="who-t">Allocation Calculation<span>Proportionally calculated based on holding balance</span></div>
                </div>
                <div className="who-r">
                  <div className="who-ico" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><Clock color="var(--blue)" size={20}/></div>
                  <div className="who-t">Snapshot Schedule<span>Balance snapshot at 00:00 UTC on the day of unlock</span></div>
                </div>
                <div className="who-r">
                  <div className="who-ico" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><Calendar color="var(--blue)" size={20}/></div>
                  <div className="who-t">Claim Window<span>Stays open for 30 days until the next unlock</span></div>
                </div>
                <div className="who-r">
                  <div className="who-ico" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><Flame color="#ef4444" size={20}/></div>
                  <div className="who-t">Unclaimed Tokens<span>Permanently burned</span></div>
                </div>
                <Link to="/checker" className="who-r" style={{textDecoration:'none', cursor:'pointer', background:'var(--blue)'}}>
                  <div className="who-ico" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><Check color="#fff" size={20}/></div>
                  <div className="who-t" style={{color:'#fff'}}>Check your eligibility<span style={{color:'rgba(255,255,255,0.8)'}}>Qualify for the next distribution <ArrowRightCircle size={14} style={{verticalAlign:'middle', marginLeft:4}}/></span></div>
                </Link>
              </div>
            </div>
          </div>
          <div className="sched">
            <h3>Unlock Schedule</h3>
            <p className="sub">Aug 2026 &rarr; May 2027</p>
            <div className="ul-wrap">
              {UNLOCKS.map((u,i)=>{
                const isUnlocked = new Date(u.d) <= now;
                return (
                  <div key={i} className="ul-r">
                    <span className="ul-d">{u.d}</span>
                    <span className="ul-a">{u.a}</span>
                    <span className="ul-s" style={{ color: isUnlocked ? 'var(--blue)' : 'inherit', fontWeight: isUnlocked ? 'bold' : 'normal' }}>
                      {isUnlocked ? 'unlocked' : 'locked'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

/* CHART */
function Chart() {
  const r=useRev();
  return (
    <section id="chart">
      <div className="wrap">
        <div className="chart-hd rv" ref={r}>
          <div>
            <h2>Live <span className="bl">Chart</span>.</h2>
          </div>
        </div>
        <div className="chart-box desk-chart-box">
          <iframe
            src={DEX_EMB}
            title="$VIBE chart"
            width="100%" height="600"
            frameBorder="0" allowFullScreen
          />
        </div>
        <div className="chart-links">
          <a href={DEX} target="_blank" rel="noreferrer" className="chart-big-btn">
            <img src="/dexscreener-logo.jpg" alt="Dexscreener" className="chart-big-logo" />
            <span>View on Dexscreener</span>
            <ArrowUpRight size={22} strokeWidth={2.5} />
          </a>
          <a href="https://www.geckoterminal.com/uk/base/pools/0xa1a4159e61ac9fc48aa9e9992c8d4870ef8a496d5749af1d219e8002f74835c5" target="_blank" rel="noreferrer" className="chart-big-btn">
            <img src="/geckoterminal-logo.jpg" alt="GeckoTerminal" className="chart-big-logo" />
            <span>View on GeckoTerminal</span>
            <ArrowUpRight size={22} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </section>
  );
}

/* SWAP / TRADE */
function Swap() {
  const r=useRev();
  return (
    <section id="trade" className="alt">
      <div className="wrap">
        <div className="swap-hd rv" ref={r}>
          <div>
            <h2>Trade <span className="bl">$VIBE</span>.</h2>
            <p className="sec-sub">Live on Base. Zero BS. Start vibing.</p>
          </div>
          <a href={O1} target="_blank" rel="noreferrer" className="btn-fill desk-chart-btn">Open on o1.exchange <ArrowUpRight size={20} strokeWidth={2.5} /></a>
        </div>
        
        <div className="swap-grid">
          <div className="swap-iframe-wrap">
            <iframe
              src="https://launch.o1.exchange/token/0xb200000000000000000000df24ecb8bf51100a01?chain=8453"
              title="$VIBE Trade"
              className="swap-iframe"
              frameBorder="0"
              allowFullScreen
            />
            <div className="swap-fallback">
              Widget not loading? <a href={O1} target="_blank" rel="noreferrer">Open directly on o1.exchange <ArrowUpRight size={14} strokeWidth={2.5} /></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



/* ROADMAP */
function Roadmap() {
  const r=useRev();
  return (
    <section id="roadmap" className="alt" style={{ padding: '140px 0 100px 0' }}>
      <div className="wrap">
        <div className="sec-head rv" ref={r} style={{ textAlign: 'center' }}>
          <h2>The <span className="bl">Masterplan</span>.</h2>
          <p className="sec-sub" style={{ margin: '0 auto' }}>Every great journey starts with a single Base Dog paw print.</p>
        </div>
        
        <div className="roadmap-timeline">
          {/* Phase 1 */}
          <div className="roadmap-phase rv" ref={useRev()}>
            <div className="roadmap-phase-title">Phase 1: The Foundation</div>
            <div className="roadmap-items">
              <div className="roadmap-item done">
                <div className="r-title"><Rocket size={24} color="var(--blue)"/> Fair Launch via o1 <span className="badge-rm done"><Check size={14} strokeWidth={3}/> DONE</span></div>
                <div className="r-desc">A 100% fair launch on o1 Exchange. No presales, no team allocations, no insider buys. Public launch time: July 27, 14:00 UTC.</div>
              </div>
              <div className="roadmap-item done">
                <div className="r-title"><Star size={24} color="var(--blue)"/> Community Rewards <span className="badge-rm done"><Check size={14} strokeWidth={3}/> DONE</span></div>
                <div className="r-desc">Develop a transparent smart contract to distribute a vested 10% of the total supply (100M $VIBE) as monthly rewards for the community.</div>
              </div>
            </div>
          </div>
          
          {/* Phase 2 */}
          <div className="roadmap-phase rv" ref={useRev()}>
            <div className="roadmap-phase-title">Phase 2: Global Recognition</div>
            <div className="roadmap-items">
              <div className="roadmap-item done">
                <div className="r-title"><Laptop size={24} color="var(--blue)"/> Interactive Web Portal <span className="badge-rm done"><Check size={14} strokeWidth={3}/> DONE</span></div>
                <div className="r-desc">Launch of a comprehensive dApp featuring an eligibility checker for rewards, integrated seamless swaps, real-time holder analytics, tokenomics, and project details.</div>
              </div>
              <div className="roadmap-item done">
                <div className="r-title"><Globe size={24} color="var(--blue)"/> Enhance $VIBE Visibility <span className="badge-rm done"><Check size={14} strokeWidth={3}/> DONE</span></div>
                <div className="r-desc">Securing top-tier visibility and native support across major platforms including the X Token Card, Base App, OKX Wallet, and the broader Web3 ecosystem.</div>
              </div>
              <div className="roadmap-item in-progress">
                <div className="r-title"><TrendingUp size={24} color="var(--blue)"/> Premier Listings <span className="badge-rm prog"><Loader2 size={14} className="spin"/> IN PROGRESS</span></div>
                <div className="r-desc">Cementing our presence on industry-leading tracking platforms: Dexscreener, CoinGecko, CoinMarketCap, and others.</div>
                <div className="r-subnote done">
                  <span className="r-subnote-dot done"></span>
                  <span>DEX &amp; GeckoTerminal updated</span>
                  <span className="badge-rm done" style={{marginLeft:'auto',fontSize:'0.65rem',padding:'4px 8px'}}><Check size={11} strokeWidth={3}/> DONE</span>
                </div>
                <div className="r-subnote">
                  <span className="r-subnote-dot"></span>
                  <span>Working on CoinGecko &amp; CoinMarketCap updating</span>
                  <span className="badge-rm prog" style={{marginLeft:'auto',fontSize:'0.65rem',padding:'4px 8px'}}><Loader2 size={11} className="spin"/> IN PROGRESS</span>
                </div>
                <div className="r-subnote">
                  <span className="r-subnote-dot"></span>
                  <span>Fixing DEX LP displaying issue directly with both o1 &amp; DEX teams</span>
                  <span className="badge-rm prog" style={{marginLeft:'auto',fontSize:'0.65rem',padding:'4px 8px'}}><Loader2 size={11} className="spin"/> IN PROGRESS</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Phase 3 */}
          <div className="roadmap-phase rv" ref={useRev()}>
            <div className="roadmap-phase-title">Phase 3: $VIBE Ecosystem</div>
            <div className="roadmap-items">
              <div className="roadmap-item done">
                <div className="r-title"><Users size={24} color="var(--blue)"/> Vibe Club NFTs on B20 <span className="badge-rm done"><Check size={14} strokeWidth={3}/> DONE</span></div>
                <div className="r-desc">Introducing the first-ever NFT collection officially integrated into the o1 B20 ecosystem and directly tied to the $VIBE token economy.</div>
                <div className="r-subnote done">
                  <span className="r-subnote-dot done"></span>
                  <span>Vibe Club mint is live &rarr; <a href="https://vibeverse.dog/vibeclub" target="_blank" rel="noreferrer" style={{color:'var(--blue)',textDecoration:'underline',fontWeight:600}}>vibeverse.dog/vibeclub</a></span>
                  <span className="badge-rm done" style={{marginLeft:'auto',fontSize:'0.65rem',padding:'4px 8px'}}><Check size={11} strokeWidth={3}/> DONE</span>
                </div>
              </div>
              <div className="roadmap-item in-progress">
                <div className="r-title"><Rocket size={24} color="var(--blue)"/> Product Launch: Vibe Verse <span className="badge-rm prog"><Loader2 size={14} className="spin"/> IN PROGRESS</span></div>
                <div className="r-desc">Launching Vibe Verse — an interactive Web3 pixel-art gaming world where $VIBE serves as the native in-game utility currency.</div>
                <div className="r-subnote done">
                  <span className="r-subnote-dot done"></span>
                  <span>Introducing the Vibe Club NFT Collection</span>
                  <span className="badge-rm done" style={{marginLeft:'auto',fontSize:'0.65rem',padding:'4px 8px'}}><Check size={11} strokeWidth={3}/> DONE</span>
                </div>
                <div className="r-subnote">
                  <span className="r-subnote-dot"></span>
                  <span>Introducing Vibe Verse: B20 $VIBE Onchain World</span>
                  <span className="badge-rm prog" style={{marginLeft:'auto',fontSize:'0.65rem',padding:'4px 8px'}}><Loader2 size={11} className="spin"/> IN PROGRESS</span>
                </div>
              </div>
              <div className="roadmap-item">
                <div className="r-title"><Flame size={24} color="var(--blue)"/> Vibe Verse Ecosystem</div>
                <div className="r-desc">Expanding the interactive gaming and DeFi ecosystem built around $VIBE as the core infrastructural utility token.</div>
              </div>
            </div>
          </div>

          {/* Phase 4 */}
          <div className="roadmap-phase rv" ref={useRev()}>
            <div className="roadmap-phase-title">Phase 4: Global Awareness</div>
            <div className="roadmap-items">
              <div className="roadmap-item">
                <div className="r-title"><Globe size={24} color="var(--blue)"/> Top Tier Listings</div>
                <div className="r-desc">Expanding liquidity and accessibility globally through strategic listings on prominent Centralized and Decentralized Exchanges.</div>
              </div>
            </div>
          </div>

          <div className="roadmap-more rv" ref={useRev()}>
            More coming soon...
          </div>
        </div>
      </div>
    </section>
  );
}

/* FOOTER */
function Footer() {
  return (
    <footer>
      <div className="foot-inner">
        <div className="foot-brand">
          <img src="/new-logo-vibe.png" alt="Vibe" className="foot-logo" />
          <span>$VIBE</span> · The Base Dog
        </div>
        <div className="foot-mid">
          <p className="foot-copy">© 2026 $VIBE · Not financial advice · Just a very good boy 🐾</p>
          <a href="https://x.com/o1_exchange" target="_blank" rel="noreferrer" className="foot-pow">powered by <img src="/o1-logo.png" alt="o1" /> o1_exchange <ArrowUpRight size={12} strokeWidth={2.5} /></a>
        </div>
        <div className="foot-soc">
          <a href="https://x.com/vibeb20" target="_blank" rel="noreferrer" className="soc soc-img" title="$VIBE X">
            <img src="/x-logo.jpg" alt="X" />
          </a>
          <a href="https://x.com/mksvibe" target="_blank" rel="noreferrer" className="soc soc-img" title="Founder X">
            <img src="/x-logo.jpg" alt="Founder X" />
          </a>
          <a href="https://t.me/vibe_b20" target="_blank" rel="noreferrer" className="soc soc-img" title="Telegram">
            <img src="/tg-logo.png" alt="Telegram" />
          </a>
          <a href={O1} target="_blank" rel="noreferrer" className="soc soc-img" title="o1.exchange">
            <img src="/o1-logo.png" alt="o1" />
          </a>
          <a href={DEX} target="_blank" rel="noreferrer" className="soc soc-img" title="Dexscreener">
            <img src="/dexscreener-logo.jpg" alt="Dex" />
          </a>
          <a href="https://www.geckoterminal.com/uk/base/pools/0xa1a4159e61ac9fc48aa9e9992c8d4870ef8a496d5749af1d219e8002f74835c5" target="_blank" rel="noreferrer" className="soc soc-img" title="GeckoTerminal">
            <img src="/geckoterminal-logo.jpg" alt="GeckoTerminal" />
          </a>
        </div>
      </div>
    </footer>
  );
}

const STAKING_EPOCHS = [
  {
    epoch: 'Epoch 1',
    duration: '10 Days',
    poolAmount: '2,200,000',
    startTime: '21 Aug 2026, 15:00 UTC',
    endTime: '31 Aug 2026, 15:00 UTC',
    status: 'active',
    link: O1_STAKING_VAULT
  },
  {
    epoch: 'Epoch 2',
    duration: '10 Days',
    poolAmount: 'TBA',
    startTime: '31 Aug 2026, 15:00 UTC',
    endTime: '10 Sep 2026, 15:00 UTC',
    status: 'upcoming',
    link: O1_STAKING_VAULT
  },
  {
    epoch: 'Epoch 3',
    duration: '10 Days',
    poolAmount: 'TBA',
    startTime: '10 Sep 2026, 15:00 UTC',
    endTime: '20 Sep 2026, 15:00 UTC',
    status: 'upcoming',
    link: O1_STAKING_VAULT
  },
  {
    epoch: 'Epoch 4',
    duration: '10 Days',
    poolAmount: 'TBA',
    startTime: '20 Sep 2026, 15:00 UTC',
    endTime: '30 Sep 2026, 15:00 UTC',
    status: 'upcoming',
    link: O1_STAKING_VAULT
  }
];

const VIBEVERSE_EPOCHS = [
  { epoch: 'Epoch 1', dates: 'Aug 29 – Sep 08, 2026', pool: '30% Pool', status: 'ongoing', note: 'Active Gameplay Leaderboard' },
  { epoch: 'Epoch 2', dates: 'Sep 08 – Sep 18, 2026', pool: '30% Pool', status: 'upcoming', note: 'Scheduled' },
  { epoch: 'Epoch 3', dates: 'Sep 18 – Sep 28, 2026', pool: '30% Pool', status: 'upcoming', note: 'Scheduled' },
  { epoch: 'Epoch 4', dates: 'Sep 28 – Oct 08, 2026', pool: '30% Pool', status: 'upcoming', note: 'Scheduled' },
  { epoch: 'Epoch 5', dates: 'Oct 08 – Oct 18, 2026', pool: '30% Pool', status: 'upcoming', note: 'Scheduled' },
  { epoch: 'Epoch 6', dates: 'Oct 18 – Oct 28, 2026', pool: '30% Pool', status: 'upcoming', note: 'Scheduled' },
  { epoch: 'Epoch 7', dates: 'Oct 28 – Nov 07, 2026', pool: '30% Pool', status: 'upcoming', note: 'Scheduled' },
  { epoch: 'Epoch 8', dates: 'Nov 07 – Nov 17, 2026', pool: '30% Pool', status: 'upcoming', note: 'Scheduled' },
  { epoch: 'Epoch 9', dates: 'Nov 17 – Nov 27, 2026', pool: '30% Pool', status: 'upcoming', note: 'Scheduled' },
  { epoch: 'Epoch 10', dates: 'Nov 27 – Dec 07, 2026', pool: '30% Pool', status: 'upcoming', note: 'Scheduled' },
];

const VIBECLUB_EPOCHS = [
  { epoch: 'Royalty 1', claimDate: '28 Aug 2026', dateObj: new Date('2026-08-28T00:00:00Z'), poolAmount: 'TBA' },
  { epoch: 'Royalty 2', claimDate: '3 Sep 2026', dateObj: new Date('2026-09-03T00:00:00Z'), poolAmount: 'TBA' },
  { epoch: 'Royalty 3', claimDate: '13 Sep 2026', dateObj: new Date('2026-09-13T00:00:00Z'), poolAmount: 'TBA' },
  { epoch: 'Royalty 4', claimDate: '23 Sep 2026', dateObj: new Date('2026-09-23T00:00:00Z'), poolAmount: 'TBA' },
];

const GIVEAWAYS_DATA = [
  {
    id: 3,
    title: '1000 Holders',
    image: '/event3.png',
    winners: '33 Winners',
    prizePool: 'TBA',
    status: 'ongoing',
    distribution: 'Not Started',
    link: 'https://x.com/vibeB20/status/2085778007960977418'
  },
  {
    id: 1,
    title: '$1M MC',
    image: '/event1.png',
    winners: '50 Winners',
    prizePool: 'TBA',
    status: 'ongoing',
    distribution: 'Not Started',
    link: 'https://x.com/mksvibe/status/2083993197861073025'
  },
  {
    id: 2,
    title: 'Base App Welcome Bonus',
    image: '/event2.png',
    winners: 'TBA',
    prizePool: '1M $VIBE',
    status: 'ended',
    distribution: 'In Progress (92%)',
    link: 'https://x.com/mksvibe/status/2084601445844689003'
  }
];

const HOLDER_UNLOCKS = [
  { unlock: 'Unlock 1', unlockDate: '26 Aug 2026', dateObj: new Date('2026-08-26T00:00:00Z'), poolAmount: '10,000,000' },
  { unlock: 'Unlock 2', unlockDate: '25 Sep 2026', dateObj: new Date('2026-09-25T00:00:00Z'), poolAmount: '10,000,000' },
  { unlock: 'Unlock 3', unlockDate: '25 Oct 2026', dateObj: new Date('2026-10-25T00:00:00Z'), poolAmount: '10,000,000' },
  { unlock: 'Unlock 4', unlockDate: '24 Nov 2026', dateObj: new Date('2026-11-24T00:00:00Z'), poolAmount: '10,000,000' },
  { unlock: 'Unlock 5', unlockDate: '24 Dec 2026', dateObj: new Date('2026-12-24T00:00:00Z'), poolAmount: '10,000,000' },
  { unlock: 'Unlock 6', unlockDate: '23 Jan 2027', dateObj: new Date('2027-01-23T00:00:00Z'), poolAmount: '10,000,000' },
  { unlock: 'Unlock 7', unlockDate: '22 Feb 2027', dateObj: new Date('2027-02-22T00:00:00Z'), poolAmount: '10,000,000' },
  { unlock: 'Unlock 8', unlockDate: '24 Mar 2027', dateObj: new Date('2027-03-24T00:00:00Z'), poolAmount: '10,000,000' },
  { unlock: 'Unlock 9', unlockDate: '23 Apr 2027', dateObj: new Date('2027-04-23T00:00:00Z'), poolAmount: '10,000,000' },
  { unlock: 'Unlock 10', unlockDate: '23 May 2027', dateObj: new Date('2027-05-23T00:00:00Z'), poolAmount: '10,000,000' },
];

function Rewards() {
  const [activeTab, setActiveTab] = useState(null);
  const [stakingFilter, setStakingFilter] = useState('all');
  const [giveawayFilter, setGiveawayFilter] = useState('all');
  const [holderFilter, setHolderFilter] = useState('all');
  const [vibeClubFilter, setVibeClubFilter] = useState('all');
  const [nftHoldersCount, setNftHoldersCount] = useState(103);
  const [openFaq, setOpenFaq] = useState(null);
  const now = new Date();

  useEffect(() => {
    let mounted = true;
    async function fetchNftHolders() {
      try {
        const client = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });
        const total = Number(await client.readContract({
          address: '0x9E92307Dbec2d0aE4BBF14cA93E1cA00edC4b886',
          abi: parseAbi(['function totalMintedCount() view returns (uint256)']),
          functionName: 'totalMintedCount'
        }));
        if (total > 0 && mounted) {
          setNftHoldersCount(total);
        }
      } catch (err) {
        console.error('Failed to fetch NFT holders:', err);
      }
    }
    fetchNftHolders();
    const interval = setInterval(fetchNftHolders, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const filteredStakingEpochs = STAKING_EPOCHS.filter(e => {
    if (stakingFilter === 'all') return true;
    if (stakingFilter === 'active') return e.status === 'active' || e.status === 'ongoing';
    if (stakingFilter === 'upcoming') return e.status === 'upcoming';
    if (stakingFilter === 'ended' || stakingFilter === 'completed') return e.status === 'completed' || e.status === 'ended';
    return true;
  });

  const stakingCounts = {
    all: STAKING_EPOCHS.length,
    active: STAKING_EPOCHS.filter(e => e.status === 'active' || e.status === 'ongoing').length,
    upcoming: STAKING_EPOCHS.filter(e => e.status === 'upcoming').length,
    ended: STAKING_EPOCHS.filter(e => e.status === 'completed' || e.status === 'ended').length,
  };

  const filteredHolderUnlocks = HOLDER_UNLOCKS.filter(u => {
    const isUnlocked = now >= u.dateObj;
    if (holderFilter === 'all') return true;
    if (holderFilter === 'active') return isUnlocked && u.status !== 'ended';
    if (holderFilter === 'upcoming' || holderFilter === 'locked') return !isUnlocked;
    if (holderFilter === 'ended' || holderFilter === 'completed') return u.status === 'ended' || u.status === 'completed';
    return true;
  });

  const holderCounts = {
    all: HOLDER_UNLOCKS.length,
    active: HOLDER_UNLOCKS.filter(u => now >= u.dateObj && u.status !== 'ended').length,
    upcoming: HOLDER_UNLOCKS.filter(u => now < u.dateObj).length,
    ended: HOLDER_UNLOCKS.filter(u => u.status === 'ended' || u.status === 'completed').length
  };

  const filteredVibeClubEpochs = VIBECLUB_EPOCHS.filter(u => {
    const isUnlocked = now >= u.dateObj;
    if (vibeClubFilter === 'all') return true;
    if (vibeClubFilter === 'active') return isUnlocked && u.status !== 'ended';
    if (vibeClubFilter === 'upcoming' || vibeClubFilter === 'locked') return !isUnlocked;
    if (vibeClubFilter === 'ended' || vibeClubFilter === 'completed') return u.status === 'ended' || u.status === 'completed';
    return true;
  });

  const vibeClubCounts = {
    all: VIBECLUB_EPOCHS.length,
    active: VIBECLUB_EPOCHS.filter(u => now >= u.dateObj && u.status !== 'ended').length,
    upcoming: VIBECLUB_EPOCHS.filter(u => now < u.dateObj).length,
    ended: VIBECLUB_EPOCHS.filter(u => u.status === 'ended' || u.status === 'completed').length
  };

  const filteredGiveaways = GIVEAWAYS_DATA.filter(e => {
    if (giveawayFilter === 'all') return true;
    if (giveawayFilter === 'active' || giveawayFilter === 'ongoing') return e.status === 'ongoing';
    if (giveawayFilter === 'upcoming') return e.status === 'upcoming';
    if (giveawayFilter === 'ended') return e.status === 'ended';
    return true;
  });

  const giveawayCounts = {
    all: GIVEAWAYS_DATA.length,
    active: GIVEAWAYS_DATA.filter(e => e.status === 'ongoing').length,
    upcoming: GIVEAWAYS_DATA.filter(e => e.status === 'upcoming').length,
    ended: GIVEAWAYS_DATA.filter(e => e.status === 'ended').length
  };

  const categoryCards = [
    {
      id: 'holders',
      label: 'Holder Rewards',
      image: '/rewards/holder-rewards.jfif',
    },
    {
      id: 'staking',
      label: 'Staking',
      image: '/rewards/staking.jfif',
    },
    {
      id: 'vibe-club',
      label: 'Vibe Club',
      image: '/rewards/vibe-club.jfif',
    },
    {
      id: 'giveaways',
      label: 'Giveaways',
      image: '/rewards/giveaways.jfif',
    },
    {
      id: 'vibe-verse',
      label: 'Vibe Verse',
      image: '/rewards/vibe-verse.jfif',
    },
  ];

  const getCategoryBadges = (catId) => {
    if (catId === 'vibe-verse') {
      return [{ type: 'coming-soon', label: 'COMING SOON' }];
    }

    let active = 0;
    let upcoming = 0;

    if (catId === 'holders') {
      active = HOLDER_UNLOCKS.filter(u => now >= u.dateObj).length;
      upcoming = HOLDER_UNLOCKS.filter(u => now < u.dateObj).length;
    } else if (catId === 'staking') {
      active = STAKING_EPOCHS.filter(e => e.status === 'active' || e.status === 'ongoing').length;
      upcoming = STAKING_EPOCHS.filter(e => e.status === 'upcoming').length;
    } else if (catId === 'vibe-club') {
      active = VIBECLUB_EPOCHS.filter(u => now >= u.dateObj).length;
      upcoming = VIBECLUB_EPOCHS.filter(u => now < u.dateObj).length;
    } else if (catId === 'giveaways') {
      active = GIVEAWAYS_DATA.filter(e => e.status === 'ongoing').length;
      upcoming = GIVEAWAYS_DATA.filter(e => e.status !== 'ended' && e.status !== 'ongoing').length;
    }

    const badges = [];
    if (active > 0) {
      badges.push({ type: 'active', label: `Active: ${active}` });
    }
    if (active === 0) {
      badges.push({ type: 'upcoming', label: `Upcoming: 1` });
    } else if (upcoming > 0) {
      badges.push({ type: 'upcoming', label: `Upcoming: 1` });
    }
    return badges;
  };

  return (
    <section id="rewards" className="alt" style={{ padding: '140px 0 100px 0' }}>
      <div className="wrap">
        {/* Main Rewards Hub Header (when no specific category is selected) */}
        {activeTab === null ? (
          <>
            <div className="sec-head" style={{ marginBottom: '36px' }}>
              <h2>Rewards <span className="bl">Hub</span>.</h2>
              <p className="sec-sub">Track active reward epochs and community events.</p>
            </div>

            {/* 5 Graphic Category Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
                gap: '24px',
                marginBottom: '40px'
              }}
            >
              {categoryCards.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => {
                    setActiveTab(cat.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  role="button"
                  tabIndex={0}
                  style={{
                    background: '#ffffff',
                    borderRadius: '24px',
                    border: '2px solid rgba(0, 82, 255, 0.18)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 8px 30px rgba(0, 82, 255, 0.08)',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = 'var(--blue)';
                    e.currentTarget.style.boxShadow = '0 16px 36px -4px rgba(0, 82, 255, 0.25)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'rgba(0, 82, 255, 0.18)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 82, 255, 0.08)';
                  }}
                >
                  {/* Card Image Banner */}
                  <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#f8fafc', overflow: 'hidden' }}>
                    <img
                      src={cat.image}
                      alt={cat.label}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />

                    {/* Top Right Status Badges (Crisp dark design) */}
                    <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px', zIndex: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {getCategoryBadges(cat.id).map((b, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: '#090d16',
                            color: b.type === 'active' ? '#22c55e' : b.type === 'coming-soon' ? '#f59e0b' : '#94a3b8',
                            border: b.type === 'active' ? '1px solid rgba(34, 197, 94, 0.4)' : b.type === 'coming-soon' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(148, 163, 184, 0.25)',
                            backdropFilter: 'blur(8px)',
                            padding: '3px 8px',
                            borderRadius: '99px',
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.45)',
                            letterSpacing: '0.03em',
                            textTransform: 'uppercase'
                          }}
                        >
                          {b.type === 'active' && (
                            <span
                              style={{
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                background: '#22c55e',
                                boxShadow: '0 0 6px #22c55e',
                                display: 'inline-block'
                              }}
                            />
                          )}
                          {b.type === 'coming-soon' && (
                            <Lock size={10} color="#f59e0b" strokeWidth={2.3} />
                          )}
                          {b.type === 'upcoming' && (
                            <Clock size={10} color="#94a3b8" strokeWidth={2.3} />
                          )}
                          {b.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Body: Left Title, Right Compact Explore Button */}
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
                    <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                      {cat.label}
                    </h3>
                    <div
                      style={{
                        background: 'var(--blue)',
                        color: '#ffffff',
                        padding: '9px 18px',
                        fontSize: '0.84rem',
                        fontWeight: 800,
                        borderRadius: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        width: 'auto',
                        minWidth: 'auto',
                        maxWidth: 'max-content',
                        boxShadow: '0 3px 12px rgba(0, 82, 255, 0.25)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>Explore</span> <ArrowRight size={14} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rewards Hub FAQ Section (Underneath Category Cards) */}
            <div style={{ marginTop: '54px' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(0, 82, 255, 0.08)',
                    color: 'var(--blue)',
                    border: '1px solid rgba(0, 82, 255, 0.18)',
                    padding: '5px 14px',
                    borderRadius: '99px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '10px'
                  }}
                >
                  <HelpCircle size={13} strokeWidth={2.5} />
                  <span>Important Rules &amp; FAQ</span>
                </div>
                <h3 style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>
                  Frequently Asked <span style={{ color: 'var(--blue)' }}>Questions</span>
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)' }}>
                  Key details on claiming methods, staking vaults, and distribution rules.
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  maxWidth: '820px',
                  margin: '0 auto'
                }}
              >
                {[
                  {
                    question: 'Where do I claim Holder Rewards & Vibe Club rewards?',
                    answer: 'Holder Rewards & Vibe Club rewards are claimed directly in the Rewards Hub.',
                    icon: <Sparkles size={18} color="var(--blue)" />,
                    iconBg: 'rgba(0, 82, 255, 0.08)',
                    renderAnswer: () => (
                      <span>
                        <strong style={{ color: 'var(--ink)' }}>Holder Rewards</strong> &amp; <strong style={{ color: 'var(--ink)' }}>Vibe Club</strong> rewards are claimed directly in the Rewards Hub.
                      </span>
                    )
                  },
                  {
                    question: 'How are Staking and Giveaway rewards distributed?',
                    answer: 'Staking rewards are claimed on o1. Giveaways are sent directly to winners.',
                    icon: <Coins size={18} color="#8b5cf6" />,
                    iconBg: 'rgba(139, 92, 246, 0.08)',
                    renderAnswer: () => (
                      <span>
                        <strong style={{ color: 'var(--ink)' }}>Staking</strong> rewards are claimed on o1. <strong style={{ color: 'var(--ink)' }}>Giveaways</strong> are sent directly to winners.
                      </span>
                    )
                  },
                  {
                    question: 'What is the rule for unclaimed reward tokens?',
                    answer: 'All unclaimed tokens within the claim period are permanently burned.',
                    icon: <Flame size={18} color="#ff5500" />,
                    iconBg: 'rgba(255, 85, 0, 0.08)',
                    renderAnswer: () => (
                      <span>
                        All unclaimed tokens within the claim period are <strong style={{ color: '#ff5500' }}>permanently burned</strong>.
                      </span>
                    )
                  }
                ].map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="rewards-faq-item"
                      style={{
                        borderRadius: '18px',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        style={{
                          width: '100%',
                          padding: '16px 20px',
                          background: 'transparent',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              background: faq.iconBg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {faq.icon}
                          </div>
                          <div>
                            <span style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--ink)', display: 'block' }}>
                              {faq.question}
                            </span>
                          </div>
                        </div>
                        <div
                          style={{
                            transform: isOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.25s ease',
                            color: 'var(--blue)',
                            display: 'flex',
                            alignItems: 'center',
                            flexShrink: 0
                          }}
                        >
                          <ChevronDown size={20} strokeWidth={2.5} />
                        </div>
                      </button>

                      {isOpen && (
                        <div
                          style={{
                            padding: '0 20px 18px 70px',
                            fontSize: '0.88rem',
                            color: 'var(--ink2)',
                            lineHeight: 1.55,
                            borderTop: '1px solid rgba(0, 82, 255, 0.08)'
                          }}
                        >
                          <div style={{ paddingTop: '12px' }}>
                            {faq.renderAnswer()}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Detail View for Selected Category with Back Button & Quick Switcher */
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
              <button
                onClick={() => setActiveTab(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ffffff',
                  border: '1.5px solid rgba(0, 82, 255, 0.25)',
                  color: 'var(--blue)',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  padding: '10px 20px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 82, 255, 0.08)',
                  transition: 'all 0.15s'
                }}
              >
                <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Rewards Hub
              </button>

              <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '14px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                {categoryCards.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setActiveTab(c.id)}
                    style={{
                      fontFamily: 'var(--font)',
                      background: activeTab === c.id ? 'var(--blue)' : 'transparent',
                      color: activeTab === c.id ? '#ffffff' : '#64748b',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '10px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 1. STAKING REWARDS SECTION ── */}
        {activeTab === 'staking' && (
          <div style={{ marginBottom: '40px' }}>
            {/* 1. 3-Point Staking Info Grid (Signature Brand Turquoise) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '28px' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(190, 241, 255, 0.55) 0%, rgba(225, 249, 255, 0.75) 100%)',
                  border: '1px solid rgba(0, 160, 255, 0.25)',
                  borderRadius: '16px',
                  padding: '16px 18px',
                  boxShadow: '0 2px 8px rgba(0, 82, 255, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--blue)', background: 'rgba(0, 0, 255, 0.12)', width: '22px', height: '22px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--ink)', fontWeight: 800 }}>Stake</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.45 }}>
                  Lock $VIBE tokens directly into the verified staking pool on <a href={O1_STAKING_VAULT} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', textDecoration: 'underline', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>o1.exchange <ArrowUpRight size={13} strokeWidth={2.5} /></a> on Base.
                </p>
              </div>

              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(190, 241, 255, 0.55) 0%, rgba(225, 249, 255, 0.75) 100%)',
                  border: '1px solid rgba(0, 160, 255, 0.25)',
                  borderRadius: '16px',
                  padding: '16px 18px',
                  boxShadow: '0 2px 8px rgba(0, 82, 255, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--blue)', background: 'rgba(0, 0, 255, 0.12)', width: '22px', height: '22px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--ink)', fontWeight: 800 }}>10-Day Epochs</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.45 }}>
                  Staking rewards are distributed every 10 days, followed by the start of a new epoch.
                </p>
              </div>

              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(190, 241, 255, 0.55) 0%, rgba(225, 249, 255, 0.75) 100%)',
                  border: '1px solid rgba(0, 160, 255, 0.25)',
                  borderRadius: '16px',
                  padding: '16px 18px',
                  boxShadow: '0 2px 8px rgba(0, 82, 255, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#059669', background: 'rgba(16, 185, 129, 0.14)', width: '22px', height: '22px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--ink)', fontWeight: 800 }}>Epoch Reward Pool</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.45 }}>
                  Equals 15% of the total Community Rewards Pool available at the start of each epoch.
                </p>
              </div>
            </div>

            {/* 2. Sub-Header with Filter Tabs (Left Aligned Next to Title) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em' }}>Staking Epochs</h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', background: '#ffffff', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '99px' }}>
                  {filteredStakingEpochs.length}
                </span>
              </div>

              {/* Status Filter for Staking Epochs (Aligned to Left) */}
              <div style={{ display: 'flex', gap: '4px', background: '#ffffff', padding: '3px', borderRadius: '99px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', flexWrap: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                {[
                  { id: 'all', label: `All (${stakingCounts.all})` },
                  { id: 'active', label: `Active (${stakingCounts.active})` },
                  { id: 'upcoming', label: `Upcoming (${stakingCounts.upcoming})` },
                  { id: 'ended', label: `Ended (${stakingCounts.ended})` }
                ].map(f => {
                  const isFActive = stakingFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setStakingFilter(f.id)}
                      style={{
                        fontFamily: 'var(--font)',
                        padding: '4px 10px',
                        borderRadius: '99px',
                        border: 'none',
                        background: isFActive ? 'var(--blue)' : 'transparent',
                        color: isFActive ? '#ffffff' : '#64748b',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        letterSpacing: '-0.01em',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Modern Web3 DeFi Epoch Cards Grid with Mascot Integration */}
            {filteredStakingEpochs.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem' }}>
                No epochs found for this filter.
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 270px), 1fr))',
                  gap: '16px'
                }}
              >
                {filteredStakingEpochs.map(ep => {
                  const isActive = ep.status === 'active' || ep.status === 'ongoing';
                  const isCompleted = ep.status === 'completed' || ep.status === 'ended';

                  return (
                    <div
                      key={ep.epoch}
                      style={{
                        background: isActive
                          ? 'linear-gradient(145deg, rgba(215, 246, 255, 0.85) 0%, rgba(240, 252, 255, 0.95) 100%)'
                          : 'linear-gradient(145deg, rgba(225, 248, 255, 0.55) 0%, rgba(245, 253, 255, 0.8) 100%)',
                        border: isActive ? '2px solid var(--blue)' : '1.5px solid rgba(0, 160, 255, 0.25)',
                        borderRadius: '22px',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: isActive ? '0 12px 36px -4px rgba(0, 82, 255, 0.16), 0 2px 10px rgba(0, 0, 0, 0.04)' : '0 4px 16px rgba(0, 82, 255, 0.05)',
                        position: 'relative',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div>
                        {/* Header with Mascot & Status Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                            <img
                              src="/new-logo-vibe.png"
                              alt="VIBE"
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: isActive ? '2px solid var(--blue)' : '1.5px solid rgba(0, 160, 255, 0.3)',
                                boxShadow: '0 2px 8px rgba(0, 82, 255, 0.15)',
                                flexShrink: 0
                              }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                                {ep.epoch}
                              </h4>
                              <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--blue)', background: 'rgba(0, 0, 255, 0.08)', padding: '2px 6px', borderRadius: '6px', whiteSpace: 'nowrap', border: '1px solid rgba(0, 0, 255, 0.12)' }}>
                                {ep.duration || '10 Days'}
                              </span>
                            </div>
                          </div>

                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '99px',
                              fontSize: '0.66rem',
                              fontWeight: 900,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              background: isActive ? '#ecfdf5' : 'rgba(255, 255, 255, 0.9)',
                              color: isActive ? '#059669' : '#64748b',
                              border: isActive ? '1px solid #a7f3d0' : '1px solid rgba(0, 160, 255, 0.25)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                              boxShadow: isActive ? '0 2px 8px rgba(16, 185, 129, 0.15)' : 'none'
                            }}
                          >
                            {isActive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', flexShrink: 0 }} />}
                            {isActive ? 'Active' : isCompleted ? 'Completed' : 'Upcoming'}
                          </span>
                        </div>

                        {/* Metric Box (Rewards Pool) */}
                        <div
                          style={{
                            background: '#ffffff',
                            borderRadius: '16px',
                            padding: '14px 16px',
                            border: '1px solid rgba(0, 160, 255, 0.22)',
                            boxShadow: '0 3px 12px rgba(0, 82, 255, 0.05)',
                            marginBottom: '14px'
                          }}
                        >
                          <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                            <Coins size={12} color="var(--blue)" /> Rewards Pool
                          </div>
                          <div style={{ fontSize: '1.42rem', fontWeight: 900, color: isActive ? 'var(--ink)' : '#64748b', marginTop: '2px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '5px', whiteSpace: 'nowrap' }}>
                            {ep.poolAmount} {ep.poolAmount !== 'TBA' && <span style={{ fontSize: '0.88rem', color: isActive ? 'var(--blue)' : '#94a3b8', fontWeight: 800 }}>$VIBE</span>}
                          </div>
                        </div>

                        {/* Schedule Key-Values with Icons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.65)', padding: '7px 11px', borderRadius: '10px', border: '1px solid rgba(0, 160, 255, 0.12)', gap: '8px' }}>
                            <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.74rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                              <Calendar size={12} color="#0284c7" /> Start Time
                            </span>
                            <strong style={{ color: isActive ? 'var(--ink)' : '#475569', fontWeight: 700, fontSize: '0.76rem', whiteSpace: 'nowrap', textAlign: 'right' }}>{ep.startTime}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.65)', padding: '7px 11px', borderRadius: '10px', border: '1px solid rgba(0, 160, 255, 0.12)', gap: '8px' }}>
                            <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.74rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                              <Clock size={12} color="#0284c7" /> End Time
                            </span>
                            <strong style={{ color: isActive ? 'var(--ink)' : '#475569', fontWeight: 700, fontSize: '0.76rem', whiteSpace: 'nowrap', textAlign: 'right' }}>{ep.endTime}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      {isActive ? (
                        <a
                          href={ep.link || O1_STAKING_VAULT}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-fill"
                          style={{
                            background: 'var(--blue)',
                            color: '#ffffff',
                            padding: '11px 14px',
                            fontSize: '0.86rem',
                            fontWeight: 800,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 16px rgba(0, 0, 255, 0.3)',
                            transition: 'all 0.15s'
                          }}
                        >
                          <span>Stake & Earn</span> <ArrowUpRight size={15} strokeWidth={2.5} />
                        </a>
                      ) : (
                        <button
                          disabled
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '11px 14px',
                            fontSize: '0.86rem',
                            fontWeight: 800,
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.75)',
                            color: '#94a3b8',
                            border: '1.5px solid rgba(0, 160, 255, 0.18)',
                            cursor: 'not-allowed',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Coming Soon
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {/* Bottom Info Strip: More Epochs Appearing Continuously */}
            <div
              style={{
                marginTop: '24px',
                padding: '14px 20px',
                background: 'rgba(255, 255, 255, 0.65)',
                border: '1px dashed rgba(0, 160, 255, 0.35)',
                borderRadius: '16px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#475569',
                fontSize: '0.84rem',
                fontWeight: 700
              }}
            >
              <Sparkles size={15} color="var(--blue)" />
              <span>More staking epochs will be added continuously</span>
            </div>
          </div>
        )}

        {/* ── 2. VIBE CLUB NFT REWARDS SECTION ── */}
        {activeTab === 'vibe-club' && (
          <div style={{ marginTop: '20px' }}>
            {/* 1. Top 3 Step Action Cards (Signature Brand Turquoise) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '14px',
                marginBottom: '28px'
              }}
            >
              {/* Step 1 */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(190, 241, 255, 0.55) 0%, rgba(225, 249, 255, 0.75) 100%)',
                  border: '1px solid rgba(0, 160, 255, 0.25)',
                  borderRadius: '16px',
                  padding: '16px 18px',
                  boxShadow: '0 2px 8px rgba(0, 82, 255, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--blue)', background: 'rgba(0, 0, 255, 0.12)', width: '22px', height: '22px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--ink)', fontWeight: 800 }}>Join Vibe Club</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.45 }}>
                  Mint your Vibe Club NFT on the <a href="https://vibeverse.dog/vibeclub" target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', textDecoration: 'underline', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>Mint Page <ArrowUpRight size={13} strokeWidth={2.5} /></a> to become eligible for club royalties.
                </p>
              </div>

              {/* Step 2 */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(190, 241, 255, 0.55) 0%, rgba(225, 249, 255, 0.75) 100%)',
                  border: '1px solid rgba(0, 160, 255, 0.25)',
                  borderRadius: '16px',
                  padding: '16px 18px',
                  boxShadow: '0 2px 8px rgba(0, 82, 255, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--blue)', background: 'rgba(0, 0, 255, 0.12)', width: '22px', height: '22px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--ink)', fontWeight: 800 }}>Claim Club Royalties</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.45 }}>
                  Available to all Vibe Club NFT holders at the time of snapshots at 00:00 UTC on claim day.
                </p>
              </div>

              {/* Step 3 */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(190, 241, 255, 0.55) 0%, rgba(225, 249, 255, 0.75) 100%)',
                  border: '1px solid rgba(0, 160, 255, 0.25)',
                  borderRadius: '16px',
                  padding: '16px 18px',
                  boxShadow: '0 2px 8px rgba(0, 82, 255, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#059669', background: 'rgba(16, 185, 129, 0.14)', width: '22px', height: '22px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--ink)', fontWeight: 800 }}>Vibe Club Royalty Pool</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.45 }}>
                  Equals 15% of the total Community Rewards Pool available at the start of each epoch.
                </p>
              </div>
            </div>

            {/* 2. Sub-Header: Title & Filter Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                  Vibe Club Royalties
                </h3>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '99px', border: '1px solid #cbd5e1' }}>
                  {filteredVibeClubEpochs.length}
                </span>
              </div>

              {/* Status Filters */}
              <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '99px', border: '1px solid #e2e8f0', flexWrap: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                {[
                  { id: 'all', label: `All (${vibeClubCounts.all})` },
                  { id: 'active', label: `Active (${vibeClubCounts.active})` },
                  { id: 'upcoming', label: `Upcoming (${vibeClubCounts.upcoming})` },
                  { id: 'ended', label: `Ended (${vibeClubCounts.ended})` }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setVibeClubFilter(f.id)}
                    style={{
                      fontFamily: 'var(--font)',
                      background: vibeClubFilter === f.id ? 'var(--blue)' : 'transparent',
                      color: vibeClubFilter === f.id ? '#ffffff' : '#64748b',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '99px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. 4 Scalable Vibe Club Epoch Cards Grid */}
            {filteredVibeClubEpochs.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem' }}>
                No royalty rounds found for this filter.
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 270px), 1fr))',
                  gap: '16px'
                }}
              >
                {filteredVibeClubEpochs.map((ep, idx) => {
                  const isUnlocked = now >= ep.dateObj;

                  return (
                    <div
                      key={ep.epoch || idx}
                      style={{
                        background: isUnlocked
                          ? 'linear-gradient(145deg, rgba(215, 246, 255, 0.85) 0%, rgba(240, 252, 255, 0.95) 100%)'
                          : 'linear-gradient(145deg, rgba(225, 248, 255, 0.55) 0%, rgba(245, 253, 255, 0.8) 100%)',
                        border: isUnlocked ? '2px solid var(--blue)' : '1.5px solid rgba(0, 160, 255, 0.25)',
                        borderRadius: '22px',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: isUnlocked ? '0 12px 36px -4px rgba(0, 82, 255, 0.16), 0 2px 10px rgba(0, 0, 0, 0.04)' : '0 4px 16px rgba(0, 82, 255, 0.05)',
                        position: 'relative',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div>
                        {/* Header with Mascot & Status Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                            <img
                              src="/new-logo-vibe.png"
                              alt="VIBE"
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: isUnlocked ? '2px solid var(--blue)' : '1.5px solid rgba(0, 160, 255, 0.3)',
                                boxShadow: '0 2px 8px rgba(0, 82, 255, 0.15)',
                                flexShrink: 0
                              }}
                            />
                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                              {ep.epoch}
                            </h4>
                          </div>

                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '99px',
                              fontSize: '0.66rem',
                              fontWeight: 900,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              background: isUnlocked ? '#ecfdf5' : 'rgba(255, 255, 255, 0.9)',
                              color: isUnlocked ? '#059669' : '#64748b',
                              border: isUnlocked ? '1px solid #a7f3d0' : '1px solid rgba(0, 160, 255, 0.25)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                              boxShadow: isUnlocked ? '0 2px 8px rgba(16, 185, 129, 0.15)' : 'none'
                            }}
                          >
                            {isUnlocked ? (
                              <>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', flexShrink: 0 }} />
                                Unlocked
                              </>
                            ) : (
                              <>
                                <Lock size={11} color="#64748b" style={{ flexShrink: 0 }} />
                                Locked
                              </>
                            )}
                          </span>
                        </div>

                        {/* Metric Box (Royalty Pool) */}
                        <div
                          style={{
                            background: '#ffffff',
                            borderRadius: '16px',
                            padding: '14px 16px',
                            border: '1px solid rgba(0, 160, 255, 0.22)',
                            boxShadow: '0 3px 12px rgba(0, 82, 255, 0.05)',
                            marginBottom: '14px'
                          }}
                        >
                          <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                            <Coins size={12} color="var(--blue)" /> Royalty Pool
                          </div>
                          <div style={{ fontSize: '1.42rem', fontWeight: 900, color: isUnlocked ? 'var(--ink)' : '#64748b', marginTop: '2px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '5px', whiteSpace: 'nowrap' }}>
                            {ep.poolAmount}
                          </div>
                        </div>

                        {/* Schedule Key-Values with Icons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.65)', padding: '7px 11px', borderRadius: '10px', border: '1px solid rgba(0, 160, 255, 0.12)', gap: '8px' }}>
                            <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.74rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                              <Calendar size={12} color="#0284c7" /> Claim Date
                            </span>
                            <strong style={{ color: isUnlocked ? 'var(--ink)' : '#475569', fontWeight: 700, fontSize: '0.76rem', whiteSpace: 'nowrap', textAlign: 'right' }}>{ep.claimDate}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.65)', padding: '7px 11px', borderRadius: '10px', border: '1px solid rgba(0, 160, 255, 0.12)', gap: '8px' }}>
                            <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.74rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                              <ShieldCheck size={12} color="#0284c7" /> Requirement
                            </span>
                            <strong style={{ color: isUnlocked ? 'var(--ink)' : '#475569', fontWeight: 700, fontSize: '0.76rem', whiteSpace: 'nowrap', textAlign: 'right' }}>NFT Holder</strong>
                          </div>
                        </div>
                      </div>

                      {/* Action Button: Claim or Locked */}
                      {isUnlocked ? (
                        <button
                          className="btn-fill"
                          style={{
                            background: 'var(--blue)',
                            color: '#ffffff',
                            padding: '11px 14px',
                            fontSize: '0.86rem',
                            fontWeight: 800,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 16px rgba(0, 0, 255, 0.3)',
                            transition: 'all 0.15s',
                            cursor: 'pointer',
                            border: 'none'
                          }}
                        >
                          <span>Claim</span> <ArrowUpRight size={15} strokeWidth={2.5} />
                        </button>
                      ) : (
                        <button
                          disabled
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '11px 14px',
                            fontSize: '0.86rem',
                            fontWeight: 800,
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.75)',
                            color: '#94a3b8',
                            border: '1.5px solid rgba(0, 160, 255, 0.18)',
                            cursor: 'not-allowed',
                            whiteSpace: 'nowrap',
                            gap: '6px'
                          }}
                        >
                          <Lock size={13} /> Locked
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Info Strip */}
            <div
              style={{
                marginTop: '24px',
                padding: '14px 20px',
                background: 'rgba(255, 255, 255, 0.65)',
                border: '1px dashed rgba(0, 160, 255, 0.35)',
                borderRadius: '16px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#475569',
                fontSize: '0.84rem',
                fontWeight: 700
              }}
            >
              <Sparkles size={15} color="var(--blue)" />
              <span>More Vibe Club epochs will be added continuously</span>
            </div>
          </div>
        )}

        {/* ── 3. VIBEVERSE APP REWARDS SECTION ── */}
        {activeTab === 'vibe-verse' && (
          <div
            style={{
              marginTop: '20px',
              padding: '60px 24px',
              background: 'linear-gradient(145deg, rgba(215, 246, 255, 0.85) 0%, rgba(240, 252, 255, 0.95) 100%)',
              border: '1.5px solid rgba(0, 160, 255, 0.25)',
              borderRadius: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              boxShadow: '0 8px 30px rgba(0, 82, 255, 0.06)'
            }}
          >
            <img
              src="/new-logo-vibe.png"
              alt="VIBE"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--blue)',
                boxShadow: '0 4px 16px rgba(0, 82, 255, 0.2)'
              }}
            />
            <div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--ink)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                VibeVerse Rewards
              </h3>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(0, 82, 255, 0.1)',
                  color: 'var(--blue)',
                  border: '1px solid rgba(0, 82, 255, 0.2)',
                  padding: '6px 16px',
                  borderRadius: '99px',
                  fontSize: '0.86rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                <Sparkles size={14} color="var(--blue)" /> Coming Soon
              </span>
            </div>
          </div>
        )}

        {/* ── 4. HOLDER REWARDS VESTING SECTION ── */}
        {activeTab === 'holders' && (
          <div style={{ marginTop: '20px' }}>
            {/* 1. Top 3 Step Action Cards (Signature Brand Turquoise) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '28px' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(190, 241, 255, 0.55) 0%, rgba(225, 249, 255, 0.75) 100%)',
                  border: '1px solid rgba(0, 160, 255, 0.25)',
                  borderRadius: '16px',
                  padding: '16px 18px',
                  boxShadow: '0 2px 8px rgba(0, 82, 255, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--blue)', background: 'rgba(0, 0, 255, 0.12)', width: '22px', height: '22px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--ink)', fontWeight: 800 }}>Explore Holder Rewards Details</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.45 }}>
                  All vesting details and schedule are available in the <a href="/tokenomics#vesting-details" target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', textDecoration: 'underline', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>Tokenomics <ArrowUpRight size={13} strokeWidth={2.5} /></a> section under Vesting Details.
                </p>
              </div>

              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(190, 241, 255, 0.55) 0%, rgba(225, 249, 255, 0.75) 100%)',
                  border: '1px solid rgba(0, 160, 255, 0.25)',
                  borderRadius: '16px',
                  padding: '16px 18px',
                  boxShadow: '0 2px 8px rgba(0, 82, 255, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--blue)', background: 'rgba(0, 0, 255, 0.12)', width: '22px', height: '22px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--ink)', fontWeight: 800 }}>Buy &amp; Hold</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.45 }}>
                  Hold 5M+ $VIBE tokens at the time of each unlock snapshot to share the pool.
                </p>
              </div>

              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(190, 241, 255, 0.55) 0%, rgba(225, 249, 255, 0.75) 100%)',
                  border: '1px solid rgba(0, 160, 255, 0.25)',
                  borderRadius: '16px',
                  padding: '16px 18px',
                  boxShadow: '0 2px 8px rgba(0, 82, 255, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#059669', background: 'rgba(16, 185, 129, 0.14)', width: '22px', height: '22px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--ink)', fontWeight: 800 }}>Holder Rewards Pool</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.45 }}>
                  100M $VIBE vested with 10M monthly unlocks distributed among all eligible holders.
                </p>
              </div>
            </div>

            {/* 2. Sub-Header: Title & Filter Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                  Holder Rewards
                </h3>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '99px', border: '1px solid #cbd5e1' }}>
                  {filteredHolderUnlocks.length}
                </span>
              </div>

              {/* Status Filters */}
              <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '99px', border: '1px solid #e2e8f0', flexWrap: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                {[
                  { id: 'all', label: `All (${holderCounts.all})` },
                  { id: 'active', label: `Active (${holderCounts.active})` },
                  { id: 'upcoming', label: `Upcoming (${holderCounts.upcoming})` },
                  { id: 'ended', label: `Ended (${holderCounts.ended})` }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setHolderFilter(f.id)}
                    style={{
                      fontFamily: 'var(--font)',
                      background: holderFilter === f.id ? 'var(--blue)' : 'transparent',
                      color: holderFilter === f.id ? '#ffffff' : '#64748b',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '99px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. 10 Scalable Holder Unlock Cards Grid */}
            {filteredHolderUnlocks.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem' }}>
                No unlock rounds found for this filter.
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 270px), 1fr))',
                  gap: '16px'
                }}
              >
                {filteredHolderUnlocks.map((u, idx) => {
                  const isUnlocked = now >= u.dateObj;

                  return (
                    <div
                      key={u.unlock || idx}
                      style={{
                        background: isUnlocked
                          ? 'linear-gradient(145deg, rgba(215, 246, 255, 0.85) 0%, rgba(240, 252, 255, 0.95) 100%)'
                          : 'linear-gradient(145deg, rgba(225, 248, 255, 0.55) 0%, rgba(245, 253, 255, 0.8) 100%)',
                        border: isUnlocked ? '2px solid var(--blue)' : '1.5px solid rgba(0, 160, 255, 0.25)',
                        borderRadius: '22px',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: isUnlocked ? '0 12px 36px -4px rgba(0, 82, 255, 0.16), 0 2px 10px rgba(0, 0, 0, 0.04)' : '0 4px 16px rgba(0, 82, 255, 0.05)',
                        position: 'relative',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div>
                        {/* Header with Mascot & Status Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                            <img
                              src="/new-logo-vibe.png"
                              alt="VIBE"
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: isUnlocked ? '2px solid var(--blue)' : '1.5px solid rgba(0, 160, 255, 0.3)',
                                boxShadow: '0 2px 8px rgba(0, 82, 255, 0.15)',
                                flexShrink: 0
                              }}
                            />
                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                              {u.unlock}
                            </h4>
                          </div>

                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '99px',
                              fontSize: '0.66rem',
                              fontWeight: 900,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              background: isUnlocked ? '#ecfdf5' : 'rgba(255, 255, 255, 0.9)',
                              color: isUnlocked ? '#059669' : '#64748b',
                              border: isUnlocked ? '1px solid #a7f3d0' : '1px solid rgba(0, 160, 255, 0.25)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                              boxShadow: isUnlocked ? '0 2px 8px rgba(16, 185, 129, 0.15)' : 'none'
                            }}
                          >
                            {isUnlocked ? (
                              <>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', flexShrink: 0 }} />
                                Unlocked
                              </>
                            ) : (
                              <>
                                <Lock size={11} color="#64748b" style={{ flexShrink: 0 }} />
                                Locked
                              </>
                            )}
                          </span>
                        </div>

                        {/* Metric Box (Rewards Pool) */}
                        <div
                          style={{
                            background: '#ffffff',
                            borderRadius: '16px',
                            padding: '14px 16px',
                            border: '1px solid rgba(0, 160, 255, 0.22)',
                            boxShadow: '0 3px 12px rgba(0, 82, 255, 0.05)',
                            marginBottom: '14px'
                          }}
                        >
                          <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                            <Coins size={12} color="var(--blue)" /> Rewards Pool
                          </div>
                          <div style={{ fontSize: '1.42rem', fontWeight: 900, color: isUnlocked ? 'var(--ink)' : '#64748b', marginTop: '2px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '5px', whiteSpace: 'nowrap' }}>
                            {u.poolAmount} <span style={{ fontSize: '0.88rem', color: isUnlocked ? 'var(--blue)' : '#94a3b8', fontWeight: 800 }}>$VIBE</span>
                          </div>
                        </div>

                        {/* Schedule Key-Values with Icons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.65)', padding: '7px 11px', borderRadius: '10px', border: '1px solid rgba(0, 160, 255, 0.12)', gap: '8px' }}>
                            <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.74rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                              <Calendar size={12} color="#0284c7" /> Unlock Date
                            </span>
                            <strong style={{ color: isUnlocked ? 'var(--ink)' : '#475569', fontWeight: 700, fontSize: '0.76rem', whiteSpace: 'nowrap', textAlign: 'right' }}>{u.unlockDate}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.65)', padding: '7px 11px', borderRadius: '10px', border: '1px solid rgba(0, 160, 255, 0.12)', gap: '8px' }}>
                            <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.74rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                              <ShieldCheck size={12} color="#0284c7" /> Requirement
                            </span>
                            <strong style={{ color: isUnlocked ? 'var(--ink)' : '#475569', fontWeight: 700, fontSize: '0.76rem', whiteSpace: 'nowrap', textAlign: 'right' }}>5M+ $VIBE Balance</strong>
                          </div>
                        </div>
                      </div>

                      {/* Action Button: Claim redirect or Locked */}
                      {isUnlocked ? (
                        <Link
                          to="/checker"
                          className="btn-fill"
                          style={{
                            background: 'var(--blue)',
                            color: '#ffffff',
                            padding: '11px 14px',
                            fontSize: '0.86rem',
                            fontWeight: 800,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 16px rgba(0, 0, 255, 0.3)',
                            transition: 'all 0.15s'
                          }}
                        >
                          <span>Claim</span> <ArrowUpRight size={15} strokeWidth={2.5} />
                        </Link>
                      ) : (
                        <button
                          disabled
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '11px 14px',
                            fontSize: '0.86rem',
                            fontWeight: 800,
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.75)',
                            color: '#94a3b8',
                            border: '1.5px solid rgba(0, 160, 255, 0.18)',
                            cursor: 'not-allowed',
                            whiteSpace: 'nowrap',
                            gap: '6px'
                          }}
                        >
                          <Lock size={13} /> Locked
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ── 5. GIVEAWAYS SECTION ── */}
        {activeTab === 'giveaways' && (
          <div style={{ marginTop: '20px' }}>
            {/* Sub-Header: Title & Filter Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                  Giveaways
                </h3>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '99px', border: '1px solid #cbd5e1' }}>
                  {filteredGiveaways.length}
                </span>
              </div>

              {/* Status Filters */}
              <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '99px', border: '1px solid #e2e8f0', flexWrap: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                {[
                  { id: 'all', label: `All (${giveawayCounts.all})` },
                  { id: 'active', label: `Active (${giveawayCounts.active})` },
                  { id: 'ended', label: `Ended (${giveawayCounts.ended})` }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setGiveawayFilter(f.id)}
                    style={{
                      fontFamily: 'var(--font)',
                      background: (giveawayFilter === f.id || (f.id === 'active' && giveawayFilter === 'ongoing')) ? 'var(--blue)' : 'transparent',
                      color: (giveawayFilter === f.id || (f.id === 'active' && giveawayFilter === 'ongoing')) ? '#ffffff' : '#64748b',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '99px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Giveaways Grid */}
            {filteredGiveaways.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem' }}>
                No giveaways found for this filter.
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 270px), 1fr))',
                  gap: '16px'
                }}
              >
                {filteredGiveaways.map((ev) => {
                  const isOngoing = ev.status === 'ongoing';

                  return (
                    <div
                      key={ev.id}
                      style={{
                        background: isOngoing
                          ? 'linear-gradient(145deg, rgba(215, 246, 255, 0.85) 0%, rgba(240, 252, 255, 0.95) 100%)'
                          : 'linear-gradient(145deg, rgba(225, 248, 255, 0.55) 0%, rgba(245, 253, 255, 0.8) 100%)',
                        border: isOngoing ? '2px solid var(--blue)' : '1.5px solid rgba(0, 160, 255, 0.25)',
                        borderRadius: '22px',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: isOngoing
                          ? '0 12px 36px -4px rgba(0, 82, 255, 0.16), 0 2px 10px rgba(0, 0, 0, 0.04)'
                          : '0 4px 16px rgba(0, 82, 255, 0.05)',
                        position: 'relative',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div>
                        {/* Header with Mascot & Status Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <img
                              src="/new-logo-vibe.png"
                              alt="VIBE"
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: isOngoing ? '2px solid var(--blue)' : '1.5px solid rgba(0, 160, 255, 0.3)',
                                boxShadow: '0 2px 8px rgba(0, 82, 255, 0.15)',
                                flexShrink: 0
                              }}
                            />
                            <h4
                              style={{
                                margin: 0,
                                fontSize: '1.02rem',
                                fontWeight: 900,
                                color: 'var(--ink)',
                                letterSpacing: '-0.02em',
                                lineHeight: 1.25
                              }}
                            >
                              {ev.title}
                            </h4>
                          </div>

                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '99px',
                              fontSize: '0.66rem',
                              fontWeight: 900,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              background: isOngoing ? '#ecfdf5' : 'rgba(255, 255, 255, 0.9)',
                              color: isOngoing ? '#059669' : '#64748b',
                              border: isOngoing ? '1px solid #a7f3d0' : '1px solid rgba(0, 160, 255, 0.25)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                              boxShadow: isOngoing ? '0 2px 8px rgba(16, 185, 129, 0.15)' : 'none'
                            }}
                          >
                            {isOngoing ? (
                              <>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', flexShrink: 0 }} />
                                Ongoing
                              </>
                            ) : (
                              <>
                                <Clock size={11} color="#64748b" style={{ flexShrink: 0 }} />
                                Ended
                              </>
                            )}
                          </span>
                        </div>

                        {/* Metric Box (Prize Pool) */}
                        <div
                          style={{
                            background: '#ffffff',
                            borderRadius: '16px',
                            padding: '14px 16px',
                            border: '1px solid rgba(0, 160, 255, 0.22)',
                            boxShadow: '0 3px 12px rgba(0, 82, 255, 0.05)',
                            marginBottom: '14px'
                          }}
                        >
                          <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                            <Coins size={12} color="var(--blue)" /> Prize Pool
                          </div>
                          <div style={{ fontSize: '1.42rem', fontWeight: 900, color: isOngoing ? 'var(--ink)' : '#64748b', marginTop: '2px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '5px', whiteSpace: 'nowrap' }}>
                            {ev.prizePool}
                          </div>
                        </div>

                        {/* Key-Values with Icons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.65)', padding: '7px 11px', borderRadius: '10px', border: '1px solid rgba(0, 160, 255, 0.12)', gap: '8px' }}>
                            <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.74rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                              <Users size={12} color="#0284c7" /> Winners
                            </span>
                            <strong style={{ color: isOngoing ? 'var(--ink)' : '#475569', fontWeight: 700, fontSize: '0.76rem', whiteSpace: 'nowrap', textAlign: 'right' }}>{ev.winners}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.65)', padding: '7px 11px', borderRadius: '10px', border: '1px solid rgba(0, 160, 255, 0.12)', gap: '8px' }}>
                            <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.74rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                              <Gift size={12} color="#0284c7" /> Distribution
                            </span>
                            <strong style={{ color: isOngoing ? 'var(--ink)' : '#475569', fontWeight: 700, fontSize: '0.76rem', whiteSpace: 'nowrap', textAlign: 'right' }}>{ev.distribution}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <a
                        href={ev.link}
                        target="_blank"
                        rel="noreferrer"
                        className={isOngoing ? 'btn-fill' : ''}
                        style={{
                          background: isOngoing ? 'var(--blue)' : '#ffffff',
                          color: isOngoing ? '#ffffff' : 'var(--ink)',
                          border: isOngoing ? 'none' : '1.5px solid rgba(0, 160, 255, 0.35)',
                          padding: '11px 14px',
                          fontSize: '0.86rem',
                          fontWeight: 800,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          width: '100%',
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                          boxShadow: isOngoing ? '0 4px 16px rgba(0, 0, 255, 0.3)' : '0 1px 4px rgba(0,0,0,0.02)',
                          transition: 'all 0.15s'
                        }}
                      >
                        <span>{isOngoing ? 'Participate' : 'View Event'}</span>
                        <ArrowUpRight size={15} strokeWidth={2.5} color={isOngoing ? '#ffffff' : 'var(--blue)'} />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Info Strip */}
            <div
              style={{
                marginTop: '24px',
                padding: '14px 20px',
                background: 'rgba(255, 255, 255, 0.65)',
                border: '1px dashed rgba(0, 160, 255, 0.35)',
                borderRadius: '16px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#475569',
                fontSize: '0.84rem',
                fontWeight: 700
              }}
            >
              <Sparkles size={15} color="var(--blue)" />
              <span>More giveaways coming soon</span>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

function LandingPage() {
  return (
    <>
      <Hero/>
      <div className="divr"/>
      <About/>
      <div className="divr"/>
      <Tokenomics/>
      <div className="divr"/>
      <Roadmap/>
      <div className="divr"/>
      <Chart/>
      <div className="divr"/>
      <Swap/>
    </>
  );
}

function StandaloneLayout({ children }) {
  return (
    <div className="standalone-page">
      <Nav />
      {children}
      <Footer />
    </div>
  );
}

function VibeClubRedirect() {
  useEffect(() => {
    window.location.href = 'https://vibeverse.dog/vibeclub';
  }, []);
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <Loader2 size={32} className="spin" color="var(--blue)" />
      <p style={{ fontWeight: 600, color: 'var(--muted)' }}>Redirecting to Vibe Club Mint on VibeVerse...</p>
    </div>
  );
}

function DomainRouter() {
  const location = useLocation();
  const isGameDomain = typeof window !== 'undefined' && window.location.hostname.toLowerCase().includes('vibeverse');
  const isDevPreview = new URLSearchParams(location.search).get('preview') === 'true';

  useEffect(() => {
    if (isGameDomain) {
      document.title = "Vibe Club NFT Mint & VibeVerse — The Base Dog";
    } else {
      document.title = "$VIBE — The Base Dog";
    }
  }, [isGameDomain]);

  return (
    <Routes>
      {/* ── Standalone VIBE Club NFT Mint Page / Redirect ── */}
      <Route path="/vibeclub" element={isGameDomain ? <NftClubPage /> : <VibeClubRedirect />} />
      <Route path="/vibe-club" element={isGameDomain ? <NftClubPage /> : <VibeClubRedirect />} />
      <Route path="/nft-club" element={isGameDomain ? <NftClubPage /> : <VibeClubRedirect />} />
      <Route path="/nft" element={isGameDomain ? <NftClubPage /> : <VibeClubRedirect />} />
      <Route path="/mint" element={isGameDomain ? <NftClubPage /> : <VibeClubRedirect />} />

      {/* ── Main Routing ── */}
      <Route
        path="/"
        element={
          isGameDomain
            ? (isDevPreview ? <VibeVerse /> : <VibeVerseLockScreen />)
            : <><Nav /><LandingPage /><Footer /></>
        }
      />
      <Route path="/about" element={<StandaloneLayout><About /></StandaloneLayout>} />
      <Route path="/tokenomics" element={<StandaloneLayout><Tokenomics /></StandaloneLayout>} />

      <Route path="/rewards" element={<StandaloneLayout><Rewards /></StandaloneLayout>} />
      <Route path="/events" element={<StandaloneLayout><Rewards /></StandaloneLayout>} />
      <Route path="/roadmap" element={<StandaloneLayout><Roadmap /></StandaloneLayout>} />
      <Route path="/chart" element={<StandaloneLayout><Chart /></StandaloneLayout>} />
      <Route path="/trade" element={<StandaloneLayout><Swap /></StandaloneLayout>} />
      <Route path="/checker" element={<StandaloneLayout><Checker /></StandaloneLayout>} />
      <Route
        path="/verse"
        element={isDevPreview ? <VibeVerse /> : <VibeVerseLockScreen />}
      />
      <Route path="/verse-dev" element={<VibeVerse />} />
    </Routes>
  );
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <PrivyProvider
      appId="cmrugdvds02q60cl7tegmrnx7"
      config={{
        loginMethods: ['wallet', 'email', 'twitter', 'telegram'],
        defaultChain: base,
        supportedChains: [base],
        appearance: {
          theme: 'dark',
          accentColor: '#00f5ff',
          logo: '/new-logo-vibe.png',
          showWalletLoginFirst: true,
        },
        embeddedWallets: {
          createOnLogin: 'all-users'
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <PrivyWagmiProvider config={privyWagmiConfig}>
          <BrowserRouter>
            <ScrollToTop />
            <DomainRouter />
          </BrowserRouter>
        </PrivyWagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
