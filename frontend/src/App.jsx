import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';

/* ── constants ── */
const CA      = '0xB200000000000000000000ba3068A5B447a81101';
const O1      = 'https://launch.o1.exchange/token/0xb200000000000000000000ba3068a5b447a81101';
const DEX     = 'https://dexscreener.com/base/0xb200000000000000000000ba3068a5b447a81101';
const DEX_EMB = 'https://dexscreener.com/base/0xb200000000000000000000ba3068a5b447a81101?embed=1&theme=dark&trades=0&info=0';

const UNLOCKS = [
  {date:'Aug 8, 2026',  amt:'10M'},
  {date:'Sep 7, 2026',  amt:'20M'},
  {date:'Oct 7, 2026',  amt:'30M'},
  {date:'Nov 6, 2026',  amt:'40M'},
  {date:'Dec 6, 2026',  amt:'50M'},
  {date:'Jan 5, 2027',  amt:'60M'},
  {date:'Feb 4, 2027',  amt:'70M'},
  {date:'Mar 6, 2027',  amt:'80M'},
  {date:'Apr 5, 2027',  amt:'90M'},
  {date:'May 5, 2027',  amt:'100M'},
];

const TICKER = [
  '🐾 $VIBE ON BASE','🐶 THE BASE DOG','✨ B20 STANDARD','🔥 GOOD BOY COIN',
  '💛 BASED COMPANION','🚀 UNLIMITED VIBES','🐾 HAPPY PAWS','💎 COMMUNITY FIRST',
  '🌊 RIDE THE VIBE','🤝 BASED & LOYAL',
];

/* ── tiny hooks ── */
const useCopy = (text) => {
  const [done, setDone] = useState(false);
  const go = useCallback(() => {
    navigator.clipboard.writeText(text).catch(()=>{});
    setDone(true);
    setTimeout(()=>setDone(false), 2000);
  }, [text]);
  return { done, go };
};

const useReveal = () => {
  const ref = useRef(null);
  useEffect(()=>{
    const el = ref.current; if(!el) return;
    const io = new IntersectionObserver(([e])=>{ if(e.isIntersecting) el.classList.add('in'); },{threshold:0.12});
    io.observe(el);
    return ()=>io.disconnect();
  },[]);
  return ref;
};

/* ── NAV ── */
function Nav() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen]   = useState(false);
  useEffect(()=>{
    const h = ()=>setStuck(window.scrollY>60);
    window.addEventListener('scroll',h);
    return ()=>window.removeEventListener('scroll',h);
  },[]);
  const go=(id)=>{ document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); setOpen(false); };
  return(
    <>
      <nav className={stuck?'stuck':''}>
        <div className="nav-inner">
          <div className="nav-brand" onClick={()=>go('hero')}>
            <div className="dot"/>
            $VIBE
          </div>
          <ul className="nav-menu">
            {[['about','About'],['tokenomics','Tokenomics'],['chart','Chart'],['trade','Trade']].map(([id,l])=>(
              <li key={id}><a onClick={()=>go(id)}>{l}</a></li>
            ))}
          </ul>
          <a href={O1} target="_blank" rel="noreferrer" className="nav-buy desk">Buy $VIBE ↗</a>
          <button className="ham" onClick={()=>setOpen(true)}>☰</button>
        </div>
      </nav>
      <div className={`mob${open?' open':''}`}>
        <button className="mob-x" onClick={()=>setOpen(false)}>✕</button>
        {[['about','About'],['tokenomics','Tokenomics'],['chart','Chart'],['trade','Trade']].map(([id,l])=>(
          <a key={id} onClick={()=>go(id)}>{l}</a>
        ))}
        <a href={O1} target="_blank" rel="noreferrer" className="btn-primary">Buy $VIBE ↗</a>
      </div>
    </>
  );
}

