import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Copy, Check, Menu, X, ArrowRight, ArrowUpRight, ArrowRightCircle, TrendingUp, Clock, Rocket, Globe, Star, Crown, Laptop, Loader2, Flame, Gift, Users, ShieldCheck, Calculator, Calendar, RotateCcw } from 'lucide-react';
import { PrivyProvider } from '@privy-io/react-auth';
import { createPublicClient, http, formatUnits, parseAbiItem } from 'viem';
import { base } from 'viem/chains';
import Checker from './Checker';
import './index.css';

const CA      = '0xb200000000000000000000df24ecb8bf51100a01';
const O1      = 'https://launch.o1.exchange/token/0xb200000000000000000000df24ecb8bf51100a01?chain=8453';
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
const CONST_TOTAL_BUYBACK = 8441747.16191129 + 585682 + 2822654;
const CONST_DISTRIBUTED = 585682;

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

  return (
    <>
      <nav className={stuck ? 'stuck' : ''}>
        <div className="nav-inner">
          <Link to="/" className="nav-brand" onClick={() => setOpen(false)}>
            <img src="/vibe-logo.png" className="nav-logo" alt="$VIBE" />
            $VIBE
          </Link>
          <ul className="nav-menu">
            {[['about','About'],['tokenomics','Tokenomics'],['events','Events'],['roadmap','Roadmap'],['chart','Chart'],['trade','Trade'],['checker','Checker']].map(([id,l])=>(
              <li key={id}><Link to={`/${id}`} onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{l}</Link></li>
            ))}
          </ul>
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <a href={O1} target="_blank" rel="noreferrer" className="nav-buy">Buy $VIBE <ArrowUpRight size={16} strokeWidth={2.5} /></a>
            <button className="ham" onClick={() => setOpen(!open)}>
              {open ? <X size={26} color="var(--ink)" /> : <Menu size={26} color="var(--ink)" />}
            </button>
          </div>
        </div>
      </nav>
      <div className={`mob-menu ${open ? 'open' : ''}`}>
        <div className="mob-links">
          {[['about','About'],['tokenomics','Tokenomics'],['events','Events'],['roadmap','Roadmap'],['chart','Chart'],['trade','Trade'],['checker','Checker']].map(([id,l])=>(
            <Link key={id} to={`/${id}`} onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>{l}</Link>
          ))}
          <a href={O1} target="_blank" rel="noreferrer" className="mob-buy" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>Buy $VIBE <ArrowUpRight size={20} strokeWidth={2.5} /></a>
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
            src="/vibe-logo.png"
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

        {/* BLOCK 3: VESTING DETAILS */}
        <div className="sec-head" style={{ marginBottom: '40px', marginTop: '40px' }}>
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
                  <div className="who-ico" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><RotateCcw color="var(--blue)" size={20}/></div>
                  <div className="who-t">Unclaimed Tokens<span>Returned to the community reserved pool</span></div>
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
          <p className="sec-sub" style={{ margin: '0 auto' }}>Our vision to make $VIBE the ultimate cultural phenomenon on Base.</p>
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
              <div className="roadmap-item in-progress">
                <div className="r-title"><Globe size={24} color="var(--blue)"/> Enhance $VIBE Visibility <span className="badge-rm prog"><Loader2 size={14} className="spin"/> IN PROGRESS</span></div>
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
            <div className="roadmap-phase-title">Phase 3: Ecosystem Dominance</div>
            <div className="roadmap-items">
              <div className="roadmap-item">
                <div className="r-title"><Crown size={24} color="var(--blue)"/> The Face of o1</div>
                <div className="r-desc">Establishing $VIBE as the official mascot and cultural phenomenon of o1 Exchange. Where o1 goes, $VIBE leads.</div>
              </div>
              <div className="roadmap-item">
                <div className="r-title"><Crown size={24} color="var(--blue)"/> The Mascot of Base</div>
                <div className="r-desc">Transcending a single DEX to become the undisputed, universally loved dog mascot of the entire Base blockchain ecosystem.</div>
              </div>
            </div>
          </div>

          {/* Phase 4 */}
          <div className="roadmap-phase rv" ref={useRev()}>
            <div className="roadmap-phase-title">Phase 4: The Zenith</div>
            <div className="roadmap-items">
              <div className="roadmap-item">
                <div className="r-title"><Rocket size={24} color="var(--blue)"/> The 100M B20 Runner</div>
                <div className="r-desc">Cementing our legacy as the ultimate B20 token, breaking records and targeting the legendary 100M milestone.</div>
              </div>
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
          <img src="/vibe-logo.png" alt="Vibe" className="foot-logo" />
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

const EVENT_DATA = [
  {
    id: 1,
    title: 'Giveaway $1M Market Cap',
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
    distribution: 'In Progress (58.5%)',
    link: 'https://x.com/mksvibe/status/2084601445844689003'
  },
  {
    id: 3,
    title: '1000 Holders Party',
    image: '/event3.png',
    winners: '33 Winners',
    prizePool: 'TBA',
    status: 'ongoing',
    distribution: 'Not Started',
    link: 'https://x.com/mksvibe'
  }
];

function Events() {
  const [filter, setFilter] = useState('all');
  const r = useRev();

  const filteredEvents = EVENT_DATA.filter(e => filter === 'all' || e.status === filter);

  const counts = {
    all: EVENT_DATA.length,
    ongoing: EVENT_DATA.filter(e => e.status === 'ongoing').length,
    ended: EVENT_DATA.filter(e => e.status === 'ended').length
  };

  return (
    <section id="events" className="alt">
      <div className="wrap">
        <div className="sec-head rv" ref={r} style={{ marginBottom: '40px' }}>
          <h2>Community <span className="bl">Events</span> & Rewards.</h2>
          <p className="sec-sub">Track active and past events, participate, and win $VIBE rewards.</p>
        </div>

        {/* High-Contrast Individual Filter Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {['all', 'ongoing', 'ended'].map(f => {
            const label = f === 'all' ? `All Events (${counts.all})` : f === 'ongoing' ? `Ongoing (${counts.ongoing})` : `Ended (${counts.ended})`;
            const isActive = filter === f;
            return (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '99px',
                  border: isActive ? '1px solid var(--blue)' : '1px solid #cbd5e1',
                  background: isActive ? 'var(--blue)' : '#f8fafc',
                  color: isActive ? '#fff' : 'var(--ink)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 4px 14px rgba(0, 82, 255, 0.35)' : '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s'
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Events Grid */}
        <div className="events-grid" style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))' }}>
          {filteredEvents.map(ev => (
            <div key={ev.id} className="tok-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Event Image Banner */}
              <div style={{ position: 'relative', background: '#f8fafc', borderBottom: '1px solid var(--borderf)' }}>
                <img src={ev.image} alt={ev.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                
                {/* Status Pill on Banner Bottom-Right */}
                <span style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: ev.status === 'ongoing' ? '#10b981' : '#ef4444',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '99px',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: ev.status === 'ongoing' ? '0 4px 12px rgba(16, 185, 129, 0.4)' : '0 4px 12px rgba(239, 68, 68, 0.4)'
                }}>
                  {ev.status === 'ongoing' && <span style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 6px rgba(255,255,255,0.8)' }} />}
                  {ev.status === 'ongoing' ? 'Ongoing' : 'Ended'}
                </span>
              </div>

              {/* Event Body */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                
                {/* Title Header */}
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--ink)', lineHeight: '1.2' }}>{ev.title}</h3>
                </div>

                {/* 4 Separate Compact Stat Tiles in 2x2 Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  marginBottom: '16px'
                }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 12px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '2px' }}>
                      Prize Pool
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--blue)', fontSize: '0.9rem' }}>
                      {ev.prizePool}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 12px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '2px' }}>
                      Winners
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '0.9rem' }}>
                      {ev.winners}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '10px 12px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '2px' }}>
                      Status
                    </div>
                    <div style={{ fontWeight: 800, color: ev.status === 'ongoing' ? '#10b981' : '#ef4444', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                      {ev.status}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '10px 12px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>
                      Distribution
                    </div>
                    <div style={{
                      fontWeight: 800,
                      color: ev.distribution.startsWith('In Progress') ? 'var(--blue)' : ev.distribution === 'Completed' ? '#10b981' : '#d97706',
                      fontSize: '0.82rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      {ev.distribution.startsWith('In Progress') && (
                        <span style={{
                          width: '6px',
                          height: '6px',
                          background: 'var(--blue)',
                          borderRadius: '50%',
                          display: 'inline-block',
                          flexShrink: 0,
                          boxShadow: '0 0 6px rgba(0, 82, 255, 0.8)'
                        }} />
                      )}
                      {ev.distribution === 'Completed' && '✓ '}
                      {ev.distribution === 'Not Started' && '⏱ '}
                      {ev.distribution}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <a 
                  href={ev.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{
                    marginTop: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: 'var(--blue)',
                    color: '#fff',
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {ev.status === 'ongoing' ? 'Participate' : 'View Event'} <ArrowUpRight size={16} strokeWidth={2.5} />
                </a>
              </div>
            </div>
          ))}
        </div>
        {filteredEvents.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 20px', fontSize: '1.1rem' }}>
            No events found for this category.
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

export default function App() {
  return (
    <PrivyProvider appId="cmrugdvds02q60cl7tegmrnx7" config={{ loginMethods: ['wallet'], appearance: { theme: 'light', accentColor: '#0052ff', logo: 'https://vibehome.dog/vibe-logo.png' } }}>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<><Nav /><LandingPage /><Footer /></>} />
          <Route path="/about" element={<StandaloneLayout><About /></StandaloneLayout>} />
          <Route path="/tokenomics" element={<StandaloneLayout><Tokenomics /></StandaloneLayout>} />

          <Route path="/events" element={<StandaloneLayout><Events /></StandaloneLayout>} />
          <Route path="/roadmap" element={<StandaloneLayout><Roadmap /></StandaloneLayout>} />
          <Route path="/chart" element={<StandaloneLayout><Chart /></StandaloneLayout>} />
          <Route path="/trade" element={<StandaloneLayout><Swap /></StandaloneLayout>} />
          <Route path="/checker" element={<StandaloneLayout><Checker /></StandaloneLayout>} />
        </Routes>
      </BrowserRouter>
    </PrivyProvider>
  );
}
