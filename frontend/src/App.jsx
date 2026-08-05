import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Copy, Check, Menu, X, ArrowRight, ArrowUpRight, ArrowRightCircle, TrendingUp, Clock, Rocket, Globe, Star, Crown, Laptop, Loader2 } from 'lucide-react';
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
const CONST_TOTAL_BUYBACK = 8493747 + 585682;
const CONST_DISTRIBUTED = 585682;

const REVENUE_EVENTS = [
  {
    date: 'Aug 5, 2026',
    title: 'DEX Listing Payment',
    amount: '$300 USDC',
    txLink: 'https://etherscan.io/tx/0x93cb092fc6cec2c49a3f129ed9814c272186beece9992ef8078eb412df7f1c04', 
    tweetLink: 'https://x.com/mksvibe/status/2083175935138824413'
  }
];

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
            {[['about','About'],['tokenomics','Tokenomics'],['revenue','Revenue Economy'],['roadmap','Roadmap'],['chart','Chart'],['trade','Trade'],['checker','Checker']].map(([id,l])=>(
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
          {[['about','About'],['tokenomics','Tokenomics'],['revenue','Creator Revenue'],['roadmap','Roadmap'],['chart','Chart'],['trade','Trade'],['checker','Checker']].map(([id,l])=>(
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
function Tokenomics() {
  const r=useRev();
  return (
    <section id="tokenomics" className="alt">
      <div className="wrap">
        <div className="sec-head rv" ref={r}>
          <h2>Community-owned.<br/><span className="bl">Zero BS & Team Allocation.</span></h2>
          <p className="sec-sub">100M tokens locked. Every unlock is distributed to $VIBE holders monthly.</p>
        </div>
        
        <div className="stat-tiles wide-stats">
          <div className="stile"><span className="v">1B</span><span className="l">Total Supply</span></div>
          <div className="stile"><span className="v">900M</span><span className="l">Circulating</span></div>
          <div className="stile"><span className="v">100M</span><span className="l">Vesting Community Rewards</span><div className="d">10% released monthly</div></div>
          <div className="stile"><span className="v">10M</span><span className="l">Monthly Unlock</span><div className="d">Straight to holders</div></div>
        </div>

        <div className="tok-layout">
          <div>
            <div className="tok-card">
              <h3>Community Rewards · 100M $VIBE</h3>
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
                  <div className="who-ico" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><Clock color="var(--blue)" size={20}/></div>
                  <div className="who-t">Snapshot Schedule<span>Balance snapshot at 00:00 UTC on the day of unlock</span></div>
                </div>
                <Link to="/checker" className="who-r" style={{textDecoration:'none', cursor:'pointer', background:'var(--blue)'}}>
                  <div className="who-ico" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><Check color="#fff" size={20}/></div>
                  <div className="who-t" style={{color:'#fff'}}>Check your eligibility<span style={{color:'rgba(255,255,255,0.8)'}}>Qualify for the next distribution <ArrowRightCircle size={14} style={{verticalAlign:'middle', marginLeft:4}}/></span></div>
                </Link>
              </div>
            </div>
            <div className="tok-card" style={{marginTop:14}}>
              <h3>Supply Breakdown</h3>
              <p className="sub" style={{marginBottom:18}}>Fixed supply, no minting ever.</p>
              <div className="supply-bars">
                <div className="sbar-row">
                  <div className="sbar-top"><span className="sbar-name">Circulating</span><span className="sbar-pct">90%</span></div>
                  <div className="prog"><div className="prog-f" style={{width:'90%'}}/></div>
                </div>
                <div className="sbar-row">
                  <div className="sbar-top"><span className="sbar-name">Vesting</span><span className="sbar-pct">10%</span></div>
                  <div className="prog"><div className="prog-f" style={{width:'10%',background:'#4444dd'}}/></div>
                </div>
              </div>
            </div>
          </div>
          <div className="sched">
            <h3>Unlock Schedule</h3>
            <p className="sub">Aug 2026 → May 2027</p>
            <div className="ul-wrap">
              {UNLOCKS.map((u,i)=>(
                <div key={i} className="ul-r">
                  <span className="ul-d">{u.d}</span>
                  <span className="ul-a">{u.a}</span>
                  <span className="ul-s">locked</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* REVENUE ECONOMY */
function useRevenueStats() {
  const [stats, setStats] = useState({
    totalBuybacks: '...',
    totalBurned: '...',
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
        const eventTransfer = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');
        
        // 1. Fetch Balances (Burned and Current Rewards) via RPC
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

function CreatorRevenue() {
  const r = useRev();
  const { totalBuybacks, totalBurned, communityRewards, distributedRewards, loading } = useRevenueStats();

  return (
    <section id="revenue" className="alt">
      <div className="wrap">
        <div className="sec-head rv" ref={r}>
          <h2>Revenue <span className="bl">Economy</span>.</h2>
          <p className="sec-sub">Creator Revenue is going towards buybacks and actions aimed at strengthening the token.</p>
        </div>
        
        <div className="stat-tiles wide-stats">
          <div className="stile">
            <span className="v">{loading ? <Loader2 size={24} className="spin"/> : totalBuybacks}</span>
            <span className="l">Total Buyback</span>
          </div>
          <div className="stile">
            <span className="v">{loading ? <Loader2 size={24} className="spin"/> : totalBurned}</span>
            <span className="l">Total Burned</span>
          </div>
          <div className="stile">
            <span className="v">{loading ? <Loader2 size={24} className="spin"/> : communityRewards}</span>
            <span className="l">Community Rewards</span>
          </div>
          <div className="stile">
            <span className="v">{loading ? <Loader2 size={24} className="spin"/> : distributedRewards}</span>
            <span className="l">Distributed to Community</span>
          </div>
        </div>

        <div className="tok-layout">
          <div>
            <div className="tok-card">
              <h3>Buyback Program</h3>
              <p className="sub" style={{marginBottom:18}}>Strategic utilization of creator revenue.</p>
              <div className="supply-bars">
                <div className="sbar-row">
                  <div className="sbar-top"><span className="sbar-name">Burn</span><span className="sbar-pct">30%</span></div>
                  <div className="prog"><div className="prog-f" style={{width:'30%', background:'#ef4444'}}/></div>
                </div>
                <div className="sbar-row">
                  <div className="sbar-top"><span className="sbar-name">Upcoming community incentives</span><span className="sbar-pct">70%</span></div>
                  <div className="prog"><div className="prog-f" style={{width:'70%', background:'#3b82f6'}}/></div>
                </div>
              </div>
            </div>
          </div>
          <div className="sched" style={{minWidth:'350px'}}>
            <h3>Revenue Events</h3>
            <p className="sub">Dynamic log of actions</p>
            <div className="ul-wrap">
              {REVENUE_EVENTS.map((ev, i) => (
                <div key={i} className="ul-r" style={{ alignItems: 'center', padding: '12px 16px' }}>
                  <span className="ul-d" style={{ minWidth: '95px', fontSize: '0.85rem' }}>{ev.date}</span>
                  <span className="ul-a" style={{ flex: 1, color: 'var(--ink)', fontSize: '0.95rem' }}>
                    {ev.title} <span style={{color: 'var(--blue)', fontWeight: 700, marginLeft: '6px'}}>{ev.amount}</span>
                  </span>
                  <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                    {ev.txLink && <a href={ev.txLink} target="_blank" rel="noreferrer" className="btn-line" style={{padding:'4px 8px', fontSize:'0.7rem', borderRadius:'6px'}}>Tx <ArrowUpRight size={12}/></a>}
                    {ev.tweetLink && <a href={ev.tweetLink} target="_blank" rel="noreferrer" className="btn-line" style={{padding:'4px 8px', fontSize:'0.7rem', borderRadius:'6px'}}>X <ArrowUpRight size={12}/></a>}
                  </div>
                </div>
              ))}
              {REVENUE_EVENTS.length === 0 && (
                <p style={{color:'var(--muted)'}}>No events recorded yet.</p>
              )}
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
          <a href="https://x.com/vibe_b20" target="_blank" rel="noreferrer" className="soc soc-img" title="X">
            <img src="/x-logo.jpg" alt="X" />
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
          <Route path="/revenue" element={<StandaloneLayout><CreatorRevenue /></StandaloneLayout>} />
          <Route path="/roadmap" element={<StandaloneLayout><Roadmap /></StandaloneLayout>} />
          <Route path="/chart" element={<StandaloneLayout><Chart /></StandaloneLayout>} />
          <Route path="/trade" element={<StandaloneLayout><Swap /></StandaloneLayout>} />
          <Route path="/checker" element={<StandaloneLayout><Checker /></StandaloneLayout>} />
        </Routes>
      </BrowserRouter>
    </PrivyProvider>
  );
}
