import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { CheckCircle2, XCircle, ArrowRight, Loader2, ArrowUpRight, Gift, Flame, Clock, Calendar, ShieldCheck, Check, Sparkles, ExternalLink, Lock } from 'lucide-react';
import './index.css';

const CA = '0xb200000000000000000000df24ecb8bf51100a01';
const O1 = 'https://launch.o1.exchange/token/0xb200000000000000000000df24ecb8bf51100a01?chain=8453';
export const VESTING_CONTRACT_ADDRESS = '0x77e04dd8c45725d2b7b3c8eebac7f3f1708fd089';
export const BUILDER_CODE = 'bc_wsbqqe2u';
export const BUILDER_CODE_HEX = '62635f77736271716532750b0080218021802180218021802180218021';

const MIN_BALANCE = 5000000; // 5M
const MONTHLY_POOL = 10000000; // 10M $VIBE per round
const ESTIMATED_ELIGIBLE_SUPPLY = 500000000; // ~500M baseline estimate of circulating eligible supply

const UNLOCK_ROUNDS = [
  { id: 1, name: 'Month 1', unlockDate: 'Aug 26, 2026', pool: '10,000,000 $VIBE' },
  { id: 2, name: 'Month 2', unlockDate: 'Sep 25, 2026', pool: '10,000,000 $VIBE' },
  { id: 3, name: 'Month 3', unlockDate: 'Oct 25, 2026', pool: '10,000,000 $VIBE' },
  { id: 4, name: 'Month 4', unlockDate: 'Nov 24, 2026', pool: '10,000,000 $VIBE' },
  { id: 5, name: 'Month 5', unlockDate: 'Dec 24, 2026', pool: '10,000,000 $VIBE' },
  { id: 6, name: 'Month 6', unlockDate: 'Jan 23, 2027', pool: '10,000,000 $VIBE' },
  { id: 7, name: 'Month 7', unlockDate: 'Feb 22, 2027', pool: '10,000,000 $VIBE' },
  { id: 8, name: 'Month 8', unlockDate: 'Mar 24, 2027', pool: '10,000,000 $VIBE' },
  { id: 9, name: 'Month 9', unlockDate: 'Apr 23, 2027', pool: '10,000,000 $VIBE' },
  { id: 10, name: 'Month 10', unlockDate: 'May 23, 2027', pool: '10,000,000 $VIBE' },
];

function getNextUnlockInfo() {
  const now = new Date();
  for (let i = 0; i < UNLOCK_ROUNDS.length; i++) {
    const unlockDate = new Date(UNLOCK_ROUNDS[i].unlockDate);
    unlockDate.setDate(unlockDate.getDate() + 1); // Full day window
    if (now < unlockDate) {
      return {
        currentRound: UNLOCK_ROUNDS[i],
        roundIndex: i + 1,
        date: UNLOCK_ROUNDS[i].unlockDate
      };
    }
  }
  return { currentRound: null, roundIndex: 10, date: "All tokens distributed" };
}

const erc20Abi = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
];

