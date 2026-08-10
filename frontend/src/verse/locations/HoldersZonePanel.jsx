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

export default function HoldersZonePanel({ player }) {
  const [claimedMonth, setClaimedMonth] = useState({});
  const [claiming, setClaiming] = useState(null);

  const isEligible = true; // 100K+ $VIBE holding check
  const vibeBalance = 100000;

  const handleClaim = (m) => {
    setClaiming(m);
    setTimeout(() => {
      setClaiming(null);
      setClaimedMonth({ ...claimedMonth, [m]: true });
    }, 1500);
  };

  return (
    <div style={{ fontFamily: 'var(--vv-pixel)', color: '#fff', fontSize: '9px' }}>
      {/* Eligibility Checker Status Banner */}
      <div style={{
        background: 'rgba(255, 215, 0, 0.12)',
        border: '2px solid #ffd700',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        justify-content: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ color: '#ffd700', fontSize: '9px', marginBottom: '4px' }}>
            👑 ELIGIBILITY CHECKER STATUS
          </div>
          <div style={{ fontSize: '7.5px', color: isEligible ? '#00ff88' : '#ff007f' }}>
            {isEligible ? `QUALIFIED (HOLDING 100,000 $VIBE)` : `NOT ELIGIBLE (NEEDS 100K $VIBE)`}
          </div>
        </div>
        <div style={{ fontSize: '10px', color: '#00f5ff', fontWeight: 900 }}>
          10-MONTH UNLOCKS
        </div>
      </div>

      {/* 10-Month Unlocks Timeline */}
      <div style={{ background: 'rgba(2, 11, 26, 0.8)', border: '1px solid rgba(0, 245, 255, 0.2)', borderRadius: '8px', padding: '12px' }}>
        <div style={{ color: '#aaa', fontSize: '7.5px', marginBottom: '10px' }}>
          MONTHLY REWARDS UNLOCK TIMELINE
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {UNLOCKS.map((u) => {
            const isUnlocked = u.status === 'UNLOCKED';
            const isClaimed = claimedMonth[u.month];

            return (
              <div
                key={u.month}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: isUnlocked ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255,255,255,0.02)',
                  border: isUnlocked ? '1px solid #00ff88' : '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  justify-content: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ color: isUnlocked ? '#00ff88' : '#888', fontSize: '8px', marginBottom: '2px' }}>
                    UNLOCK #{u.month} · {u.d}
                  </div>
                  <div style={{ color: '#ffd700', fontSize: '9px', fontWeight: 900 }}>
                    {u.a} $VIBE POOL
                  </div>
                </div>

                {isUnlocked ? (
                  <button
                    onClick={() => handleClaim(u.month)}
                    disabled={isClaimed || claiming === u.month}
                    style={{
                      fontFamily: 'var(--vv-pixel)',
                      fontSize: '7.5px',
                      background: isClaimed ? '#444' : 'linear-gradient(135deg, #ffd700, #ff6b35)',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 10px',
                      color: isClaimed ? '#aaa' : '#000',
                      cursor: isClaimed ? 'default' : 'pointer'
                    }}
                  >
                    {isClaimed ? 'CLAIMED ✓' : claiming === u.month ? 'CLAIMING...' : 'CLAIM SHARE'}
                  </button>
                ) : (
                  <span style={{ fontSize: '7px', color: '#ff007f', background: 'rgba(255,0,127,0.1)', padding: '3px 6px', borderRadius: '3px' }}>
                    🔒 LOCKED
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
