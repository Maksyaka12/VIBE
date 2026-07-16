import React, { useState, useEffect, useRef } from 'react';
import './index.css';

/* ── PIXEL DOG COMPONENT ── */
const PixelDog = () => {
  // 20x20 pixel dog art
  const pixels = [
    // row 0
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    // row 1
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    // row 2
    [0,0,0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0,0,0],
    // row 3
    [0,0,0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0,0,0],
    // row 4
    [0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0],
    // row 5
    [0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0],
    // row 6
    [0,0,2,2,3,3,2,2,2,2,2,2,2,2,3,3,2,2,2,0],
    // row 7
    [0,0,2,2,3,3,2,2,2,2,2,2,2,2,3,3,2,2,2,0],
    // row 8
    [0,0,2,2,2,2,2,2,4,4,4,2,2,2,2,2,2,2,2,0],
    // row 9
    [0,0,2,2,2,2,2,4,4,4,4,4,2,2,2,2,2,2,2,0],
    // row 10
    [0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0],
    // row 11
    [0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0],
    // row 12
    [0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0],
    // row 13
    [0,0,0,0,0,2,2,5,2,2,2,2,5,2,2,2,0,0,0,0],
    // row 14
    [0,0,0,0,0,2,2,5,2,2,2,2,5,2,2,2,0,0,0,0],
    // row 15
    [0,0,0,0,0,2,2,5,2,2,2,2,5,2,2,2,0,0,0,0],
    // row 16
    [0,0,0,0,0,2,5,5,0,0,0,0,5,5,2,0,0,0,0,0],
    // row 17
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    // row 18
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    // row 19
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];

  const colorMap = {
    0: 'transparent',
    1: '#8B5E2B', // ear brown
    2: '#c9882a', // body orange-brown
    3: '#1a1a2e', // eyes dark
    4: '#ff9eb5', // nose pink
    5: '#8B5E2B', // legs brown
  };

  return (
    <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(20, 14px)`, gap: '1px', imageRendering: 'pixelated', marginBottom: '24px' }}>
      {pixels.flat().map((val, i) => (
        <div key={i} style={{ width: 14, height: 14, background: colorMap[val], borderRadius: '2px' }} />
      ))}
    </div>
  );
};

/* ── MINI PIXEL DOG (decorative) ── */
const MiniPixelDog = ({ color = '#c9882a' }) => {
  const pattern = [
    [0,1,1,0,0,0,1,1,0],
    [1,1,1,1,1,1,1,1,1],
    [1,1,2,1,1,1,2,1,1],
    [1,1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,1,0],
    [0,0,1,0,0,0,1,0,0],
    [0,0,1,0,0,0,1,0,0],
  ];
  const c = { 0: 'transparent', 1: color, 2: '#1a1a2e' };
  return (
    <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(9, 8px)`, gap: '1px', imageRendering: 'pixelated' }}>
      {pattern.flat().map((v, i) => (
        <div key={i} style={{ width: 8, height: 8, background: c[v], borderRadius: '1px' }} />
      ))}
    </div>
  );
};

/* ── COPY HOOK ── */
const useCopy = () => {
  const [copied, setCopied] = useState(false);
  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return { copied, copy };
};

/* ── REVEAL HOOK ── */
const useReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.classList.add('visible');
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
};

const CONTRACT = '0xB200000000000000000000ba3068A5B447a81101';
const O1_URL = 'https://launch.o1.exchange/token/0xb200000000000000000000ba3068a5b447a81101';
const DEX_URL = 'https://dexscreener.com/base/0x6fd5a9c697b93ce1740b1833a17c1460086b72b256f343d862d3ed6d2dbc6530';

const UNLOCKS = [
  { date: 'Aug 8, 2026',  amount: '10M',  cumulative: 10 },
  { date: 'Sep 7, 2026',  amount: '20M',  cumulative: 20 },
  { date: 'Oct 7, 2026',  amount: '30M',  cumulative: 30 },
  { date: 'Nov 6, 2026',  amount: '40M',  cumulative: 40 },
  { date: 'Dec 6, 2026',  amount: '50M',  cumulative: 50 },
  { date: 'Jan 5, 2027',  amount: '60M',  cumulative: 60 },
  { date: 'Feb 4, 2027',  amount: '70M',  cumulative: 70 },
  { date: 'Mar 6, 2027',  amount: '80M',  cumulative: 80 },
  { date: 'Apr 5, 2027',  amount: '90M',  cumulative: 90 },
  { date: 'May 5, 2027',  amount: '100M', cumulative: 100 },
];