export default function Checker() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [claimHistory, setClaimHistory] = useState({}); // { 1: { claimed: true, txHash: '0x...', amount: '200,000 $VIBE', date: 'Aug 26, 2026' } }
  
  const nextInfo = getNextUnlockInfo();
  const now = new Date();

  useEffect(() => {
    async function checkBalance() {
      if (authenticated && user?.wallet?.address) {
        setLoading(true);
        try {
          const client = createPublicClient({ chain: base, transport: http() });
          const bal = await client.readContract({
            address: CA,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [user.wallet.address]
          });
          setBalance(Number(formatUnits(bal, 18)));
        } catch (e) {
          console.error("Failed to read balance", e);
          setBalance(0);
        }
        setLoading(false);
      }
    }
    checkBalance();
  }, [authenticated, user]);

  const isEligible = balance !== null && balance >= MIN_BALANCE;

  // Dynamic estimated reward for the upcoming round based on holding weight
  const estimatedReward = isEligible
    ? Math.max(1, Math.round((balance / ESTIMATED_ELIGIBLE_SUPPLY) * MONTHLY_POOL))
    : 0;

  // Helper to evaluate round status
  const getRoundStatus = (round, index) => {
    const roundDate = new Date(round.unlockDate);
    const nextRoundDate = UNLOCK_ROUNDS[index + 1] ? new Date(UNLOCK_ROUNDS[index + 1].unlockDate) : null;
    const history = claimHistory[round.id];

    if (history?.claimed) {
      return { status: 'claimed', label: 'Claimed', note: `${history.amount}`, txHash: history.txHash };
    }

    if (now < roundDate) {
      if (round.id === nextInfo?.currentRound?.id) {
        return { status: 'upcoming', label: 'Upcoming', note: 'Active Dynamic Allocation' };
      }
      return { status: 'scheduled', label: 'Scheduled', note: 'Future Unlock' };
    }

    // If past round date:
    // If before next round unlock -> claim window is OPEN
    if (!nextRoundDate || now < nextRoundDate) {
      return { status: 'claimable', label: 'Claimable', note: '30-Day Window Open' };
    }

    // If next unlock already arrived and wasn't claimed -> EXPIRED & BURNED
    return { status: 'expired', label: 'Expired (Burned 🔥)', note: '30-Day Window Closed' };
  };

  return (
    <section id="checker" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '75vh', padding: '120px 20px 80px 20px' }}>
      <div className="wrap" style={{ maxWidth: 840, width: '100%' }}>
        
        <div className="sec-head" style={{ textAlign: 'center', alignItems: 'center', marginBottom: 36 }}>
          <h2>Holder <span className="bl">Claim &amp; Rewards</span> Panel.</h2>
          <p className="sec-sub" style={{ textAlign: 'center', margin: '0 auto' }}>
            Check your dynamic allocation, claim monthly vested $VIBE rewards, and track 10-month unlock rounds.
          </p>
        </div>

        <div className="checker-card" style={{ background: '#ffffff', padding: '36px 30px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', border: '1px solid var(--borderf)' }}>
          
          {!ready && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', color: 'var(--blue)' }}>
              <Loader2 className="spin" size={36} />
            </div>
          )}

          {ready && !authenticated && (
            <div className="ch-unauth" style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0, 82, 255, 0.15)' }}>
                <img src="/new-logo-vibe.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="VIBE" />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '8px', color: 'var(--ink)' }}>Connect Your Wallet</h3>
              <p style={{ color: 'var(--muted)', marginBottom: '28px', maxWidth: 440, margin: '0 auto 24px auto', fontSize: '0.95rem' }}>
                Connect your Base wallet to verify your 5,000,000+ $VIBE holding eligibility and access the monthly claim portal.
              </p>
              <button onClick={login} className="btn-fill" style={{ width: '100%', maxWidth: 320, margin: '0 auto', justifyContent: 'center', padding: '14px 28px', fontSize: '1rem' }}>
                Connect Wallet
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--muted)', fontSize: '0.82rem', marginTop: '20px' }}>
                <ShieldCheck size={16} color="var(--blue)" /> Secured by <span style={{ fontWeight: '700', color: 'var(--ink)' }}>Privy</span> on Base B20
              </div>
            </div>
          )}

          {ready && authenticated && loading && (
            <div style={{ padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Loader2 className="spin" size={36} color="var(--blue)" />
              <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Scanning Base network for holding balance...</p>
            </div>
          )}

          {ready && authenticated && !loading && balance !== null && (
            <div className="ch-auth">
              {isEligible ? (
                <div className="ch-success" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Top Congratulations Card */}
                  <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)', border: '1px solid #a7f3d0', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img src="/vibe-logo-nobg.png" alt="Eligible VIBE" style={{ width: 68, height: 68, objectFit: 'contain' }} />
                      <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#10b981', color: '#fff', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', padding: '3px 10px', borderRadius: '99px', letterSpacing: '0.5px', marginBottom: '6px' }}>
                          <Check size={12} strokeWidth={3} /> Qualified Holder
                        </div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#065f46', margin: 0 }}>
                          Eligible for $VIBE Holder Rewards
                        </h3>
                        <p style={{ margin: '4px 0 0 0', color: '#047857', fontSize: '0.9rem', fontWeight: 500 }}>
                          Holding balance verified: <strong>{balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} $VIBE</strong> (5M+ threshold met).
                        </p>
                      </div>
                    </div>

                    <button onClick={logout} style={{ background: 'rgba(6, 95, 70, 0.08)', border: '1px solid rgba(6, 95, 70, 0.2)', padding: '6px 14px', borderRadius: '99px', color: '#065f46', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                      Disconnect
                    </button>
                  </div>

                  {/* Dynamic Predicted Allocation for Next Unlock */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.5px' }}>
                          Next Snapshot · {nextInfo.date}
                        </span>
                        <h4 style={{ margin: '2px 0 0 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--ink)' }}>
                          Estimated Allocation ({nextInfo.currentRound?.name || 'Month 1'})
                        </h4>
                      </div>
                      <span style={{ background: 'rgba(0, 82, 255, 0.1)', color: 'var(--blue)', padding: '6px 14px', borderRadius: '99px', fontWeight: 800, fontSize: '0.82rem' }}>
                        10M $VIBE Monthly Pool
                      </span>
                    </div>

                    {/* Stat Tiles in 3 columns */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '12px 16px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 800 }}>Your Balance</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--ink)', marginTop: '2px' }}>
                          {balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} $VIBE
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid rgba(0, 82, 255, 0.25)', borderRadius: '14px', padding: '12px 16px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--blue)', textTransform: 'uppercase', fontWeight: 900 }}>Estimated Reward (Current)</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--blue)', marginTop: '2px' }}>
                          ~{estimatedReward.toLocaleString()} $VIBE
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '12px 16px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 800 }}>Snapshot Status</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>
                          Aug 26 (00:00 UTC)
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', fontSize: '0.8rem', color: 'var(--muted)', lineHeight: '1.4' }}>
                      <Sparkles size={16} color="var(--blue)" style={{ flexShrink: 0 }} />
                      <span>
                        <strong>Dynamic calculation:</strong> Exact individual allocation is proportionally finalized during the official snapshot at 00:00 UTC on the day of unlock based on all 5M+ holding wallets.
                      </span>
                    </div>

                    {/* Claim Action Box */}
                    <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--ink)' }}>
                          Claim {nextInfo.currentRound?.name || 'Month 1'} Reward
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '2px' }}>
                          Claim window stays open for 30 days until next unlock. Unclaimed tokens are burned.
                        </div>
                      </div>

                      <button
                        disabled={true}
                        style={{
                          background: '#e2e8f0',
                          color: '#64748b',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '12px',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'not-allowed',
                          boxShadow: 'none'
                        }}
                      >
                        <Lock size={16} /> Claim Opens Aug 26, 2026
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="ch-fail" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px 0' }}>
                  <img src="/vibe-sad-logo-nobg.png" alt="Sad VIBE" style={{ width: 110, height: 110, objectFit: 'contain' }} />
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ef4444', margin: 0 }}>Not Eligible Yet</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginTop: '6px', maxWidth: 420 }}>
                      You need to hold at least <strong>5,000,000 $VIBE</strong> in your wallet to qualify for the 100M holder rewards vesting.
                    </p>
                  </div>

                  <div style={{ background: '#fef2f2', padding: '16px 24px', borderRadius: '16px', color: '#b91c1c', fontWeight: 700, border: '1px solid #fecaca', width: '100%', maxWidth: 420, textAlign: 'center', fontSize: '0.95rem' }}>
                    Your current balance: <strong>{balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} $VIBE</strong>
                    <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', fontWeight: 500 }}>
                      Need {(5000000 - balance).toLocaleString(undefined, { maximumFractionDigits: 0 })} more $VIBE
                    </div>
                  </div>

                  <a href={O1} target="_blank" rel="noreferrer" className="btn-fill" style={{ width: '100%', maxWidth: 420, justifyContent: 'center', padding: '14px', fontSize: '0.95rem' }}>
                    Buy $VIBE on o1 Exchange <ArrowUpRight size={18} />
                  </a>

                  <button onClick={logout} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem', marginTop: '12px' }}>
                    Disconnect Wallet
                  </button>
                </div>
              )}

              {/* 10-Round Vesting & Claim Timeline Table */}
              <div style={{ marginTop: '36px', borderTop: '1px solid var(--borderf)', paddingTop: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--ink)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={18} color="var(--blue)" /> 10-Month Vesting &amp; Claim Rounds
                    </h4>
                    <p style={{ margin: '2px 0 0 0', color: 'var(--muted)', fontSize: '0.82rem', fontWeight: 500 }}>
                      100M Total $VIBE · 10M per Round · 30-Day Claim Window · Unclaimed Permanently Burned 🔥
                    </p>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--blue)', fontWeight: 800 }}>
                    10 Rounds Schedule
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {UNLOCK_ROUNDS.map((r, idx) => {
                    const st = getRoundStatus(r, idx);
                    return (
                      <div
                        key={r.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          background: r.id === nextInfo?.currentRound?.id ? 'rgba(0, 82, 255, 0.04)' : '#f8fafc',
                          borderRadius: '14px',
                          border: r.id === nextInfo?.currentRound?.id ? '1px solid rgba(0, 82, 255, 0.3)' : '1px solid #e2e8f0',
                          flexWrap: 'wrap',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: 900, color: r.id === nextInfo?.currentRound?.id ? 'var(--blue)' : 'var(--ink)', fontSize: '0.92rem', minWidth: '70px' }}>
                            {r.name}
                          </span>
                          <span style={{ color: 'var(--ink)', fontWeight: 600, fontSize: '0.88rem' }}>
                            {r.unlockDate}
                          </span>
                          <span style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 500 }}>
                            ({r.pool})
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {st.txHash && (
                            <a
                              href={`https://basescan.org/tx/${st.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '0.78rem', color: 'var(--blue)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            >
                              Tx <ExternalLink size={12} />
                            </a>
                          )}

                          <span
                            style={{
                              padding: '4px 12px',
                              borderRadius: '99px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              background:
                                st.status === 'claimed'
                                  ? 'rgba(16, 185, 129, 0.12)'
                                  : st.status === 'claimable'
                                  ? 'rgba(0, 82, 255, 0.12)'
                                  : st.status === 'expired'
                                  ? 'rgba(239, 68, 68, 0.12)'
                                  : '#f1f5f9',
                              color:
                                st.status === 'claimed'
                                  ? '#10b981'
                                  : st.status === 'claimable'
                                  ? 'var(--blue)'
                                  : st.status === 'expired'
                                  ? '#ef4444'
                                  : 'var(--muted)',
                              border:
                                st.status === 'claimed'
                                  ? '1px solid rgba(16, 185, 129, 0.3)'
                                  : st.status === 'claimable'
                                  ? '1px solid rgba(0, 82, 255, 0.3)'
                                  : st.status === 'expired'
                                  ? '1px solid rgba(239, 68, 68, 0.3)'
                                  : '1px solid #e2e8f0',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            {st.status === 'claimed' && <Check size={12} strokeWidth={3} />}
                            {st.status === 'claimable' && <Gift size={12} />}
                            {st.status === 'expired' && <Flame size={12} />}
                            {st.status === 'upcoming' && <Clock size={12} />}
                            {st.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Onchain Contract & Builder Attribution Footer */}
              <div style={{ marginTop: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={20} color="var(--blue)" />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--ink)' }}>
                      Vesting Distributor Contract: <a href={`https://basescan.org/address/${VESTING_CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', textDecoration: 'underline' }}>{VESTING_CONTRACT_ADDRESS.slice(0, 6)}...{VESTING_CONTRACT_ADDRESS.slice(-4)}</a>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '2px' }}>
                      ERC-8021 Base Builder Code: <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{BUILDER_CODE}</span> (Attribution Active)
                    </div>
                  </div>
                </div>

                <a
                  href={`https://basescan.org/address/${VESTING_CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: 'var(--blue)',
                    textDecoration: 'none'
                  }}
                >
                  View on BaseScan <ArrowUpRight size={14} strokeWidth={2.5} />
                </a>
              </div>

            </div>
          )}

        </div>
      </div>
    </section>
  );
}
