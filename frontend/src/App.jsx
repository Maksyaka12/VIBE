import React, { useState, useEffect } from 'react';
import { Twitter, Send, LineChart, ShoppingBag, Info, Shield, Menu, X } from 'lucide-react';
import './index.css';

const App = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const unlockDates = [
    { date: "Aug 8, 2026", amount: "10M", status: "locked" },
    { date: "Sep 7, 2026", amount: "20M", status: "locked" },
    { date: "Oct 7, 2026", amount: "30M", status: "locked" },
    { date: "Nov 6, 2026", amount: "40M", status: "locked" },
    { date: "Dec 6, 2026", amount: "50M", status: "locked" },
    { date: "Jan 5, 2027", amount: "60M", status: "locked" },
    { date: "Feb 4, 2027", amount: "70M", status: "locked" },
    { date: "Mar 6, 2027", amount: "80M", status: "locked" },
    { date: "Apr 5, 2027", amount: "90M", status: "locked" },
    { date: "May 5, 2027", amount: "100M", status: "locked" }
  ];

  return (
    <div className="app-container">
      {/* Header */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <div className="logo" onClick={() => scrollTo('hero')}>
            $VIBE
          </div>
          
          <nav className="desktop-nav">
            <button onClick={() => scrollTo('about')}>About</button>
            <button onClick={() => scrollTo('tokenomics')}>Tokenomics</button>
            <button onClick={() => scrollTo('chart')}>Chart</button>
            <button onClick={() => scrollTo('trade')}>How to Buy</button>
          </nav>

          <button className="btn btn-primary nav-btn" onClick={() => window.open('https://launch.o1.exchange/token/0xb200000000000000000000ba3068a5b447a81101', '_blank')}>
            Buy $VIBE
          </button>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <button onClick={() => scrollTo('about')}>About</button>
          <button onClick={() => scrollTo('tokenomics')}>Tokenomics</button>
          <button onClick={() => scrollTo('chart')}>Chart</button>
          <button onClick={() => scrollTo('trade')}>How to Buy</button>
        </div>
      )}

      <main>
        {/* Hero Section */}
        <section id="hero" className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">🐶 LIVE ON BASE B20</div>
            <h1 className="hero-title">Meet <span className="highlight">$VIBE</span>.</h1>
            <p className="hero-subtitle">
              The ultimate mood maker on Base. Built to share its positive energy and immaculate vibes with the based community.
            </p>
            <div className="hero-actions">
              <a href="https://launch.o1.exchange/token/0xb200000000000000000000ba3068a5b447a81101" target="_blank" rel="noreferrer" className="btn btn-primary">
                <ShoppingBag size={18} style={{marginRight: '8px'}}/> Buy on o1.exchange
              </a>
              <button onClick={() => scrollTo('chart')} className="btn btn-secondary">
                <LineChart size={18} style={{marginRight: '8px'}}/> View Chart
              </button>
            </div>
            <div className="ca-box">
              <span className="ca-label">CA (Base):</span>
              <span className="ca-address">0xB200000000000000000000ba3068A5B447a81101</span>
              <button className="copy-btn" onClick={() => navigator.clipboard.writeText('0xB200000000000000000000ba3068A5B447a81101')}>
                Copy
              </button>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <img src="/logo.png" alt="$VIBE Dog" className="hero-image" />
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="section about-section">
          <div className="section-header">
            <h2>The $VIBE Movement</h2>
            <p className="section-desc">Every great journey starts with a single paw print 🐾</p>
          </div>
          
          <div className="about-grid">
            <div className="glass-card about-card">
              <div className="card-icon"><Info size={32} /></div>
              <h3>What is $VIBE?</h3>
              <p>Meet $VIBE — the Base Dog and the ultimate mood maker on Base B20 🐾 Built to share its positive energy and immaculate vibes with the based community. Dreams. Happy paws. Unlimited vibes.</p>
            </div>
            
            <div className="glass-card stat-card">
              <h3>1 Billion</h3>
              <p>Total Supply</p>
              <div className="stat-divider"></div>
              <h3>900 Million</h3>
              <p>Current Circulating Supply</p>
            </div>
          </div>
        </section>

        {/* Tokenomics Section */}
        <section id="tokenomics" className="section tokenomics-section">
          <div className="section-header">
            <h2>Community-Driven Tokenomics</h2>
            <p className="section-desc">100M tokens in vesting, distributed entirely to our community.</p>
          </div>

          <div className="tokenomics-content">
            <div className="glass-card info-card">
              <Shield size={32} className="accent-icon" />
              <h3>Vesting & Distribution</h3>
              <p>
                100M $VIBE tokens are locked in vesting. Every month, exactly <strong>10% (10M tokens)</strong> unlocks.
                These tokens are distributed 100% to our loyal community:
              </p>
              <ul>
                <li>Holders with $44+ in $VIBE tokens</li>
                <li>Active community members (Token Supporters)</li>
              </ul>
            </div>

            <div className="glass-card schedule-card">
              <h3>Unlock Schedule</h3>
              <div className="unlock-list">
                {unlockDates.map((item, index) => (
                  <div key={index} className="unlock-item">
                    <div className="unlock-date">{item.date}</div>
                    <div className="unlock-amount">{item.amount}</div>
                    <div className="unlock-status">{item.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Chart Section */}
        <section id="chart" className="section chart-section">
          <div className="section-header">
            <h2>Live Chart</h2>
            <p className="section-desc">Track $VIBE performance in real-time on Dexscreener.</p>
          </div>
          
          <div className="chart-container glass-card">
            <iframe 
              src="https://dexscreener.com/base/0x6fd5a9c697b93ce1740b1833a17c1460086b72b256f343d862d3ed6d2dbc6530?embed=1&theme=dark"
              title="$VIBE Chart"
              width="100%"
              height="600"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* Trade Section */}
        <section id="trade" className="section trade-section">
          <div className="section-header">
            <h2>Get $VIBE</h2>
            <p className="section-desc">Live on Base. Pick your venue.</p>
          </div>

          <div className="trade-grid">
            <a href="https://launch.o1.exchange/token/0xb200000000000000000000ba3068a5b447a81101" target="_blank" rel="noreferrer" className="glass-card trade-card">
              <div className="trade-logo o1-logo">o1</div>
              <h3>o1.exchange</h3>
              <p>Launchpad — where $VIBE was born. Bonded curve, simplest UX.</p>
              <span className="trade-link-text">Open launch page →</span>
            </a>
            
            <a href="https://dexscreener.com/base/0x6fd5a9c697b93ce1740b1833a17c1460086b72b256f343d862d3ed6d2dbc6530" target="_blank" rel="noreferrer" className="glass-card trade-card">
              <div className="trade-logo dex-logo">DX</div>
              <h3>DexScreener</h3>
              <p>Trade directly through DexScreener interface on Base network.</p>
              <span className="trade-link-text">Trade now →</span>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">$VIBE</div>
          <p className="disclaimer">© 2026 $VIBE. Not financial advice. Just a based dog. 🐾</p>
          <div className="social-links">
            <a href="#" className="social-link"><Twitter size={20} /></a>
            <a href="#" className="social-link"><Send size={20} /></a>
            <a href="https://dexscreener.com/base/0x6fd5a9c697b93ce1740b1833a17c1460086b72b256f343d862d3ed6d2dbc6530" target="_blank" rel="noreferrer" className="social-link"><LineChart size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