/* ── MAIN APP ── */
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { copied: caHeroCopied, copy: caHeroCopy } = useCopy();
  const { copied: caFullCopied, copy: caFullCopy } = useCopy();

  // Section refs for scroll reveal
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal(), r4 = useReveal(), r5 = useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goto = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const ticker = [
    '🐾 $VIBE ON BASE',
    '🔥 B20 STANDARD',
    '🐶 THE BASE DOG',
    '✨ 900M CIRCULATING',
    '🔒 100M COMMUNITY VESTING',
    '🚀 UNLIMITED VIBES',
    '🐾 HAPPY PAWS',
    '💛 BUILT ON BASE',
  ];

  return (
    <div className="page">
      {/* Ambient lights */}
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />
      <div className="ambient ambient-3" />

      {/* ── NAV ── */}
      <nav className={`nav ${scrolled ? 'sticky' : ''}`}>
        <div className="container nav-inner">
          <a className="nav-logo" onClick={() => goto('hero')}>
            <div className="logo-dot" />
            <span>$VIBE</span>
          </a>
          <ul className="nav-links">
            <li><a onClick={() => goto('about')} style={{cursor:'pointer'}}>About</a></li>
            <li><a onClick={() => goto('tokenomics')} style={{cursor:'pointer'}}>Tokenomics</a></li>
            <li><a onClick={() => goto('chart')} style={{cursor:'pointer'}}>Chart</a></li>
            <li><a onClick={() => goto('trade')} style={{cursor:'pointer'}}>Trade</a></li>
          </ul>
          <a href={O1_URL} target="_blank" rel="noreferrer" className="btn-nav desktop">
            Buy $VIBE ↗
          </a>
          <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              {menuOpen
                ? <><line x1="4" y1="4" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="18" y1="4" x2="4" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>
                : <><line x1="3" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="15" x2="19" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
        <button className="mobile-close" onClick={() => setMenuOpen(false)}>✕</button>
        <a onClick={() => goto('about')}>About</a>
        <a onClick={() => goto('tokenomics')}>Tokenomics</a>
        <a onClick={() => goto('chart')}>Chart</a>
        <a onClick={() => goto('trade')}>Trade</a>
        <a href={O1_URL} target="_blank" rel="noreferrer" className="btn btn-yellow">Buy $VIBE ↗</a>
      </div>

      {/* ── HERO ── */}
      <section id="hero">
        <div className="container">
          <div className="hero-layout">
            {/* Left */}
            <div>
              <div className="hero-badges">
                <span className="badge badge-green">
                  <span style={{width:6,height:6,background:'var(--green)',borderRadius:'50%',display:'inline-block',boxShadow:'0 0 6px var(--green)'}}/>
                  Live on Base
                </span>
                <span className="badge badge-purple">B20 Token</span>
                <span className="badge badge-yellow">🐶 The Base Dog</span>
              </div>

              <h1 className="hero-title">
                <span className="line1">Meet The Dog</span>
                <span className="line2">
                  <span className="accent">$VIBE</span>
                  {' '}is here.
                </span>
              </h1>

              <p className="hero-desc">
                The ultimate mood maker on Base B20. Built to share its positive energy and immaculate vibes with the based community. Every great journey starts with a single paw print 🐾
              </p>

              <div className="hero-actions">
                <a href={O1_URL} target="_blank" rel="noreferrer" className="btn btn-yellow">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/><path d="M15 9L9 15M9 9H15V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  Buy on o1.exchange
                </a>
                <button onClick={() => goto('chart')} className="btn btn-ghost">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7 16L12 10L16 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  View Chart
                </button>
              </div>

              <div className="ca-strip">
                <span className="label">CA (Base)</span>
                <span className="address">{CONTRACT}</span>
                <button className="copy-btn" onClick={() => caHeroCopy(CONTRACT)}>
                  {caHeroCopied ? '✓ copied' : 'copy'}
                </button>
              </div>
            </div>

            {/* Right — visual */}
            <div className="hero-visual">
              <div className="hero-glow-ring" />
              <div className="hero-card-visual">
                <img src="/logo.png" alt="$VIBE Dog" className="hero-logo-img" />
                <div className="hero-card-ticker">$VIBE</div>
                <div className="hero-card-desc">The Base Dog · B20</div>
                <div className="hero-stat-row">
                  <div className="hero-stat">
                    <div className="hero-stat-val">1B</div>
                    <div className="hero-stat-label">Total Supply</div>
                  </div>
                  <div style={{width:1,background:'var(--border)'}} />
                  <div className="hero-stat">
                    <div className="hero-stat-val">900M</div>
                    <div className="hero-stat-label">Circulating</div>
                  </div>
                  <div style={{width:1,background:'var(--border)'}} />
                  <div className="hero-stat">
                    <div className="hero-stat-val">100M</div>
                    <div className="hero-stat-label">Community</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER MARQUEE ── */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {[...ticker, ...ticker].map((t, i) => (
            <div key={i} className="ticker-item">
              <span className="dot">✦</span>
              <span className="highlight">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section id="about">
        <div className="container">
          <div className="about-layout">
            <div className="about-text">
              <div ref={r1} className="reveal">
                <div className="section-tag">// About $VIBE</div>
                <h2>
                  The dog that<br/>
                  <span className="accent">vibes</span> with everyone.
                </h2>
              </div>
              <div ref={r2} className="reveal" style={{transitionDelay:'0.1s'}}>
                <p style={{marginTop: 20}}>
                  Meet $VIBE — the Base Dog and the ultimate mood maker on Base B20. Built to share its positive energy and immaculate vibes with the based community.
                </p>
                <p>
                  Dreams. Happy paws. Unlimited vibes.
                </p>

                <div className="about-features">
                  <div className="feature-item">
                    <div className="feature-icon">🔒</div>
                    <div className="feature-text">
                      <strong>B20 Standard</strong>
                      Community-driven token with transparent tokenomics
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">🌐</div>
                    <div className="feature-text">
                      <strong>Built on Base</strong>
                      Deployed on Coinbase's L2 for fast, cheap transactions
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">🐾</div>
                    <div className="feature-text">
                      <strong>100% Community</strong>
                      All vested tokens distributed to holders &amp; supporters
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — pixel dog + stats */}
            <div className="about-visual">
              <div ref={r3} className="reveal pixel-art-container">
                <PixelDog />
                <div style={{marginBottom: 24}}>
                  <div style={{display:'flex', justifyContent:'center', gap: 24, flexWrap:'wrap'}}>
                    <MiniPixelDog color="#c9882a" />
                    <MiniPixelDog color="#714bff" />
                    <MiniPixelDog color="#ffe566" />
                  </div>
                </div>
                <div className="stats-grid">
                  <div className="stat-box">
                    <span className="val">1B</span>
                    <span className="lbl">Total Supply</span>
                  </div>
                  <div className="stat-box">
                    <span className="val">900M</span>
                    <span className="lbl">Circulating</span>
                  </div>
                  <div className="stat-box">
                    <span className="val">100M</span>
                    <span className="lbl">In Vesting</span>
                  </div>
                  <div className="stat-box">
                    <span className="val">10M</span>
                    <span className="lbl">Monthly Unlock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── TOKENOMICS ── */}
      <section id="tokenomics">
        <div className="container">
          <div className="tokenomics-header">
            <span className="tag">// Tokenomics</span>
            <h2>Built for the <span className="accent">community</span></h2>
            <p>100M tokens in vesting — every unlock goes back to holders and supporters.</p>
          </div>

          <div className="tokenomics-layout">
            {/* Vesting overview — full width */}
            <div ref={r4} className="reveal card vesting-card">
              <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:20}}>
                <div>
                  <h3>Community Vesting · 100M $VIBE</h3>
                  <p className="desc" style={{marginTop:6}}>
                    10% (10M tokens) unlocks each month and is distributed to qualified community members.
                  </p>
                </div>
                <span className="badge badge-yellow">10 unlocks total</span>
              </div>

              <div className="vesting-bar-bg">
                <div className="vesting-bar-fill" style={{animationFillMode:'forwards'}} />
              </div>
              <div className="vesting-bar-labels">
                <span>0M unlocked now</span>
                <span>100M total</span>
              </div>

              <div className="recipients">
                <div className="recipient-pill">
                  <span className="icon">💎</span>
                  <span>Holders with $44+ in $VIBE</span>
                </div>
                <div className="recipient-pill">
                  <span className="icon">🐾</span>
                  <span>Active community members</span>
                </div>
                <div className="recipient-pill">
                  <span className="icon">⚡</span>
                  <span>Token supporters</span>
                </div>
              </div>
            </div>

            {/* Unlock schedule */}
            <div className="card unlock-schedule-card">
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
                <h3>Unlock Schedule</h3>
                <MiniPixelDog color="#714bff" />
              </div>
              <div className="unlock-list">
                {UNLOCKS.map((u, i) => (
                  <div key={i} className="unlock-row">
                    <span className="unlock-date">{u.date}</span>
                    <span className="unlock-tokens">{u.amount}</span>
                    <span className="unlock-tag">locked</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Community */}
            <div className="card community-card">
              <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
                <h3>Who receives the unlock?</h3>
              </div>
              <p className="desc">
                Every monthly unlock is distributed 100% to the $VIBE community — no team allocation, no VC bags.
              </p>
              <div className="community-badges">
                <div className="community-badge-row">
                  <span className="icon">💎</span>
                  <div className="info">
                    <div className="title">Diamond Holders</div>
                    <div className="sub">Hold $44+ worth of $VIBE to qualify</div>
                  </div>
                </div>
                <div className="community-badge-row">
                  <span className="icon">🐾</span>
                  <div className="info">
                    <div className="title">Active Members</div>
                    <div className="sub">Engage with the community & get rewarded</div>
                  </div>
                </div>
                <div className="community-badge-row">
                  <span className="icon">📣</span>
                  <div className="info">
                    <div className="title">Token Supporters</div>
                    <div className="sub">Spread the vibes, share in the rewards</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── CHART ── */}
      <section id="chart">
        <div className="container">
          <div ref={r5} className="reveal chart-header">
            <div>
              <span style={{fontFamily:'var(--font-mono)',fontSize:'0.8rem',color:'var(--green)',textTransform:'uppercase',letterSpacing:'0.12em'}}>// Live Chart</span>
              <h2 style={{marginTop:8}}>Price <span className="accent-purple">Action</span></h2>
            </div>
            <a href={DEX_URL} target="_blank" rel="noreferrer" className="btn btn-purple" style={{textDecoration:'none'}}>
              Open on Dexscreener ↗
            </a>
          </div>
          <div className="chart-wrap">
            <iframe
              src="https://dexscreener.com/base/0x6fd5a9c697b93ce1740b1833a17c1460086b72b256f343d862d3ed6d2dbc6530?embed=1&theme=dark&info=0"
              title="$VIBE Chart on Dexscreener"
              width="100%"
              height="600"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── TRADE ── */}
      <section id="trade">
        <div className="container">
          <div className="trade-header">
            <span className="tag">// How to Buy</span>
            <h2>Get <span className="accent">$VIBE</span></h2>
            <p>Live on Base. Pick your venue and start vibing.</p>
          </div>

          <div className="trade-grid">
            {/* o1.exchange */}
            <a href={O1_URL} target="_blank" rel="noreferrer" className="card trade-card">
              <div className="tc-top">
                <div className="tc-logo tc-o1">o1</div>
                <span className="tc-badge">Recommended</span>
              </div>
              <h3>o1.exchange</h3>
              <p className="desc">The native launchpad — where $VIBE was born. Bonded curve, simplest UX, lowest fees. Best place to ape in.</p>
              <div className="link-row">
                <span className="link-text">Open launch page</span>
                <div className="arrow">↗</div>
              </div>
            </a>

            {/* Dexscreener */}
            <a href={DEX_URL} target="_blank" rel="noreferrer" className="card trade-card">
              <div className="tc-top">
                <div className="tc-logo tc-dex">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3L21 12L12 21L3 12Z" stroke="currentColor" strokeWidth="2"/><path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
                <span className="tc-badge">Charts & Trade</span>
              </div>
              <h3>DexScreener</h3>
              <p className="desc">Track $VIBE price action in real-time and trade directly from the chart. Powered by Dexscreener on Base network.</p>
              <div className="link-row">
                <span className="link-text">Trade on Dexscreener</span>
                <div className="arrow">↗</div>
              </div>
            </a>
          </div>

          {/* Full CA box */}
          <div className="ca-full-box">
            <div>
              <div className="l">Contract Address (Base)</div>
              <div className="addr">{CONTRACT}</div>
            </div>
            <button className={`copy-full-btn ${caFullCopied ? 'copied' : ''}`} onClick={() => caFullCopy(CONTRACT)}>
              {caFullCopied ? '✓ Copied!' : '📋 Copy CA'}
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="container footer-inner">
          <div className="footer-brand">
            <span>$VIBE</span> · The Base Dog
          </div>
          <p className="footer-copy">
            © 2026 $VIBE. Not financial advice. Just a based dog. 🐾
          </p>
          <div className="footer-socials">
            {/* X / Twitter */}
            <a href="#" className="social-btn" title="Twitter / X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            {/* Telegram */}
            <a href="#" className="social-btn" title="Telegram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247l-2.035 9.587c-.148.665-.54.826-1.093.513l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.215-3.053 5.55-5.015c.242-.214-.051-.333-.37-.119l-6.86 4.32-2.953-.922c-.642-.2-.655-.642.135-.951l11.524-4.44c.535-.196 1.003.13.939.601z"/></svg>
            </a>
            {/* Dexscreener */}
            <a href={DEX_URL} target="_blank" rel="noreferrer" className="social-btn" title="Dexscreener">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3L21 12L12 21L3 12Z" stroke="currentColor" strokeWidth="2"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
