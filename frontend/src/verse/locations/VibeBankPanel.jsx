import React, { useState } from 'react';

export default function VibeBankPanel({ player }) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [activeStaked, setActiveStaked] = useState(500000);
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
    <div style={{ fontFamily: 'var(--vv-pixel)', color: '#fff', fontSize: '9px' }}>
      {/* Whale Cap Protection Banner */}
      <div style={{
        background: 'rgba(0, 245, 255, 0.12)',
        border: '1px solid rgba(0, 245, 255, 0.4)',
        borderRadius: '8px',
        padding: '10px 14px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ fontSize: '16px' }}>🛡️</span>
        <div style={{ fontSize: '7.5px', color: '#00f5ff', lineHeight: 1.5 }}>
          <strong>WHALE THRESHOLD CAP ({whaleCapPercent}):</strong> Maximum reward allocation is capped at {maxWhaleStake.toLocaleString()} $VIBE per wallet so large stakers cannot drain the community pool!
        </div>
      </div>

      {/* Staking Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '10px',
        marginBottom: '16px'
      }}>
        <div style={{ background: 'rgba(2, 11, 26, 0.8)', border: '1px solid rgba(0, 245, 255, 0.2)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '7px', marginBottom: '4px' }}>TOTAL STAKED</div>
          <div style={{ color: '#00f5ff', fontSize: '10px', fontWeight: 900 }}>50.0M $VIBE</div>
        </div>

        <div style={{ background: 'rgba(2, 11, 26, 0.8)', border: '1px solid rgba(0, 255, 136, 0.2)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '7px', marginBottom: '4px' }}>YOUR STAKE</div>
          <div style={{ color: '#00ff88', fontSize: '10px', fontWeight: 900 }}>{activeStaked.toLocaleString()} $VIBE</div>
        </div>

        <div style={{ background: 'rgba(2, 11, 26, 0.8)', border: '1px solid rgba(255, 215, 0, 0.2)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '7px', marginBottom: '4px' }}>YOUR POOL SHARE</div>
          <div style={{ color: '#ffd700', fontSize: '10px', fontWeight: 900 }}>
            {((activeStaked / poolTotal) * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Stake Input Card */}
      <div style={{
        background: 'rgba(4, 20, 48, 0.95)',
        border: '2px solid #00f5ff',
        borderRadius: '10px',
        padding: '14px',
        marginBottom: '16px'
      }}>
        <div style={{ fontSize: '9px', color: '#ffd700', marginBottom: '10px' }}>
          DEPOSIT $VIBE TO STAKING VAULT
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <input
            type="number"
            placeholder="Amount $VIBE..."
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            style={{
              flex: 1,
              fontFamily: 'var(--vv-pixel)',
              fontSize: '8px',
              background: '#020b1a',
              border: '1px solid rgba(0,245,255,0.4)',
              color: '#fff',
              borderRadius: '4px',
              padding: '8px 10px'
            }}
          />
          <button
            onClick={() => setStakeAmount('100000')}
            style={{
              fontFamily: 'var(--vv-pixel)',
              fontSize: '7px',
              background: 'rgba(0,245,255,0.2)',
              border: '1px solid #00f5ff',
              color: '#00f5ff',
              borderRadius: '4px',
              padding: '8px 10px',
              cursor: 'pointer'
            }}
          >
            100K
          </button>
          <button
            onClick={handleStake}
            disabled={staking || !stakeAmount || Number(stakeAmount) <= 0}
            style={{
              fontFamily: 'var(--vv-pixel)',
              fontSize: '8px',
              background: 'linear-gradient(135deg, #00ff88, #0099aa)',
              border: '1px solid #fff',
              color: '#000',
              fontWeight: 900,
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            {staking ? 'STAKING...' : 'STAKE'}
          </button>
        </div>

        <div style={{ fontSize: '7px', color: '#888' }}>
          AVAILABLE BALANCE: <span style={{ color: '#00f5ff' }}>1,000,000 $VIBE</span>
        </div>
      </div>
    </div>
  );
}
