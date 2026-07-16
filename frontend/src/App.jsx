import React, { useState, useEffect, useRef } from 'react';
import './index.css';

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const CA     = '0xB200000000000000000000ba3068A5B447a81101';
const O1_URL = 'https://launch.o1.exchange/token/0xb200000000000000000000ba3068a5b447a81101';
const DEX_URL= 'https://dexscreener.com/base/0x6fd5a9c697b93ce1740b1833a17c1460086b72b256f343d862d3ed6d2dbc6530';
const DEX_EMBED = 'https://dexscreener.com/base/0x6fd5a9c697b93ce1740b1833a17c1460086b72b256f343d862d3ed6d2dbc6530?embed=1&theme=dark&info=0';

const UNLOCKS = [
  { date:'Aug 8, 2026',  amt:'10M'  },
  { date:'Sep 7, 2026',  amt:'20M'  },
  { date:'Oct 7, 2026',  amt:'30M'  },
  { date:'Nov 6, 2026',  amt:'40M'  },
  { date:'Dec 6, 2026',  amt:'50M'  },
  { date:'Jan 5, 2027',  amt:'60M'  },
  { date:'Feb 4, 2027',  amt:'70M'  },
  { date:'Mar 6, 2027',  amt:'80M'  },
  { date:'Apr 5, 2027',  amt:'90M'  },
  { date:'May 5, 2027',  amt:'100M' },
];

const MARQUEE = [
  '🐾 $VIBE ON BASE', '🔥 B20 STANDARD', '🐶 MALTIPOO COIN', '✨ 900M CIRCULATING',
  '💛 GOOD BOY TOKEN', '🚀 UNLIMITED VIBES', '🐾 HAPPY PAWS', '💎 COMMUNITY FIRST',
];

/* ─────────────────────────────────────────
   HOOKS
───────────────────────────────────────── */
function useCopy(text) {
  const [done, setDone] = useState(false);
  const go = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };
  return { done, go };
}

function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.classList.add('on'); },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ─────────────────────────────────────────
   NAV
───────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const go = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-wrap">
          <div className="nav-logo" onClick={() => go('hero')}>
            <span className="logo-paw">🐾</span>
            <span>$VIBE</span>
            <span className="logo-live">LIVE</span>
          </div>

          <ul className="nav-links">
            {[['about','About'],['tokenomics','Tokenomics'],['chart','Chart'],['trade','Trade']].map(([id,label]) => (
              <li key={id}><a onClick={() => go(id)}>{label}</a></li>
            ))}
          </ul>

          <a href={O1_URL} target="_blank" rel="noreferrer" className="nav-cta desktop">
            Buy $VIBE ↗
          </a>
          <button className="ham" onClick={() => setOpen(true)}>☰</button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`mob-menu${open ? ' open' : ''}`}>
        <button className="mob-close" onClick={() => setOpen(false)}>✕</button>
        {[['about','About'],['tokenomics','Tokenomics'],['chart','Chart'],['trade','Trade']].map(([id,label]) => (
          <a key={id} onClick={() => go(id)}>{label}</a>
        ))}
        <a href={O1_URL} target="_blank" rel="noreferrer" className="btn-main btn-fill">Buy $VIBE ↗</a>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   HERO
