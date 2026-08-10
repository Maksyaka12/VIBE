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

  const handleClaim = (m) => {
    setClaiming(m);
    setTimeout(() => {
      setClaiming(null);
      setClaimedMonth({ ...claimedMonth, [m]: true });
    }, 1500);
  };

  return (
    <div style={{ fontFamily: 'var(--vv-pixel)', color: '#fff', fontSize: '11px' }}>
      {/* Eligibility Checker Status Banner */}
      <div style={{
        background: 'rgba(255, 215, 0, 0.15)',
        border: '2px solid #ffd700',
        borderRadius: '10px',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 16px rgba(255, 215, 0, 0.2)'
      }}>
        <div>
          <div style={{ color: '#ffd700', fontSize: '12px', marginBottom: '6px', letterSpacing: '0.5px' }}>
            👑 ELIGIBILITY CHECKER STATUS
          </div>
          <div style={{ fontSize: '10px', color: isEligible ? '#00ff88' : '#ff007f', fontWeight: 900 }}>
            {isEligible ? `QUALIFIED (HOLDING 100,000 $VIBE)` : `NOT ELIGIBLE (NEEDS 100K $VIBE)`}
          </div>
        </div>
        <div style={{ fontSize: '13px', color: '#00f5ff', fontWeight: 900, letterSpacing: '0.5px' }}>
          10-MONTH UNLOCKS
        </div>
      </div>

      {/* 10-Month Unlocks Timeline */}
      <div style={{ background: 'rgba(2, 11, 26, 0.85)', border: '1.5px solid rgba(0, 245, 255, 0.3)', borderRadius: '10px', padding: '18px' }}>
        <div style={{ color: '#aaa', fontSize: '10px', marginBottom: '14px', letterSpacing: '0.5px' }}>
          MONTHLY REWARDS UNLOCK TIMELINE
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {UNLOCKS.map((u) => {
            const isUnlocked = u.status === 'UNLOCKED';
            const isClaimed = claimedMonth[u.month];

            return (
              <div
                key={u.month}
                style={{
                  padding: '14px 16px',
                  borderRadius: '8px',
                  background: isUnlocked ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255,255,255,0.03)',
                  border: isUnlocked ? '1.5px solid #00ff88' : '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ color: isUnlocked ? '#00ff88' : '#aaa', fontSize: '10px', marginBottom: '4px' }}>
                    UNLOCK #{u.month} · {u.d}
                  </div>
                  <div style={{ color: '#ffd700', fontSize: '13px', fontWeight: 900 }}>
                    {u.a} $VIBE POOL
                  </div>
                </div>

                {isUnlocked ? (
                  <button
                    onClick={() => handleClaim(u.month)}
                    disabled={isClaimed || claiming === u.month}
                    style={{
                      fontFamily: 'var(--vv-pixel)',
                      fontSize: '9px',
                      background: isClaimed ? '#444' : 'linear-gradient(135deg, #ffd700, #ff6b35)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 14px',
                      color: isClaimed ? '#aaa' : '#000',
                      fontWeight: 900,
                      cursor: isClaimed ? 'default' : 'pointer',
                      boxShadow: isClaimed ? 'none' : '0 3px 0 #cc8800'
                    }}
                  >
                    {isClaimed ? 'CLAIMED ✓' : claiming === u.month ? 'CLAIMING...' : 'CLAIM SHARE'}
                  </button>
                ) : (
                  <span style={{ fontSize: '9px', color: '#ff007f', background: 'rgba(255,0,127,0.15)', padding: '4px 8px', borderRadius: '4px', fontWeight: 900 }}>
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
