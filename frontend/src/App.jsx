import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';

const CA      = '0xB200000000000000000000ba3068A5B447a81101';
const O1      = 'https://launch.o1.exchange/token/0xb200000000000000000000ba3068a5b447a81101';
const DEX     = 'https://dexscreener.com/base/0x6fd5a9c697b93ce1740b1833a17c1460086b72b256f343d862d3ed6d2dbc6530';
const DEX_EMB = 'https://dexscreener.com/base/0x6fd5a9c697b93ce1740b1833a17c1460086b72b256f343d862d3ed6d2dbc6530?embed=1&theme=dark';

const UNLOCKS = [
  {d:'Aug 8, 2026',  a:'10M'},{d:'Sep 7, 2026',  a:'20M'},
  {d:'Oct 7, 2026',  a:'30M'},{d:'Nov 6, 2026',  a:'40M'},
  {d:'Dec 6, 2026',  a:'50M'},{d:'Jan 5, 2027',  a:'60M'},
  {d:'Feb 4, 2027',  a:'70M'},{d:'Mar 6, 2027',  a:'80M'},
  {d:'Apr 5, 2027',  a:'90M'},{d:'May 5, 2027',  a:'100M'},
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

/* NAV */
function Nav() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen]   = useState(false);
  useEffect(() => {
    const h = () => setStuck(window.scrollY > 50);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);
  const go = id => { document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); setOpen(false); };
  return (
    <>
      <nav className={stuck ? 'stuck' : ''}>
        <div className="nav-inner">
          <div className="nav-brand" onClick={() => go('hero')}>
            <img src="/vibe-logo.png" className="nav-logo" alt="$VIBE"
              onError={e=>{e.target.style.display='none';}}/>
            $VIBE
          </div>
          <ul className="nav-menu">
            {[['about','About'],['tokenomics','Tokenomics'],['chart','Chart'],['trade','Trade']].map(([id,l])=>(
              <li key={id}><a onClick={() => go(id)}>{l}</a></li>
            ))}
          </ul>
          <a href={O1} target="_blank" rel="noreferrer" className="nav-buy desk">Buy $VIBE ↗</a>
          <button className="ham" onClick={() => setOpen(true)}>☰</button>
        </div>
      </nav>
      <div className={`mob${open ? ' open' : ''}`}>
        <button className="mob-x" onClick={() => setOpen(false)}>✕</button>
        {[['about','About'],['tokenomics','Tokenomics'],['chart','Chart'],['trade','Trade']].map(([id,l])=>(
          <a key={id} onClick={() => go(id)}>{l}</a>
        ))}
        <a href={O1} target="_blank" rel="noreferrer" className="btn-fill">Buy $VIBE ↗</a>
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
          <h1>I AM THE <span className="blue">VIBE.</span><br/>THE BASE DOG.</h1>
          <p className="hero-desc">
            Meet $VIBE — the Base Dog and the ultimate mood maker on Base B20.
            Good vibes and positive energy only.
            Every great journey starts with a single paw print 🐾
          </p>
          <div className="hero-btns">
            <a href={O1} target="_blank" rel="noreferrer" className="btn-fill">
              Buy $VIBE →
            </a>
            <a href={DEX} target="_blank" rel="noreferrer" className="btn-line">
              Dexscreener ↗
            </a>
          </div>
          <div className="hero-ca-wrap">
            <div className="hero-ca-lbl">$VIBE Contract Address (Base)</div>
            <div className="hero-ca-box">
              <span className="hero-ca-addr">{CA}</span>
              <button className={`hero-ca-btn${ok?' ok':''}`} onClick={go} title="Copy Address">
                {ok ? '✓' : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                )}
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
              <div className="trait"><span className="t-ico">🏗️</span><div className="t-txt"><strong>B20 on Base</strong>Community-driven standard, fully transparent tokenomics</div></div>
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
          <h2>Community-owned.<br/><span className="bl">Zero BS.</span></h2>
          <p className="sec-sub">100M tokens locked. Every unlock goes straight to you.</p>
        </div>
        
        <div className="stat-tiles wide-stats">
          <div className="stile"><span className="v">1B</span><span className="l">Total Supply</span></div>
          <div className="stile"><span className="v">900M</span><span className="l">Circulating</span></div>
          <div className="stile"><span className="v">100M</span><span className="l">Community Vesting</span><div className="d">10% released monthly</div></div>
          <div className="stile"><span className="v">10M</span><span className="l">Monthly Unlock</span><div className="d">Straight to holders</div></div>
        </div>

        <div className="tok-layout">
          <div>
            <div className="tok-card">
              <h3>Community Vesting · 100M $VIBE</h3>
              <p className="sub">10M unlocks monthly · starts Aug 8, 2026</p>
              <div className="prog"><div className="prog-f" style={{width:'10%'}}/></div>
              <div className="prog-labs"><span>0M today</span><span>100M total</span></div>
              <div className="who">
                <div className="who-r">
                  <div className="who-ico">💎</div>
                  <div className="who-t">$VIBE Holders<span>Hold 2M+ $VIBE to qualify</span></div>
                </div>
                <div className="who-r"><span className="who-ico">📣</span><div className="who-t">Token Supporters<span>Spread the vibes, share the rewards</span></div></div>
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
          <a href={DEX} target="_blank" rel="noreferrer" className="btn-line">Open Dexscreener ↗</a>
        </div>
        <div className="chart-box">
          <iframe
            src={DEX_EMB}
            title="$VIBE chart"
            width="100%" height="600"
            frameBorder="0" allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

