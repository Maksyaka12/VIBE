import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useUserBalances } from '../hooks/useUserBalances';

export default function VibeBankPanel({ player }) {
  const { user } = usePrivy();
  const balances = useUserBalances(user?.wallet?.address);

  const [stakeAmount, setStakeAmount] = useState('');
  const [activeStaked, setActiveStaked] = useState(0);
  const [staking, setStaking] = useState(false);

  const poolTotal = 50000000;
  const whaleCapPercent = '5.0%'; // Max allocation cap per wallet
  const maxWhaleStake = 2500000; // 5% of 50M

  const handleStake = () => {
    if (!stakeAmount || Number(stakeAmount) <= 0) return;
    setStaking(true);
    setTimeout(() => {
      setActiveStaked(prev => prev + Number(stakeAmount));
      setStakeAmount('');
      setStaking(false);
    }, 1200);
  };

  return (
    <div style={{ fontFamily: 'var(--vv-pixel)', color: '#fff', fontSize: '11px' }}>
      {/* Whale Cap Protection Banner */}
      <div className="vv-bank-top-banner" style={{
        background: 'rgba(0, 245, 255, 0.15)',
        border: '1.5px solid rgba(0, 245, 255, 0.5)',
        borderRadius: '10px',
        padding: '14px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 4px 16px rgba(0, 245, 255, 0.2)'
      }}>
        <span style={{ fontSize: '24px' }}>🛡️</span>
        <div style={{ fontSize: '10px', color: '#00f5ff', lineHeight: 1.6 }}>
          <strong style={{ color: '#fff' }}>WHALE THRESHOLD CAP ({whaleCapPercent}):</strong> Maximum reward allocation is capped at {maxWhaleStake.toLocaleString()} $VIBE per wallet so large stakers cannot drain the community pool!
        </div>
      </div>

      {/* Staking Stats Grid */}
      <div className="vv-bank-stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '14px',
        marginBottom: '20px'
      }}>
        <div style={{ background: 'rgba(2, 11, 26, 0.85)', border: '1.5px solid rgba(0, 245, 255, 0.3)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '9px', marginBottom: '6px', letterSpacing: '0.5px' }}>TOTAL STAKED</div>
          <div style={{ color: '#00f5ff', fontSize: '14px', fontWeight: 900 }}>50.0M $VIBE</div>
        </div>

        <div style={{ background: 'rgba(2, 11, 26, 0.85)', border: '1.5px solid rgba(0, 255, 136, 0.3)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '9px', marginBottom: '6px', letterSpacing: '0.5px' }}>YOUR STAKE</div>
          <div style={{ color: '#00ff88', fontSize: '14px', fontWeight: 900 }}>{activeStaked.toLocaleString()} $VIBE</div>
        </div>

        <div style={{ background: 'rgba(2, 11, 26, 0.85)', border: '1.5px solid rgba(255, 215, 0, 0.3)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '9px', marginBottom: '6px', letterSpacing: '0.5px' }}>YOUR POOL SHARE</div>
          <div style={{ color: '#ffd700', fontSize: '14px', fontWeight: 900 }}>
            {((activeStaked / poolTotal) * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Stake Input Card */}
      <div style={{
        background: 'rgba(4, 20, 48, 0.95)',
        border: '2px solid #00f5ff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.6)'
      }}>
        <div style={{ fontSize: '12px', color: '#ffd700', marginBottom: '14px', letterSpacing: '0.5px' }}>
          DEPOSIT $VIBE TO STAKING VAULT
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <input
            type="number"
            placeholder="Amount $VIBE..."
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            style={{
              flex: 1,
              fontFamily: 'var(--vv-pixel)',
              fontSize: '11px',
              background: '#020b1a',
              border: '1.5px solid rgba(0,245,255,0.4)',
              color: '#fff',
              borderRadius: '6px',
              padding: '12px 14px'
            }}
          />
          <button
            onClick={() => setStakeAmount(balances.vibe || '0')}
            style={{
              fontFamily: 'var(--vv-pixel)',
              fontSize: '10px',
              background: 'rgba(0,245,255,0.2)',
              border: '1.5px solid #00f5ff',
              color: '#00f5ff',
              borderRadius: '6px',
              padding: '12px 16px',
              cursor: 'pointer',
              fontWeight: 900
            }}
          >
            MAX
          </button>
          <button
            onClick={handleStake}
            disabled={staking || !stakeAmount || Number(stakeAmount) <= 0}
            style={{
              fontFamily: 'var(--vv-pixel)',
              fontSize: '11px',
              background: 'linear-gradient(135deg, #00ff88, #0099aa)',
              border: '2px solid #fff',
              color: '#000',
              fontWeight: 900,
              borderRadius: '6px',
              padding: '12px 22px',
              cursor: 'pointer',
              boxShadow: '0 3px 0 #006644'
            }}
          >
            {staking ? 'STAKING...' : 'STAKE'}
          </button>
        </div>

        <div style={{ fontSize: '9px', color: '#aaa' }}>
          AVAILABLE BALANCE: <span style={{ color: '#00f5ff', fontWeight: 900 }}>{balances.loading ? 'Loading...' : `${balances.vibeFormatted} $VIBE`}</span>
        </div>
      </div>
    </div>
  );
}
