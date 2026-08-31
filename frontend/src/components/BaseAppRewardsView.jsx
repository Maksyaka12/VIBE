import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Coins, Lock, ArrowUpRight, ChevronDown } from 'lucide-react';

function formatClaimCountdown(targetDate) {
  if (!targetDate) return '';
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = target - now;

  if (diff <= 0) return 'Ended';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const pad = (n) => String(n).padStart(2, '0');

  if (days > 0) {
    return `${days}D ${pad(hours)}H ${pad(minutes)}M`;
  }
  return `${pad(hours)}H ${pad(minutes)}M ${pad(seconds)}S`;
}

function ActiveClaimCountdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(() => formatClaimCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatClaimCountdown(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return <span>{timeLeft}</span>;
}

export default function BaseAppRewardsView({
  HOLDER_UNLOCKS,
  VIBECLUB_EPOCHS,
  STAKING_EPOCHS,
  GIVEAWAYS_DATA,
  O1_STAKING_VAULT,
  now
}) {
  const [currentTab, setCurrentTab] = useState('holders');
  const [openFaq, setOpenFaq] = useState(null);

  // Holder calculations
  const activeHolders = HOLDER_UNLOCKS.filter(u => now >= u.dateObj);
  const featuredHolder = activeHolders[0] || HOLDER_UNLOCKS[0];
  const upcomingHolders = HOLDER_UNLOCKS.filter(u => u.unlock !== featuredHolder.unlock);

  // Vibe Club calculations
  const activeVibeClubs = VIBECLUB_EPOCHS.filter(u => now >= u.dateObj);
  const featuredVibeClub = activeVibeClubs[0] || VIBECLUB_EPOCHS[0];
  const upcomingVibeClubs = VIBECLUB_EPOCHS.filter(u => u.epoch !== featuredVibeClub.epoch);

  // Staking calculations
  const activeStakings = STAKING_EPOCHS.filter(e => e.status === 'active' || e.status === 'ongoing');
  const featuredStaking = activeStakings[0] || STAKING_EPOCHS[0];
  const upcomingStakings = STAKING_EPOCHS.filter(e => e.epoch !== featuredStaking.epoch);

  // Giveaways calculations
  const activeGiveaways = GIVEAWAYS_DATA.filter(e => e.status === 'ongoing');
  const featuredGiveaway = activeGiveaways[0] || GIVEAWAYS_DATA[0];
  const pastGiveaways = GIVEAWAYS_DATA.filter(e => e.id !== featuredGiveaway?.id);

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      {/* ── 1. REWARDS HERO TITLE ── */}
      <div className="sec-head" style={{ marginBottom: '18px', textAlign: 'center' }}>
        <h2>Rewards <span className="bl">Hub</span>.</h2>
        <p className="sec-sub">Track active epochs &amp; claim community rewards</p>
      </div>

      {/* ── 2. SEGMENTED CATEGORY SWITCHER (1 TAP SWITCHING) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '5px',
          background: 'rgba(2, 11, 26, 0.88)',
          border: '1.5px solid rgba(0, 245, 255, 0.25)',
          borderRadius: '14px',
          padding: '5px',
          marginBottom: '20px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)'
        }}
      >
        {[
          { id: 'holders', label: 'Holders', icon: '💎' },
          { id: 'vibe-club', label: 'Vibe Club', icon: '👑' },
          { id: 'staking', label: 'Staking', icon: '⚡' },
          { id: 'giveaways', label: 'Giveaway', icon: '🎁' }
        ].map(tab => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              style={{
                background: isActive ? '#0052ff' : 'transparent',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '9px 2px',
                fontSize: '6.5px',
                fontFamily: "'Press Start 2P', monospace",
                cursor: 'pointer',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                boxShadow: isActive ? '0 0 14px rgba(0, 82, 255, 0.6)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <span style={{ fontSize: '13px' }}>{tab.icon}</span>
              <span style={{ whiteSpace: 'nowrap' }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 3. CATEGORY VIEW: 💎 HOLDER REWARDS ── */}
      {currentTab === 'holders' && (
        <div>
          {/* Smart Rule Strip */}
          <div
            style={{
              background: 'rgba(2, 11, 26, 0.75)',
              border: '1px solid rgba(0, 245, 255, 0.2)',
              borderRadius: '12px',
              padding: '10px 12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '6.5px', color: '#88aacc', lineHeight: 1.5 }}>
              💡 Hold 5M+ $VIBE before snapshot to share the 100M pool.
            </span>
            <a
              href="/tokenomics#vesting-details"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '6.5px', color: '#00f5ff', textDecoration: 'none', whiteSpace: 'nowrap', fontWeight: 800 }}
            >
              Rules ↗
            </a>
          </div>

          {/* Featured Spotlight Active Card */}
          {featuredHolder && (
            <div
              style={{
                background: 'rgba(4, 20, 48, 0.92)',
                border: '2px solid #00f5ff',
                borderRadius: '18px',
                padding: '18px 16px',
                marginBottom: '20px',
                boxShadow: '0 0 24px rgba(0, 245, 255, 0.25), 0 8px 32px rgba(0,0,0,0.8)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src="/new-logo-vibe.png" alt="VIBE" style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #00f5ff' }} />
                  <div>
                    <div style={{ fontSize: '9px', color: '#ffffff', fontWeight: 900 }}>{featuredHolder.unlock}</div>
                    <div style={{ fontSize: '6px', color: '#00ff88', marginTop: '3px' }}>ACTIVE ROUND</div>
                  </div>
                </div>
                <div style={{ background: 'rgba(0, 255, 136, 0.15)', border: '1px solid #00ff88', color: '#00ff88', padding: '4px 8px', borderRadius: '8px', fontSize: '6.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 6px #00ff88' }} />
                  <ActiveClaimCountdown targetDate={featuredHolder.nextSnapshotDate} />
                </div>
              </div>

              {/* Rewards Pool highlight */}
              <div style={{ background: 'rgba(2, 11, 26, 0.85)', border: '1px solid rgba(0, 245, 255, 0.25)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '6.5px', color: '#88aacc', marginBottom: '4px' }}>REWARDS POOL</div>
                <div style={{ fontSize: '13px', color: '#00f5ff', fontWeight: 900, textShadow: '0 0 12px rgba(0, 245, 255, 0.5)' }}>
                  {featuredHolder.poolAmount} <span style={{ fontSize: '8px' }}>$VIBE</span>
                </div>
              </div>

              {/* Two info pills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(2, 11, 26, 0.75)', border: '1px solid rgba(0, 245, 255, 0.2)', borderRadius: '10px', padding: '8px 10px' }}>
                  <div style={{ fontSize: '6px', color: '#88aacc', marginBottom: '2px' }}>REQUIREMENT</div>
                  <div style={{ fontSize: '7px', color: '#ffffff', fontWeight: 800 }}>5M+ $VIBE</div>
                </div>
                <div style={{ background: 'rgba(2, 11, 26, 0.75)', border: '1px solid rgba(0, 245, 255, 0.2)', borderRadius: '10px', padding: '8px 10px' }}>
                  <div style={{ fontSize: '6px', color: '#88aacc', marginBottom: '2px' }}>SNAPSHOT</div>
                  <div style={{ fontSize: '7px', color: '#ffffff', fontWeight: 800 }}>{featuredHolder.snapshotTime}</div>
                </div>
              </div>

              {/* Direct Claim Action */}
              <Link to="/claim" className="btn-fill" style={{ width: '100%', padding: '12px', fontSize: '8.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
                <span>CLAIM REWARD</span> <ArrowUpRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
          )}

          {/* Upcoming Schedule Timeline List */}
          <div style={{ background: 'rgba(4, 20, 48, 0.88)', border: '1.5px solid rgba(0, 245, 255, 0.25)', borderRadius: '16px', padding: '16px 14px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '8.5px', color: '#ffffff', fontWeight: 900 }}>UPCOMING UNLOCKS</div>
              <div style={{ fontSize: '6.5px', color: '#88aacc' }}>{upcomingHolders.length} ROUNDS</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcomingHolders.map(u => (
                <div
                  key={u.unlock}
                  style={{
                    background: 'rgba(2, 11, 26, 0.75)',
                    border: '1px solid rgba(0, 245, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '7.5px', color: '#ffffff', fontWeight: 800 }}>{u.unlock}</div>
                    <div style={{ fontSize: '6.5px', color: '#88aacc', marginTop: '2px' }}>{u.unlockDate}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '8px', color: '#00f5ff', fontWeight: 800 }}>{u.poolAmount} $VIBE</div>
                    <div style={{ fontSize: '6px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                      <Lock size={9} /> LOCKED
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 4. CATEGORY VIEW: 👑 VIBE CLUB ── */}
      {currentTab === 'vibe-club' && (
        <div>
          {/* Smart Rule Strip */}
          <div
            style={{
              background: 'rgba(2, 11, 26, 0.75)',
              border: '1px solid rgba(0, 245, 255, 0.2)',
              borderRadius: '12px',
              padding: '10px 12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '6.5px', color: '#88aacc', lineHeight: 1.5 }}>
              👑 Hold Vibe Club NFT to claim 15% of community royalties.
            </span>
            <a
              href="https://vibeverse.dog/vibeclub"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '6.5px', color: '#00f5ff', textDecoration: 'none', whiteSpace: 'nowrap', fontWeight: 800 }}
            >
              Mint NFT ↗
            </a>
          </div>

          {/* Featured Active Royalty Card */}
          {featuredVibeClub && (
            <div
              style={{
                background: 'rgba(4, 20, 48, 0.92)',
                border: '2px solid #00f5ff',
                borderRadius: '18px',
                padding: '18px 16px',
                marginBottom: '20px',
                boxShadow: '0 0 24px rgba(0, 245, 255, 0.25), 0 8px 32px rgba(0,0,0,0.8)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src="/new-logo-vibe.png" alt="VIBE" style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #00f5ff' }} />
                  <div>
                    <div style={{ fontSize: '9px', color: '#ffffff', fontWeight: 900 }}>{featuredVibeClub.epoch}</div>
                    <div style={{ fontSize: '6px', color: '#00ff88', marginTop: '3px' }}>ACTIVE ROYALTY EPOCH</div>
                  </div>
                </div>
                <div style={{ background: 'rgba(0, 255, 136, 0.15)', border: '1px solid #00ff88', color: '#00ff88', padding: '4px 8px', borderRadius: '8px', fontSize: '6.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 6px #00ff88' }} />
                  <ActiveClaimCountdown targetDate={featuredVibeClub.nextSnapshotDate} />
                </div>
              </div>

              {/* Royalty Pool highlight */}
              <div style={{ background: 'rgba(2, 11, 26, 0.85)', border: '1px solid rgba(0, 245, 255, 0.25)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '6.5px', color: '#88aacc', marginBottom: '4px' }}>ROYALTY POOL</div>
                <div style={{ fontSize: '11px', color: '#00f5ff', fontWeight: 900, textShadow: '0 0 12px rgba(0, 245, 255, 0.5)' }}>
                  {featuredVibeClub.poolAmount}
                </div>
              </div>

              {/* Two info pills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(2, 11, 26, 0.75)', border: '1px solid rgba(0, 245, 255, 0.2)', borderRadius: '10px', padding: '8px 10px' }}>
                  <div style={{ fontSize: '6px', color: '#88aacc', marginBottom: '2px' }}>REQUIREMENT</div>
                  <div style={{ fontSize: '7px', color: '#ffffff', fontWeight: 800 }}>NFT HOLDER</div>
                </div>
                <div style={{ background: 'rgba(2, 11, 26, 0.75)', border: '1px solid rgba(0, 245, 255, 0.2)', borderRadius: '10px', padding: '8px 10px' }}>
                  <div style={{ fontSize: '6px', color: '#88aacc', marginBottom: '2px' }}>SNAPSHOT</div>
                  <div style={{ fontSize: '7px', color: '#ffffff', fontWeight: 800 }}>{featuredVibeClub.snapshotTime}</div>
                </div>
              </div>

              {/* Direct Claim Action */}
              <Link to="/claim" className="btn-fill" style={{ width: '100%', padding: '12px', fontSize: '8.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
                <span>CLAIM ROYALTIES</span> <ArrowUpRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
          )}

          {/* Upcoming Royalty Schedule */}
          <div style={{ background: 'rgba(4, 20, 48, 0.88)', border: '1.5px solid rgba(0, 245, 255, 0.25)', borderRadius: '16px', padding: '16px 14px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '8.5px', color: '#ffffff', fontWeight: 900 }}>FUTURE ROYALTY EPOCHS</div>
              <div style={{ fontSize: '6.5px', color: '#88aacc' }}>{upcomingVibeClubs.length} ROUNDS</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcomingVibeClubs.map((u, i) => (
                <div
                  key={u.epoch || i}
                  style={{
                    background: 'rgba(2, 11, 26, 0.75)',
                    border: '1px solid rgba(0, 245, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '7.5px', color: '#ffffff', fontWeight: 800 }}>{u.epoch}</div>
                    <div style={{ fontSize: '6.5px', color: '#88aacc', marginTop: '2px' }}>{u.claimDate}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '7.5px', color: '#00f5ff', fontWeight: 800 }}>{u.poolAmount}</div>
                    <div style={{ fontSize: '6px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                      <Lock size={9} /> LOCKED
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 5. CATEGORY VIEW: ⚡ STAKING ── */}
      {currentTab === 'staking' && (
        <div>
          {/* Smart Rule Strip */}
          <div
            style={{
              background: 'rgba(2, 11, 26, 0.75)',
              border: '1px solid rgba(0, 245, 255, 0.2)',
              borderRadius: '12px',
              padding: '10px 12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '6.5px', color: '#88aacc', lineHeight: 1.5 }}>
              ⚡ Stake $VIBE in active vault to earn high yield.
            </span>
            <a
              href={O1_STAKING_VAULT}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '6.5px', color: '#00f5ff', textDecoration: 'none', whiteSpace: 'nowrap', fontWeight: 800 }}
            >
              Vault ↗
            </a>
          </div>

          {/* Featured Active Staking Epoch */}
          {featuredStaking && (
            <div
              style={{
                background: 'rgba(4, 20, 48, 0.92)',
                border: '2px solid #00f5ff',
                borderRadius: '18px',
                padding: '18px 16px',
                marginBottom: '20px',
                boxShadow: '0 0 24px rgba(0, 245, 255, 0.25), 0 8px 32px rgba(0,0,0,0.8)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src="/new-logo-vibe.png" alt="VIBE" style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #00f5ff' }} />
                  <div>
                    <div style={{ fontSize: '9px', color: '#ffffff', fontWeight: 900 }}>{featuredStaking.epoch}</div>
                    <div style={{ fontSize: '6px', color: '#00ff88', marginTop: '3px' }}>{featuredStaking.duration || '10 DAYS'}</div>
                  </div>
                </div>
                <div style={{ background: 'rgba(0, 255, 136, 0.15)', border: '1px solid #00ff88', color: '#00ff88', padding: '4px 8px', borderRadius: '8px', fontSize: '6.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 6px #00ff88' }} />
                  ACTIVE
                </div>
              </div>

              {/* Pool highlight */}
              <div style={{ background: 'rgba(2, 11, 26, 0.85)', border: '1px solid rgba(0, 245, 255, 0.25)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '6.5px', color: '#88aacc', marginBottom: '4px' }}>REWARDS POOL</div>
                <div style={{ fontSize: '13px', color: '#00f5ff', fontWeight: 900, textShadow: '0 0 12px rgba(0, 245, 255, 0.5)' }}>
                  {featuredStaking.poolAmount} <span style={{ fontSize: '8px' }}>$VIBE</span>
                </div>
              </div>

              {/* Two info pills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(2, 11, 26, 0.75)', border: '1px solid rgba(0, 245, 255, 0.2)', borderRadius: '10px', padding: '8px 10px' }}>
                  <div style={{ fontSize: '6px', color: '#88aacc', marginBottom: '2px' }}>START</div>
                  <div style={{ fontSize: '7px', color: '#ffffff', fontWeight: 800 }}>{featuredStaking.startTime}</div>
                </div>
                <div style={{ background: 'rgba(2, 11, 26, 0.75)', border: '1px solid rgba(0, 245, 255, 0.2)', borderRadius: '10px', padding: '8px 10px' }}>
                  <div style={{ fontSize: '6px', color: '#88aacc', marginBottom: '2px' }}>END</div>
                  <div style={{ fontSize: '7px', color: '#ffffff', fontWeight: 800 }}>{featuredStaking.endTime}</div>
                </div>
              </div>

              {/* Direct Stake Action */}
              <a
                href={featuredStaking.link || O1_STAKING_VAULT}
                target="_blank"
                rel="noreferrer"
                className="btn-fill"
                style={{ width: '100%', padding: '12px', fontSize: '8.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
              >
                <span>STAKE &amp; EARN</span> <ArrowUpRight size={14} strokeWidth={2.5} />
              </a>
            </div>
          )}

          {/* Upcoming Staking Epochs */}
          <div style={{ background: 'rgba(4, 20, 48, 0.88)', border: '1.5px solid rgba(0, 245, 255, 0.25)', borderRadius: '16px', padding: '16px 14px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '8.5px', color: '#ffffff', fontWeight: 900 }}>MORE STAKING EPOCHS</div>
              <div style={{ fontSize: '6.5px', color: '#88aacc' }}>CONTINUOUS</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcomingStakings.map((u, i) => (
                <div
                  key={u.epoch || i}
                  style={{
                    background: 'rgba(2, 11, 26, 0.75)',
                    border: '1px solid rgba(0, 245, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '7.5px', color: '#ffffff', fontWeight: 800 }}>{u.epoch}</div>
                    <div style={{ fontSize: '6.5px', color: '#88aacc', marginTop: '2px' }}>{u.startTime}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '8px', color: '#00f5ff', fontWeight: 800 }}>{u.poolAmount}</div>
                    <div style={{ fontSize: '6px', color: '#64748b', marginTop: '2px' }}>UPCOMING</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 6. CATEGORY VIEW: 🎁 GIVEAWAYS ── */}
      {currentTab === 'giveaways' && (
        <div>
          {/* Smart Rule Strip */}
          <div
            style={{
              background: 'rgba(2, 11, 26, 0.75)',
              border: '1px solid rgba(0, 245, 255, 0.2)',
              borderRadius: '12px',
              padding: '10px 12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '6.5px', color: '#88aacc', lineHeight: 1.5 }}>
              🎁 Community giveaways distributed directly to eligible winners.
            </span>
          </div>

          {/* Featured Active Giveaway Card */}
          {featuredGiveaway && (
            <div
              style={{
                background: 'rgba(4, 20, 48, 0.92)',
                border: '2px solid #00f5ff',
                borderRadius: '18px',
                padding: '18px 16px',
                marginBottom: '20px',
                boxShadow: '0 0 24px rgba(0, 245, 255, 0.25), 0 8px 32px rgba(0,0,0,0.8)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src="/new-logo-vibe.png" alt="VIBE" style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #00f5ff' }} />
                  <div>
                    <div style={{ fontSize: '9px', color: '#ffffff', fontWeight: 900 }}>{featuredGiveaway.title}</div>
                    <div style={{ fontSize: '6px', color: '#00ff88', marginTop: '3px' }}>ACTIVE EVENT</div>
                  </div>
                </div>
                <div style={{ background: 'rgba(0, 255, 136, 0.15)', border: '1px solid #00ff88', color: '#00ff88', padding: '4px 8px', borderRadius: '8px', fontSize: '6.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 6px #00ff88' }} />
                  ONGOING
                </div>
              </div>

              {/* Prize Pool highlight */}
              <div style={{ background: 'rgba(2, 11, 26, 0.85)', border: '1px solid rgba(0, 245, 255, 0.25)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '6.5px', color: '#88aacc', marginBottom: '4px' }}>PRIZE POOL</div>
                <div style={{ fontSize: '13px', color: '#00f5ff', fontWeight: 900, textShadow: '0 0 12px rgba(0, 245, 255, 0.5)' }}>
                  {featuredGiveaway.prizePool}
                </div>
              </div>

              {/* Two info pills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: 'rgba(2, 11, 26, 0.75)', border: '1px solid rgba(0, 245, 255, 0.2)', borderRadius: '10px', padding: '8px 10px' }}>
                  <div style={{ fontSize: '6px', color: '#88aacc', marginBottom: '2px' }}>DISTRIBUTION</div>
                  <div style={{ fontSize: '7px', color: '#ffffff', fontWeight: 800 }}>{featuredGiveaway.distribution}</div>
                </div>
                <div style={{ background: 'rgba(2, 11, 26, 0.75)', border: '1px solid rgba(0, 245, 255, 0.2)', borderRadius: '10px', padding: '8px 10px' }}>
                  <div style={{ fontSize: '6px', color: '#88aacc', marginBottom: '2px' }}>WINNERS</div>
                  <div style={{ fontSize: '7px', color: '#ffffff', fontWeight: 800 }}>{featuredGiveaway.winners}</div>
                </div>
              </div>
            </div>
          )}

          {/* Past Giveaways */}
          {pastGiveaways.length > 0 && (
            <div style={{ background: 'rgba(4, 20, 48, 0.88)', border: '1.5px solid rgba(0, 245, 255, 0.25)', borderRadius: '16px', padding: '16px 14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '8.5px', color: '#ffffff', fontWeight: 900 }}>PAST GIVEAWAYS</div>
                <div style={{ fontSize: '6.5px', color: '#88aacc' }}>{pastGiveaways.length} EVENTS</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pastGiveaways.map((u, i) => (
                  <div
                    key={u.id || i}
                    style={{
                      background: 'rgba(2, 11, 26, 0.75)',
                      border: '1px solid rgba(0, 245, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '7.5px', color: '#ffffff', fontWeight: 800 }}>{u.title}</div>
                      <div style={{ fontSize: '6.5px', color: '#88aacc', marginTop: '2px' }}>{u.winners}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '7.5px', color: '#00f5ff', fontWeight: 800 }}>{u.prizePool}</div>
                      <div style={{ fontSize: '6px', color: '#64748b', marginTop: '2px' }}>ENDED</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 7. FAQ ACCORDION (COMPACT) ── */}
      <div style={{ marginTop: '20px', marginBottom: '40px' }}>
        <div style={{ fontSize: '8.5px', color: '#ffffff', fontWeight: 900, textAlign: 'center', marginBottom: '12px' }}>
          RULES &amp; FAQ
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            {
              question: 'How to claim rewards?',
              answer: 'Claim active Holder & Vibe Club rewards directly via the Claim button at snapshot dates.'
            },
            {
              question: 'How does staking yield work?',
              answer: 'Stake $VIBE into open epochs on the o1 vault to earn rewards automatically.'
            },
            {
              question: 'What happens to unclaimed tokens?',
              answer: 'Unclaimed rewards after the claim deadline are permanently burned.'
            }
          ].map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(4, 20, 48, 0.88)',
                  border: '1px solid rgba(0, 245, 255, 0.25)',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '7px',
                    color: '#ffffff'
                  }}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={14}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      color: '#00f5ff',
                      flexShrink: 0
                    }}
                  />
                </button>
                {isOpen && (
                  <div style={{ padding: '0 14px 12px 14px', fontSize: '6.5px', color: '#cbd5e1', lineHeight: 1.6, borderTop: '1px solid rgba(0, 245, 255, 0.15)' }}>
                    <div style={{ paddingTop: '8px' }}>{faq.answer}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
