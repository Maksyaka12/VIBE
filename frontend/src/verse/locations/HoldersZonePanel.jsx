import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useUserBalances } from '../hooks/useUserBalances';

const UNLOCKS = [
  { month: 1, d: 'Aug 26, 2026', a: '10M $VIBE POOL', status: 'UNLOCKED' },
  { month: 2, d: 'Sep 25, 2026', a: '10M $VIBE POOL', status: 'LOCKED' },
  { month: 3, d: 'Oct 25, 2026', a: '10M $VIBE POOL', status: 'LOCKED' },
  { month: 4, d: 'Nov 24, 2026', a: '10M $VIBE POOL', status: 'LOCKED' },
  { month: 5, d: 'Dec 24, 2026', a: '10M $VIBE POOL', status: 'LOCKED' },
  { month: 6, d: 'Jan 23, 2027', a: '10M $VIBE POOL', status: 'LOCKED' },
  { month: 7, d: 'Feb 22, 2027', a: '10M $VIBE POOL', status: 'LOCKED' },
  { month: 8, d: 'Mar 24, 2027', a: '10M $VIBE POOL', status: 'LOCKED' },
  { month: 9, d: 'Apr 23, 2027', a: '10M $VIBE POOL', status: 'LOCKED' },
  { month: 10, d: 'May 23, 2027', a: '10M $VIBE POOL', status: 'LOCKED' },
];

const RULES = [
  { icon: '🐶', title: '$VIBE Holders', desc: 'Hold 5M+ $VIBE to qualify' },
  { icon: '📈', title: 'Allocation Size', desc: 'The more you hold, the larger your allocation' },
  { icon: '🛡️', title: 'Max Allocation Cap', desc: 'Set at 500K max to prevent whale dominance & ensure fair distribution' },
  { icon: '🧮', title: 'Allocation Calculation', desc: 'Proportionally calculated based on holding balance' },
  { icon: '⏰', title: 'Snapshot Schedule', desc: 'Balance snapshot at 00:00 UTC on the day of unlock' },
  { icon: '📅', title: 'Claim Window', desc: 'Stays open for 30 days until the next unlock' },
  { icon: '🔄', title: 'Unclaimed Tokens', desc: 'Returned to the community reserved pool' },
];

