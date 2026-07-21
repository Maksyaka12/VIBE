import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { CheckCircle2, XCircle, ArrowRight, Loader2, ArrowUpRight } from 'lucide-react';
import './index.css';

const CA = '0xB200000000000000000000ba3068A5B447a81101';
const O1 = 'https://launch.o1.exchange/token/0xb200000000000000000000ba3068a5b447a81101';

const MIN_BALANCE = 2000000; // 2M

const UNLOCKS = [
  {d:'Aug 8, 2026'},{d:'Sep 7, 2026'},{d:'Oct 7, 2026'},{d:'Nov 6, 2026'},
  {d:'Dec 6, 2026'},{d:'Jan 5, 2027'},{d:'Feb 4, 2027'},{d:'Mar 6, 2027'},
  {d:'Apr 5, 2027'},{d:'May 5, 2027'}
];

function getNextUnlockDate() {
  const now = new Date();
  for (let i = 0; i < UNLOCKS.length; i++) {
    const unlockDate = new Date(UNLOCKS[i].d);
    unlockDate.setDate(unlockDate.getDate() + 1); // Flip after the day ends
    if (now < unlockDate) return UNLOCKS[i].d;
  }
  return "All tokens distributed";
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
  
  const nextDate = getNextUnlockDate();

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

  const isEligible = balance >= MIN_BALANCE;

  return (
    <section id="checker" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '60vh' }}>
      <div className="wrap" style={{ maxWidth: 600 }}>
        
        <div className="sec-head" style={{ textAlign: 'center', alignItems: 'center', marginBottom: 40 }}>
          <h2>Check <span className="bl">Eligibility</span></h2>
          <p className="sec-sub" style={{ textAlign: 'center', margin: '0 auto' }}>
            Connect your wallet to see if you qualify for the next $VIBE holder rewards distribution.
          </p>
        </div>

        <div className="checker-card" style={{ background: 'var(--surface)', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          
          {!ready && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', color: 'var(--blue)' }}>
              <Loader2 className="spin" size={32} />
            </div>
          )}

          {ready && !authenticated && (
            <div className="ch-unauth">
              <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px', overflow: 'hidden' }}>
                <img src="/vibe-logo.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="VIBE" />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Wallet not connected</h3>
              <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Please connect your wallet to check your $VIBE balance and eligibility.</p>
              <button onClick={login} className="btn-fill" style={{ width: '100%', justifyContent: 'center' }}>
                Connect Wallet
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--muted)', fontSize: '0.8rem', marginTop: '16px' }}>
                Protected by <span style={{ fontWeight: '700', color: 'var(--ink)' }}>privy</span>
              </div>
            </div>
          )}

          {ready && authenticated && loading && (
            <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Loader2 className="spin" size={32} color="var(--blue)" />
              <p style={{ color: 'var(--muted)' }}>Scanning Base network...</p>
            </div>
          )}

          {ready && authenticated && !loading && balance !== null && (
            <div className="ch-auth">
              {isEligible ? (
                <div className="ch-success" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <img src="/vibe-logo-nobg.png" alt="Eligible VIBE" style={{ width: 120, height: 120, objectFit: 'contain', margin: '-10px 0 -20px 0' }} />
                  <h3 style={{ fontSize: '1.6rem', color: '#10b981', margin: 0 }}>Congratulations! You are eligible!</h3>
                  <p style={{ fontSize: '1.1rem', color: 'var(--ink)' }}>
                    Next $VIBE distribution on <strong>{nextDate}</strong>.
                  </p>
                  <div style={{ background: '#ecfdf5', padding: '16px 24px', borderRadius: '16px', color: '#047857', fontWeight: 600, border: '1px solid #a7f3d0', width: '100%' }}>
                    Your balance: {balance.toLocaleString(undefined, {maximumFractionDigits: 0})} $VIBE
                  </div>
                </div>
              ) : (
                <div className="ch-fail" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <img src="/vibe-sad-logo-nobg.png" alt="Sad VIBE" style={{ width: 120, height: 120, objectFit: 'contain', margin: '-10px 0 -20px 0' }} />
                  <h3 style={{ fontSize: '1.6rem', color: '#ef4444', margin: 0 }}>Not Eligible Yet</h3>
                  <p style={{ fontSize: '1.05rem', color: 'var(--muted)' }}>
                    You need to hold 2M+ $VIBE to become eligible.
                  </p>
                  <div style={{ background: '#fef2f2', padding: '16px 24px', borderRadius: '16px', color: '#b91c1c', fontWeight: 600, border: '1px solid #fecaca', width: '100%', marginBottom: '16px' }}>
                    Your balance: {balance.toLocaleString(undefined, {maximumFractionDigits: 0})} $VIBE
                  </div>
                  <a href={O1} target="_blank" rel="noreferrer" className="btn-fill" style={{ width: '100%', justifyContent: 'center' }}>
                    Buy 2M+ $VIBE to become eligible <ArrowUpRight size={18} />
                  </a>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
                <button onClick={logout} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}>
                  Disconnect Wallet
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
