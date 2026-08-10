import React, { useState } from 'react';

const UNLOCKS = [
  { month: 1, d: 'Aug 26, 2026', a: '10M', status: 'UNLOCKED' },
  { month: 2, d: 'Sep 25, 2026', a: '20M', status: 'LOCKED' },
  { month: 3, d: 'Oct 25, 2026', a: '30M', status: 'LOCKED' },
  { month: 4, d: 'Nov 24, 2026', a: '40M', status: 'LOCKED' },
  { month: 5, d: 'Dec 24, 2026', a: '50M', status: 'LOCKED' },
  { month: 6, d: 'Jan 23, 2027', a: '60M', status: 'LOCKED' },
  { month: 7, d: 'Feb 22, 2027', a: '70M', status: 'LOCKED' },
  { month: 8, d: 'Mar 24, 2027', a: '80M', status: 'LOCKED' },
  { month: 9, d: 'Apr 23, 2027', a: '90M', status: 'LOCKED' },
  { month: 10, d: 'May 23, 2027', a: '100M', status: 'LOCKED' },
];

export default function HoldersZonePanel({ player, onNavigate }) {
  const [claimedMonth, setClaimedMonth] = useState({});
  const [claiming, setClaiming] = useState(null);

  // Holding balance & eligibility state
  const vibeBalance = 1250000; // Simulated $VIBE balance
  const minRequired = 100000;
  const isEligible = vibeBalance >= minRequired;

  const handleClaim = (m) => {
    setClaiming(m);
    setTimeout(() => {
      setClaiming(null);
      setClaimedMonth({ ...claimedMonth, [m]: true });
    }, 1500);
  };

  const handleBuyVibe = () => {
    if (onNavigate) {
      onNavigate('defi');
    } else {
      window.open('https://launch.o1.exchange', '_blank');
    }
  };

  return (
    <div style={{ fontFamily: 'var(--vv-pixel)', color: '#fff', fontSize: '11px' }}>
      {/* Top Banner */}
      <div style={{
        background: 'rgba(255, 215, 0, 0.12)',
        border: '1.5px solid rgba(255, 215, 0, 0.5)',
        borderRadius: '10px',
        padding: '12px 18px',
        marginBottom: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 16px rgba(255, 215, 0, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>👑</span>
          <div>
            <div style={{ color: '#ffd700', fontSize: '11px', fontWeight: 900, letterSpacing: '0.5px' }}>
              VIBE HOLDERS VAULT
            </div>
            <div style={{ fontSize: '9px', color: '#aaa' }}>
              Exclusive 10-Month Unlock Rewards Program
            </div>
          </div>
        </div>
        <div style={{ fontSize: '10px', color: '#00f5ff', fontWeight: 900 }}>
          MIN HOLDING: <strong style={{ color: '#fff' }}>100,000 $VIBE</strong>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '18px' }}>
        {/* LEFT COLUMN: Eligibility Checker & Balance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Eligibility Card */}
          <div style={{
            background: 'rgba(4, 20, 48, 0.95)',
            border: isEligible ? '2px solid #00ff88' : '2px solid #ff4466',
            borderRadius: '12px',
            padding: '18px',
            boxShadow: isEligible ? '0 0 20px rgba(0,255,136,0.2)' : '0 0 20px rgba(255,68,102,0.2)'
          }}>
            <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '6px' }}>
              WALLET BALANCE
            </div>
            <div style={{ fontSize: '18px', color: '#ffd700', fontWeight: 900, marginBottom: '14px' }}>
              {vibeBalance.toLocaleString()} <span style={{ fontSize: '12px', color: '#00f5ff' }}>$VIBE</span>
            </div>

            {/* Status Badge */}
            <div style={{
              background: isEligible ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 68, 102, 0.15)',
              border: isEligible ? '1.5px solid #00ff88' : '1.5px solid #ff4466',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '14px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 900,
                color: isEligible ? '#00ff88' : '#ff4466',
                letterSpacing: '0.5px'
              }}>
                {isEligible ? 'YOU ARE ELIGIBLE ✓' : 'YOU ARE NOT ELIGIBLE ✕'}
              </div>
            </div>

            {/* Dynamic Status Action / Information */}
            {isEligible ? (
              <div style={{
                fontSize: '9px',
                color: '#00f5ff',
                lineHeight: 1.6,
                background: 'rgba(0, 245, 255, 0.08)',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(0, 245, 255, 0.2)'
              }}>
                ℹ️ <strong>ALLOCATION INFO:</strong> Allocation & share weight will be revealed during token unlock distribution.
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '9px', color: '#aaa', marginBottom: '12px', lineHeight: 1.5 }}>
                  You need at least 100,000 $VIBE tokens to qualify for monthly rewards unlocks.
                </div>
                <button
                  onClick={handleBuyVibe}
                  style={{
                    width: '100%',
                    fontFamily: 'var(--vv-pixel)',
                    fontSize: '10px',
                    background: 'linear-gradient(135deg, #ff007f, #b44dff)',
                    border: '2px solid #fff',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#fff',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 4px 0 #660044, 0 0 16px rgba(255, 0, 127, 0.5)'
                  }}
                >
                  BUY $VIBE ON O1 EXCHANGE 🚀
                </button>
              </div>
            )}
          </div>

          {/* Perks Summary Card */}
          <div style={{
            background: 'rgba(2, 11, 26, 0.85)',
            border: '1.5px solid rgba(0, 245, 255, 0.25)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ color: '#ffd700', fontSize: '10px', fontWeight: 900, marginBottom: '10px' }}>
              👑 HOLDER REWARDS BENEFITS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '9px', color: '#aaa' }}>
              <div>• Access to 10-Month Pool Distributions (470M Total $VIBE)</div>
              <div>• VIP Multipliers in Vibe Bank & o1 Staking Vaults</div>
              <div>• Exclusive Crown Badge in Vibe Verse World</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 10 Unlocks Stacked Vertically */}
        <div style={{
          background: 'rgba(2, 11, 26, 0.85)',
          border: '1.5px solid rgba(0, 245, 255, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            color: '#ffd700',
            fontSize: '10px',
            fontWeight: 900,
            marginBottom: '12px',
            letterSpacing: '0.5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>10-MONTH UNLOCKS TIMELINE</span>
            <span style={{ color: '#00ff88', fontSize: '9px' }}>1/10 UNLOCKED</span>
          </div>

          {/* Vertical Stack List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '380px',
            overflowY: 'auto',
            paddingRight: '4px'
          }}>
            {UNLOCKS.map((u) => {
              const isUnlocked = u.status === 'UNLOCKED';
              const isClaimed = claimedMonth[u.month];

              return (
                <div
                  key={u.month}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: isUnlocked ? 'rgba(0, 255, 136, 0.12)' : 'rgba(255,255,255,0.03)',
                    border: isUnlocked ? '1.5px solid #00ff88' : '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ color: isUnlocked ? '#00ff88' : '#aaa', fontSize: '9px', marginBottom: '2px' }}>
                      UNLOCK #{u.month} · {u.d}
                    </div>
                    <div style={{ color: '#ffd700', fontSize: '11px', fontWeight: 900 }}>
                      {u.a} $VIBE POOL
                    </div>
                  </div>

                  {isUnlocked ? (
                    <button
                      onClick={() => handleClaim(u.month)}
                      disabled={isClaimed || claiming === u.month || !isEligible}
                      style={{
                        fontFamily: 'var(--vv-pixel)',
                        fontSize: '9px',
                        background: isClaimed ? '#444' : 'linear-gradient(135deg, #ffd700, #ff6b35)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        color: isClaimed ? '#aaa' : '#000',
                        fontWeight: 900,
                        cursor: isClaimed ? 'default' : 'pointer',
                        boxShadow: isClaimed ? 'none' : '0 2px 0 #cc8800'
                      }}
                    >
                      {isClaimed ? 'CLAIMED ✓' : claiming === u.month ? 'CLAIMING...' : 'CLAIM'}
                    </button>
                  ) : (
                    <span style={{
                      fontSize: '8px',
                      color: '#ff007f',
                      background: 'rgba(255,0,127,0.15)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: 900
                    }}>
                      🔒 LOCKED
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