export default function HoldersZonePanel({ player, onNavigate }) {
  const { user } = usePrivy();
  const balances = useUserBalances(user?.wallet?.address);

  const [claimedMonth, setClaimedMonth] = useState({});
  const [claiming, setClaiming] = useState(null);

  // Real on-chain balance & 5M holding threshold check
  const vibeBalance = parseFloat(balances.vibe || '0');
  const minRequired = 5000000; // 5M+ $VIBE to qualify
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
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: '#fff', fontSize: '12px' }}>
      {/* Top Banner */}
      <div className="vv-holders-top-banner" style={{
        background: 'rgba(255, 215, 0, 0.12)',
        border: '1.5px solid rgba(255, 215, 0, 0.5)',
        borderRadius: '10px',
        padding: '14px 22px',
        marginBottom: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 16px rgba(255, 215, 0, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>👑</span>
          <div style={{ fontFamily: 'var(--vv-pixel)', color: '#ffd700', fontSize: '13px', fontWeight: 900, letterSpacing: '0.5px' }}>
            HOLDER REWARDS · 100M $VIBE
          </div>
        </div>
        <div style={{ fontSize: '11px', color: '#00ff88', fontWeight: 900 }}>
          QUALIFY THRESHOLD: <strong style={{ color: '#fff' }}>5M+ $VIBE</strong>
        </div>
      </div>

      {/* Two-Column Grid (Left: Balance + Rules, Right: Unlock Schedule equal height) */}
      <div className="vv-holders-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '20px', alignItems: 'stretch' }}>
        {/* LEFT COLUMN */}
        <div className="vv-holders-left-col" style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '520px' }}>
          {/* Wallet Balance & Eligibility Card */}
          <div style={{
            background: 'rgba(4, 20, 48, 0.6)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: isEligible ? '2px solid #00ff88' : '2px solid #ff4466',
            borderRadius: '12px',
            padding: '18px',
            boxShadow: isEligible ? '0 0 20px rgba(0,255,136,0.2)' : '0 0 20px rgba(255,68,102,0.2)',
            flexShrink: 0
          }}>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '6px', fontWeight: 700 }}>
              YOUR WALLET BALANCE
            </div>
            <div style={{ fontSize: '22px', color: '#ffd700', fontWeight: 900, marginBottom: '14px' }}>
              {balances.loading ? 'Loading...' : balances.vibeFormatted} <span style={{ fontSize: '13px', color: '#00f5ff' }}>$VIBE</span>
            </div>

            {/* Clean Status Badge */}
            <div style={{
              background: isEligible ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 68, 102, 0.15)',
              border: isEligible ? '1.5px solid #00ff88' : '1.5px solid #ff4466',
              borderRadius: '8px',
              padding: '12px 16px',
              textAlign: 'center',
              boxShadow: isEligible ? '0 0 14px rgba(0,255,136,0.3)' : 'none'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 900,
                color: isEligible ? '#00ff88' : '#ff4466',
                letterSpacing: '0.5px'
              }}>
                {isEligible ? 'YOU ARE ELIGIBLE ✓' : 'YOU ARE NOT ELIGIBLE ✕'}
              </div>
            </div>

            {!isEligible && (
              <button
                onClick={handleBuyVibe}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  fontFamily: "'Inter', -apple-system, sans-serif",
                  fontSize: '12px',
                  background: 'linear-gradient(135deg, #ff007f, #b44dff)',
                  border: '1.5px solid #fff',
                  borderRadius: '10px',
                  padding: '12px',
                  color: '#fff',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(255, 0, 127, 0.4)',
                  letterSpacing: '0.5px'
                }}
              >
                BUY $VIBE ON O1 EXCHANGE 🚀
              </button>
            )}
          </div>

          {/* Website Rules List with Retro Pixel Custom Scrollbar */}
          <div style={{
            background: 'rgba(2, 11, 26, 0.45)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '1.5px solid rgba(0, 245, 255, 0.25)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden'
          }}>
            <div style={{ color: '#ffd700', fontSize: '12px', fontWeight: 800, marginBottom: '10px', flexShrink: 0 }}>
              📋 ELIGIBILITY & DISTRIBUTION RULES
            </div>
            <div
              className="vv-custom-scroll"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                flex: 1,
                overflowY: 'auto',
                paddingRight: '6px'
              }}
            >
              {RULES.map((r) => (
                <div
                  key={r.title}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '10px 12px'
                  }}
                >
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{r.icon}</span>
                  <div>
                    <div style={{ color: '#00f5ff', fontSize: '12px', fontWeight: 800, marginBottom: '2px' }}>
                      {r.title}
                    </div>
                    <div style={{ color: '#d0dbe5', fontSize: '11px', lineHeight: 1.45, wordBreak: 'break-word' }}>
                      {r.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Unlock Schedule (Exact Height Matching Left Column) */}
        <div style={{
          background: 'rgba(2, 11, 26, 0.45)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: '1.5px solid rgba(0, 245, 255, 0.3)',
          borderRadius: '12px',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          height: '520px'
        }}>
          <div style={{
            color: '#ffd700',
            fontSize: '11px',
            fontWeight: 900,
            marginBottom: '14px',
            letterSpacing: '0.5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <span>UNLOCK SCHEDULE (10 MONTHS)</span>
            <span style={{ color: '#00ff88', fontSize: '10px' }}>1/10 UNLOCKED</span>
          </div>

          {/* Vertical Stack List with Retro Pixel Custom Scrollbar */}
          <div
            className="vv-custom-scroll"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              flex: 1,
              overflowY: 'auto',
              paddingRight: '6px'
            }}
          >
            {UNLOCKS.map((u) => {
              const isUnlocked = u.status === 'UNLOCKED';
              const isClaimed = claimedMonth[u.month];

              return (
                <div
                  key={u.month}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '8px',
                    background: isUnlocked ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255,255,255,0.04)',
                    border: isUnlocked ? '1.5px solid #00ff88' : '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ color: isUnlocked ? '#00ff88' : '#aaa', fontSize: '10px', fontWeight: 900 }}>
                      UNLOCK #{u.month} · {u.d}
                    </div>
                    <div style={{ color: '#ffd700', fontSize: '11px', fontWeight: 900 }}>
                      {u.a}
                    </div>
                  </div>

                  {isUnlocked ? (
                    <button
                      onClick={() => handleClaim(u.month)}
                      disabled={isClaimed || claiming === u.month || !isEligible}
                      style={{
                        fontFamily: 'var(--vv-pixel)',
                        fontSize: '10px',
                        background: isClaimed ? '#444' : 'linear-gradient(135deg, #ffd700, #ff6b35)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 18px',
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
                      fontSize: '9px',
                      color: '#ff007f',
                      background: 'rgba(255,0,127,0.15)',
                      padding: '5px 12px',
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