/* ── HERO ── */
function Hero() {
  const {done, go} = useCopy(CA);
  return(
    <section id="hero">
      <div className="hero-wrap z1">
        <div>
          <div className="hero-eyebrow">
            <div className="live-dot"/>
            Live on Base B20
          </div>
          <h1>
            The Base<br/>
            <span className="accent">Dog.</span><br/>
            <span className="ghost">Your Vibe.</span>
          </h1>
          <p className="hero-sub">
            Meet $VIBE — the Based Maltipoo and the ultimate mood maker on Base B20.
            Loyal. Fluffy. Vibing. Built to spread positive energy and immaculate vibes
            with the based community. Every great journey starts with a single paw print 🐾
          </p>
          <div className="hero-actions">
            <a href={O1} target="_blank" rel="noreferrer" className="btn-primary">
              Buy $VIBE on o1 ↗
            </a>
            <a href={DEX} target="_blank" rel="noreferrer" className="btn-ghost">
              View Chart
            </a>
          </div>
          <div className="ca-row">
            <span className="ca-label">CA</span>
            <span className="ca-addr">{CA}</span>
            <button className={`ca-copy${done?' ok':''}`} onClick={go}>
              {done?'✓ Copied':'Copy'}
            </button>
          </div>
        </div>

        <div>
          <div className="dog-card">
            <img src="/vibe-logo.png" alt="$VIBE The Base Dog" className="dog-img"/>
            <div className="dog-ticker">$VIBE</div>
            <div className="dog-tagline">The Based Maltipoo · B20</div>
            <div className="dog-stats">
              <div className="ds"><span className="ds-v">1B</span><span className="ds-l">Supply</span></div>
              <div className="ds"><span className="ds-v">900M</span><span className="ds-l">Circulating</span></div>
              <div className="ds"><span className="ds-v">100M</span><span className="ds-l">Vesting</span></div>
            </div>
            <div className="dog-paws">🐾 🐾 🐾 🐾 🐾</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── MARQUEE ── */
function Marquee() {
  const all = [...TICKER,...TICKER];
  return(
    <div className="marquee-bar">
      <div className="marquee-track">
        {all.map((t,i)=>(
          <div key={i} className="m-item">
            <span className="m-star">✦</span>
            <span className="m-bold">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── ABOUT ── */
function About() {
  const r1=useReveal(), r2=useReveal(), r3=useReveal();
  return(
    <section id="about" className="section">
      <div className="sec-wrap z1">
        <div ref={r1} className="reveal">
          <div className="sec-tag">About $VIBE</div>
          <h2>More than a token.<br/>A <span className="a">companion</span>.</h2>
          <p className="sec-desc">The fluffiest, most based dog on the blockchain.</p>
        </div>
        <div className="about-layout">
          <div ref={r2} className="reveal d1 about-copy">
            <p>
              $VIBE isn't just a memecoin — it's a movement. Inspired by a real Maltipoo pup,
              $VIBE embodies everything the Based community stands for: loyalty, good vibes,
              and unwavering positivity.
            </p>
            <p>
              Dreams. Happy paws. Unlimited vibes. Your loyal, vibing, based companion is here
              and ready to take the Base ecosystem by storm 🌊
            </p>
            <div className="traits">
              <div className="trait">
                <span className="trait-icon">🐶</span>
                <div className="trait-text">
                  <strong>Real Dog Energy</strong>
                  Inspired by a real Maltipoo — the cutest, most vibing dog you'll ever meet
                </div>
              </div>
              <div className="trait">
                <span className="trait-icon">🏗️</span>
                <div className="trait-text">
                  <strong>B20 on Base</strong>
                  Community-driven standard with fully transparent tokenomics
                </div>
              </div>
              <div className="trait">
                <span className="trait-icon">🤝</span>
                <div className="trait-text">
                  <strong>Loyal to Holders</strong>
                  100% of vesting distributed to the community — no team bags
                </div>
              </div>
              <div className="trait">
                <span className="trait-icon">🐾</span>
                <div className="trait-text">
                  <strong>Good Vibes Only</strong>
                  Every paw print forward is a step toward the moon
                </div>
              </div>
            </div>
          </div>
          <div ref={r3} className="reveal d2">
            <div className="stat-tiles">
              <div className="tile">
                <span className="v">1B</span>
                <span className="l">Total Supply</span>
              </div>
              <div className="tile">
                <span className="v">900M</span>
                <span className="l">Circulating</span>
              </div>
              <div className="tile">
                <span className="v">100M</span>
                <span className="l">Community Vesting</span>
                <div className="d">10% released monthly to holders &amp; supporters</div>
              </div>
              <div className="tile">
                <span className="v">10M</span>
                <span className="l">Monthly Unlock</span>
                <div className="d">Distributed every single month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── TOKENOMICS ── */
function Tokenomics() {
  const r=useReveal();
  return(
    <section id="tokenomics" className="section alt">
      <div className="sec-wrap z1">
        <div ref={r} className="reveal">
          <div className="sec-tag">Tokenomics</div>
          <h2>Community-owned.<br/><span className="a">Zero BS.</span></h2>
          <p className="sec-desc">100M tokens locked. Every unlock goes straight back to you.</p>
        </div>
        <div className="tok-grid">
          <div>
            <div className="tok-card" style={{marginBottom:20}}>
              <h3>Vesting Overview</h3>
              <p className="sub">10M unlocks each month · 10 months total</p>
              <div className="prog-track"><div className="prog-fill" style={{width:'10%'}}/></div>
              <div className="prog-labs"><span>0M today</span><span>100M total</span></div>
              <p style={{fontSize:'0.82rem',color:'var(--muted)',marginBottom:14}}>Who receives each monthly unlock:</p>
              <div className="who-list">
                <div className="who-item"><span className="wi">💎</span><div className="wt">Diamond Holders<span>Hold $44+ in $VIBE to qualify</span></div></div>
                <div className="who-item"><span className="wi">🐾</span><div className="wt">Active Members<span>Engage with the community and earn</span></div></div>
                <div className="who-item"><span className="wi">📣</span><div className="wt">Token Supporters<span>Spread the vibes, share the rewards</span></div></div>
              </div>
            </div>
            <div className="tok-card">
              <h3>Supply Breakdown</h3>
              <p className="sub" style={{marginBottom:20}}>Where every token lives</p>
              <div className="supply-grid">
                <div className="supply-row">
                  <div className="supply-top"><span className="supply-name">Circulating Supply</span><span className="supply-pct">90%</span></div>
                  <div className="prog-track"><div className="prog-fill" style={{width:'90%',background:'var(--teal)'}}/></div>
                </div>
                <div className="supply-row">
                  <div className="supply-top"><span className="supply-name">Community Vesting</span><span className="supply-pct">10%</span></div>
                  <div className="prog-track"><div className="prog-fill" style={{width:'10%',background:'#00a8ff'}}/></div>
                </div>
              </div>
            </div>
          </div>
          <div className="sched-card">
            <h3>Unlock Schedule</h3>
            <p className="sub">Aug 2026 → May 2027</p>
            <div className="ul-list">
              {UNLOCKS.map((u,i)=>(
                <div key={i} className="ul-item">
                  <span className="ul-date">{u.date}</span>
                  <span className="ul-amt">{u.amt}</span>
                  <span className="ul-tag">locked</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── CHART ── */
function Chart() {
  const r=useReveal();
  return(
    <section id="chart" className="section">
      <div className="sec-wrap z1">
        <div ref={r} className="reveal chart-header">
          <div>
            <div className="sec-tag">Live Chart</div>
            <h2>Price <span className="a">Action</span>.</h2>
          </div>
          <a href={DEX} target="_blank" rel="noreferrer" className="btn-ghost">Open Dexscreener ↗</a>
        </div>
        <div className="chart-frame">
          <iframe src={DEX_EMB} title="$VIBE chart" width="100%" height="620" frameBorder="0" allowFullScreen/>
        </div>
      </div>
    </section>
  );
}

/* ── TRADE ── */
function Trade() {
  const r=useReveal();
  const {done,go}=useCopy(CA);
  return(
    <section id="trade" className="section alt">
      <div className="sec-wrap z1">
        <div ref={r} className="reveal">
          <div className="sec-tag">How to Buy</div>
          <h2>Get <span className="a">$VIBE</span>.</h2>
          <p className="sec-desc">Live on Base. Pick your venue.</p>
        </div>
        <div className="trade-grid">
          <a href={O1} target="_blank" rel="noreferrer" className="trade-link">
            <div className="tl-top">
              <div className="tl-logo tl-o1">o1</div>
              <span className="tl-badge">Recommended</span>
            </div>
            <h3>o1.exchange</h3>
            <p>The launchpad where $VIBE was born. Bonded curve, simplest UX, lowest fees on Base. Best place to grab your vibes.</p>
            <div className="tl-foot">
              <span className="tl-cta">Open launch page</span>
              <div className="tl-arr">↗</div>
            </div>
          </a>
          <a href={DEX} target="_blank" rel="noreferrer" className="trade-link">
            <div className="tl-top">
              <div className="tl-logo tl-dx">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3L21 12L12 21L3 12Z" stroke="currentColor" strokeWidth="2"/></svg>
              </div>
              <span className="tl-badge">Charts &amp; Trade</span>
            </div>
            <h3>DexScreener</h3>
            <p>Track $VIBE live and trade directly from the chart. Real-time price action, volume, and liquidity data on Base.</p>
            <div className="tl-foot">
              <span className="tl-cta">Trade on Dexscreener</span>
              <div className="tl-arr">↗</div>
            </div>
          </a>
        </div>
        <div className="ca-full">
          <div>
            <div className="cl">Contract Address · Base Network</div>
            <div className="cv">{CA}</div>
          </div>
          <button className={`ca-full-btn${done?' ok':''}`} onClick={go}>
            {done?'✓ Copied!':'📋 Copy CA'}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── FOOTER ── */
function Footer() {
  return(
    <footer>
      <div className="foot">
        <div className="foot-logo"><span>$VIBE</span> · The Base Dog</div>
        <p className="foot-copy">© 2026 $VIBE · Not financial advice · Just a very good boy 🐾</p>
        <div className="foot-soc">
          <a href="#" className="soc-btn" title="X / Twitter">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="#" className="soc-btn" title="Telegram">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247-2.035 9.587c-.148.665-.54.826-1.093.513l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.215-3.053 5.55-5.015c.242-.214-.051-.333-.37-.119l-6.86 4.32-2.953-.922c-.642-.2-.655-.642.135-.951l11.524-4.44c.535-.196 1.003.13.939.601z"/></svg>
          </a>
          <a href={DEX} target="_blank" rel="noreferrer" className="soc-btn" title="DexScreener">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3L21 12L12 21L3 12Z" stroke="currentColor" strokeWidth="2"/></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ── APP ── */
export default function App() {
  return(
    <>
      <div className="blob blob-1" aria-hidden="true"/>
      <div className="blob blob-2" aria-hidden="true"/>
      <div className="blob blob-3" aria-hidden="true"/>
      <Nav/>
      <Hero/>
      <Marquee/>
      <div className="div"/>
      <About/>
      <div className="div"/>
      <Tokenomics/>
      <div className="div"/>
      <Chart/>
      <div className="div"/>
      <Trade/>
      <Footer/>
    </>
  );
}