───────────────────────────────────────── */
function Hero() {
  const { done, go } = useCopy(CA);

  return (
    <section id="hero">
      {/* decorative bg paws */}
      <div className="hero-bg-paws" aria-hidden="true">
        {['🐾','🐾','🐾','🐾','🐾'].map((p,i) => <span key={i}>{p}</span>)}
      </div>

      <div className="wrap">
        <div className="hero-grid">

          {/* ── Left text ── */}
          <div>
            <div className="chip-row">
              <span className="chip chip-base">BASE CHAIN</span>
              <span className="chip chip-b20">B20 TOKEN</span>
              <span className="chip chip-dog">🐶 MALTIPOO</span>
            </div>

            <h1 className="hero-title">
              <span className="sub-word">Meet the based dog.</span>
              The <em>fluffiest</em> vibe on chain.
            </h1>

            <p className="hero-desc">
              $VIBE is a community‑driven B20 memecoin on Base, inspired by the world's cutest Maltipoo. 
              Positive energy, immaculate vibes, and happy paws — all on-chain. 🐾
            </p>

            <div className="hero-btns">
              <a href={O1_URL} target="_blank" rel="noreferrer" className="btn-main btn-fill">
                Buy on o1.exchange ↗
              </a>
              <a href={DEX_URL} target="_blank" rel="noreferrer" className="btn-main btn-outline">
                View Chart
              </a>
            </div>

            <div className="ca-pill">
              <span className="tag">CA</span>
              <span className="addr" title={CA}>{CA}</span>
              <button className={`cpbtn${done ? ' ok' : ''}`} onClick={go}>
                {done ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* ── Right card ── */}
          <div className="hero-visual">
            {/* floating badges */}
            <div className="float-badge float-badge-1">
              ✅ Community-driven
            </div>
            <div className="float-badge float-badge-2">
              🔒 100M in vesting
            </div>

            <div className="hero-card">
              {/* Try logo first, fallback to mascot */}
              <img
                src="/logo.png"
                onError={e => { e.target.onerror=null; e.target.src='/mascot.png'; }}
                alt="$VIBE Maltipoo"
                className="hero-mascot"
              />
              <div className="hero-ticker">$VIBE</div>
              <div className="hero-name">The Based Maltipoo · B20</div>

              <div className="hero-stats-row">
                <div className="hs">
                  <span className="hs-val">1B</span>
                  <span className="hs-lbl">Supply</span>
                </div>
                <div className="hs">
                  <span className="hs-val">900M</span>
                  <span className="hs-lbl">Circulating</span>
                </div>
                <div className="hs">
                  <span className="hs-val">100M</span>
                  <span className="hs-lbl">Vesting</span>
                </div>
              </div>

              <div className="hero-paws-dec">
                {['🐾','🐾','🐾','🐾','🐾'].map((p,i) => <span key={i}>{p}</span>)}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   MARQUEE
───────────────────────────────────────── */
function Marquee() {
  const all = [...MARQUEE, ...MARQUEE];
  return (
    <div className="marquee-strip">
      <div className="marquee-inner">
        {all.map((t,i) => (
          <div key={i} className="m-item">
            <span className="star">✦</span>
            <span className="bold">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ABOUT
───────────────────────────────────────── */
function About() {
  const r1 = useScrollReveal();
  const r2 = useScrollReveal();
  const r3 = useScrollReveal();

  return (
    <section id="about">
      <div className="wrap">
        <div className="about-grid">

          <div className="about-text">
            <div ref={r1} className="sr">
              <div className="sec-label">About $VIBE</div>
              <h2>The dog that <span>vibes</span> harder than any other.</h2>
            </div>
            <div ref={r2} className="sr sr-d1">
              <p style={{marginTop:20}}>
                Meet $VIBE — the Base Dog. Born from the love of a real Maltipoo pup, 
                $VIBE is the ultimate mood-setter for the Based community. 
                Every great journey starts with a single paw print. 🐾
              </p>
              <p>
                Dreams. Happy paws. Unlimited vibes. Built to share positive energy 
                and immaculate vibes with everyone on Base.
              </p>

              <div className="pill-list">
                <div className="pill-row">
                  <span className="ico">🐶</span>
                  <div className="ptxt">
                    <strong>Inspired by a real Maltipoo</strong>
                    The fluffiest, most good-vibes dog on the internet
                  </div>
                </div>
                <div className="pill-row">
                  <span className="ico">🔗</span>
                  <div className="ptxt">
                    <strong>B20 Standard on Base</strong>
                    Community-driven with transparent, fair tokenomics
                  </div>
                </div>
                <div className="pill-row">
                  <span className="ico">🤝</span>
                  <div className="ptxt">
                    <strong>100% Community Vesting</strong>
                    Every unlocked token goes straight to the community
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* right stat mosaic */}
          <div ref={r3} className="sr sr-d2 about-visual">
            <div className="stat-mosaic">
              <div className="stat-tile tall">
                <div className="paws">🐾</div>
                <span className="v">1B</span>
                <span className="l">Total Supply</span>
                <p className="desc">Fixed supply, no minting. Ever.</p>
              </div>
              <div className="stat-tile">
                <span className="v">900M</span>
                <span className="l">Circulating</span>
              </div>
              <div className="stat-tile gold">
                <span className="v">100M</span>
                <span className="l">Community Vesting</span>
              </div>
              <div className="stat-tile" style={{gridColumn:'span 2'}}>
                <span className="v" style={{fontSize:'2rem'}}>10M / mo</span>
                <span className="l">Monthly Unlock</span>
                <p className="desc">Distributed to holders & supporters, every single month</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   TOKENOMICS
───────────────────────────────────────── */
function Tokenomics() {
  const r = useScrollReveal();

  return (
    <section id="tokenomics">
      <div className="wrap">
        <div ref={r} className="sr tok-header">
          <div className="sec-label">Tokenomics</div>
          <h2>Built for the <span>community</span>.</h2>
          <p>100M tokens in vesting — every single unlock flows back to $VIBE holders and supporters. Zero team allocation.</p>
        </div>

        <div className="tok-layout">

          {/* Left column */}
          <div className="tok-left">

            {/* Vesting overview */}
            <div className="vesting-block">
              <h3>Community Vesting · 100M $VIBE</h3>
              <p className="sub">10% (10M) unlocks each month, distributed to qualified holders</p>

              <div className="progress-wrap">
                <div className="progress-track">
                  <div className="progress-fill" />
                </div>
                <div className="progress-labels">
                  <span>0M unlocked today</span>
                  <span>100M total</span>
                </div>
              </div>

              <p style={{fontSize:'0.82rem', color:'var(--dim)', marginBottom:16}}>Who gets the monthly unlock?</p>
              <div className="who-gets">
                <div className="who-row">
                  <span className="wr-icon">💎</span>
                  <div className="wr-text">
                    Diamond Holders
                    <span>Hold $44+ worth of $VIBE to qualify</span>
                  </div>
                </div>
                <div className="who-row">
                  <span className="wr-icon">🐾</span>
                  <div className="wr-text">
                    Active Community Members
                    <span>Engage, share, and spread the vibes</span>
                  </div>
                </div>
                <div className="who-row">
                  <span className="wr-icon">📣</span>
                  <div className="wr-text">
                    Token Supporters
                    <span>Promote $VIBE and earn your share</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Supply bars */}
            <div className="supply-block">
              <h3>Supply Breakdown</h3>
              <div className="supply-bars">
                <div className="sb-row">
                  <div className="sb-info"><span className="sb-name">Circulating Supply</span><span className="sb-pct">90%</span></div>
                  <div className="sb-bar"><div className="sb-fill" style={{width:'90%', background:'var(--coral)'}}/></div>
                </div>
                <div className="sb-row">
                  <div className="sb-info"><span className="sb-name">Community Vesting</span><span className="sb-pct">10%</span></div>
                  <div className="sb-bar"><div className="sb-fill" style={{width:'10%', background:'var(--gold)'}}/></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — unlock schedule */}
          <div className="tok-right">
            <div className="unlock-card">
              <h3>Unlock Schedule</h3>
              <p className="sub">10 monthly unlocks, starting Aug 8, 2026</p>
              <div className="unlock-scroll">
                {UNLOCKS.map((u, i) => (
                  <div key={i} className="ul-row">
                    <span className="ul-date">{u.date}</span>
                    <span className="ul-amt">{u.amt}</span>
                    <span className="ul-status">locked</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   CHART
───────────────────────────────────────── */
function Chart() {
  const r = useScrollReveal();

  return (
    <section id="chart">
      <div className="wrap">
        <div ref={r} className="sr chart-top">
          <div>
            <div className="sec-label">Live Chart</div>
            <h2>Price <span>action</span>.</h2>
          </div>
          <a href={DEX_URL} target="_blank" rel="noreferrer" className="btn-main btn-outline">
            Open on Dexscreener ↗
          </a>
        </div>
        <div className="chart-frame">
          <iframe
            src={DEX_EMBED}
            title="$VIBE live chart"
            width="100%"
            height="600"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   TRADE
───────────────────────────────────────── */
function Trade() {
  const r = useScrollReveal();
  const { done, go } = useCopy(CA);

  return (
    <section id="trade">
      <div className="wrap">
        <div ref={r} className="sr trade-header">
          <div className="sec-label">How to Buy</div>
          <h2>Get <span>$VIBE</span>.</h2>
          <p>Live on Base. Pick your spot and start vibing.</p>
        </div>

        <div className="trade-cards">
          <a href={O1_URL} target="_blank" rel="noreferrer" className="tc">
            <div className="tc-head">
              <div className="tc-logo-wrap tc-o1-logo">o1</div>
              <span className="tc-tag">Recommended</span>
            </div>
            <h3>o1.exchange</h3>
            <p>The native launchpad where $VIBE was born. Bonded curve mechanics, lowest fees, and the simplest buy experience on Base.</p>
            <div className="tc-foot">
              <span className="tc-foot-link">Open launch page</span>
              <div className="tc-arr">↗</div>
            </div>
          </a>

          <a href={DEX_URL} target="_blank" rel="noreferrer" className="tc">
            <div className="tc-head">
              <div className="tc-logo-wrap tc-dx-logo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12L12 3L21 12L12 21L3 12Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <span className="tc-tag">Charts & Trade</span>
            </div>
            <h3>DexScreener</h3>
            <p>Track $VIBE price in real-time and trade directly from the chart. Powered by Dexscreener on Base network.</p>
            <div className="tc-foot">
              <span className="tc-foot-link">Trade on Dexscreener</span>
              <div className="tc-arr">↗</div>
            </div>
          </a>
        </div>

        <div className="ca-bar">
          <div className="info">
            <div className="l">Contract Address · Base</div>
            <div className="a">{CA}</div>
          </div>
          <button className={`cbtn${done ? ' ok' : ''}`} onClick={go}>
            {done ? '✓ Copied!' : '📋 Copy CA'}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   FOOTER
───────────────────────────────────────── */
function Footer() {
  return (
    <footer>
      <div className="wrap foot-inner">
        <div className="foot-logo"><span>$VIBE</span> · The Based Maltipoo</div>
        <p className="foot-copy">© 2026 $VIBE · Not financial advice · Just a fluffy dog 🐾</p>
        <div className="foot-socials">
          <a href="#" className="soc" title="Twitter/X">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="#" className="soc" title="Telegram">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247-2.035 9.587c-.148.665-.54.826-1.093.513l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.215-3.053 5.55-5.015c.242-.214-.051-.333-.37-.119l-6.86 4.32-2.953-.922c-.642-.2-.655-.642.135-.951l11.524-4.44c.535-.196 1.003.13.939.601z"/>
            </svg>
          </a>
          <a href={DEX_URL} target="_blank" rel="noreferrer" className="soc" title="DexScreener">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M3 12L12 3L21 12L12 21L3 12Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────
   APP
───────────────────────────────────────── */
export default function App() {
  return (
    <>
      <Nav />
      <div style={{position:'relative', zIndex:1}}>
        <Hero />
        <Marquee />
        <About />
        <div className="divider" />
        <Tokenomics />
        <div className="divider" />
        <Chart />
        <div className="divider" />
        <Trade />
        <Footer />
      </div>
    </>
  );
}