/* TRADE */
function Trade() {
  const r=useRev();
  const {ok,go}=useCopy(CA);
  return (
    <section id="trade" className="alt">
      <div className="wrap">
        <div className="rv" ref={r}>
          <h2>Get <span className="bl">$VIBE</span>.</h2>
          <p className="sec-sub">Live on Base. Pick your venue and start vibing.</p>
        </div>
        <div className="trade-grid">
          <a href={O1} target="_blank" rel="noreferrer" className="tc">
            <div className="tc-top">
              <div className="tc-logo tc-o1">o1</div>
              <span className="tc-badge">Recommended</span>
            </div>
            <h3>o1.exchange</h3>
            <p>The launchpad where $VIBE was born. Bonded curve, lowest fees on Base. Best place to buy your vibes.</p>
            <div className="tc-foot">
              <span className="tc-cta">Open launch page</span>
              <div className="tc-arr">↗</div>
            </div>
          </a>
          <a href={DEX} target="_blank" rel="noreferrer" className="tc">
            <div className="tc-top">
              <div className="tc-logo tc-dx">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3L21 12L12 21L3 12Z" stroke="currentColor" strokeWidth="2"/></svg>
              </div>
              <span className="tc-badge">Charts & Trade</span>
            </div>
            <h3>DexScreener</h3>
            <p>Track $VIBE in real-time and trade directly from the chart. Powered by Dexscreener on Base network.</p>
            <div className="tc-foot">
              <span className="tc-cta">Trade on Dexscreener</span>
              <div className="tc-arr">↗</div>
            </div>
          </a>
        </div>
        <div className="ca-full-row">
          <div>
            <div className="lbl">Contract Address · Base Network</div>
            <div className="addr">{CA}</div>
          </div>
          <button className={`cbtn${ok?' ok':''}`} onClick={go}>
            {ok ? '✓ Copied!' : '📋 Copy CA'}
          </button>
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
        <div className="foot-brand"><span>$VIBE</span> · The Base Dog</div>
        <p className="foot-copy">© 2026 $VIBE · Not financial advice · Just a very good boy 🐾</p>
        <div className="foot-soc">
          <a href="#" className="soc" title="X">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="#" className="soc" title="Telegram">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247-2.035 9.587c-.148.665-.54.826-1.093.513l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.215-3.053 5.55-5.015c.242-.214-.051-.333-.37-.119l-6.86 4.32-2.953-.922c-.642-.2-.655-.642.135-.951l11.524-4.44c.535-.196 1.003.13.939.601z"/></svg>
          </a>
          <a href={DEX} target="_blank" rel="noreferrer" className="soc" title="Dexscreener">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3L21 12L12 21L3 12Z" stroke="currentColor" strokeWidth="2"/></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Nav/>
      <Hero/>
      <div className="divr"/>
      <About/>
      <div className="divr"/>
      <Tokenomics/>
      <div className="divr"/>
      <Chart/>
      <div className="divr"/>
      <Trade/>
      <Footer/>
    </>
  );
}
