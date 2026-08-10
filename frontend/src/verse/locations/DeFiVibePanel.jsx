import React, { useState } from 'react';

const BUILDER_CODE = 'bc_wsbqqe2u';

export default function DeFiVibePanel({ player }) {
  const [fromAmount, setFromAmount] = useState('');
  const [swapping, setSwapping] = useState(false);

  const vibeRate = 238000000; // 1 ETH = ~238M $VIBE

  const estimatedVibe = fromAmount ? (Number(fromAmount) * vibeRate).toLocaleString() : '0';

  const handleSwap = () => {
    if (!fromAmount || Number(fromAmount) <= 0) return;
    setSwapping(true);
    setTimeout(() => {
      setSwapping(false);
      setFromAmount('');
      alert(`SWAP EXECUTED VIA O1 EXCHANGE WITH BUILDER CODE: ${BUILDER_CODE}`);
    }, 1500);
  };

  return (
    <div style={{ fontFamily: 'var(--vv-pixel)', color: '#fff', fontSize: '11px' }}>
      {/* Builder Code Status Banner */}
      <div style={{
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
        <span style={{ fontSize: '24px' }}>⚡</span>
        <div style={{ fontSize: '10px', color: '#00f5ff', lineHeight: 1.6 }}>
          <strong style={{ color: '#fff' }}>O1 EXCHANGE IN-GAME DEX:</strong> All swaps on Base embed official Builder Code <code>{BUILDER_CODE}</code> for maximal ecosystem routing efficiency!
        </div>
      </div>

      {/* Main Swap Card */}
      <div style={{
        background: 'rgba(4, 20, 48, 0.95)',
        border: '2px solid #00f5ff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.6)'
      }}>
        <div style={{ fontSize: '12px', color: '#ffd700', marginBottom: '16px', letterSpacing: '0.5px' }}>
          SWAP TOKENS (O1 ROUTER)
        </div>

        {/* FROM Token Input */}
        <div style={{ background: '#020b1a', border: '1.5px solid rgba(0,245,255,0.3)', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '9px', marginBottom: '8px' }}>
            <span>YOU PAY</span>
            <span>BALANCE: 0.42 ETH</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              style={{
                flex: 1,
                fontFamily: 'var(--vv-pixel)',
                fontSize: '14px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                outline: 'none',
                fontWeight: 900
              }}
            />
            <span style={{ color: '#00f5ff', fontSize: '11px', fontWeight: 900, background: 'rgba(0,245,255,0.15)', padding: '6px 12px', borderRadius: '6px' }}>
              ETH
            </span>
          </div>
        </div>

        {/* Swap Arrow */}
        <div style={{ textAlign: 'center', margin: '-4px 0 8px 0', color: '#ffd700', fontSize: '14px' }}>
          ⬇
        </div>

        {/* TO Token Input */}
        <div style={{ background: '#020b1a', border: '1.5px solid rgba(0,245,255,0.3)', borderRadius: '8px', padding: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '9px', marginBottom: '8px' }}>
            <span>YOU RECEIVE (ESTIMATED)</span>
            <span>SLIPPAGE: 0.5%</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: 1, color: '#00ff88', fontSize: '14px', fontWeight: 900 }}>
              {estimatedVibe}
            </div>
            <span style={{ color: '#ffd700', fontSize: '11px', fontWeight: 900, background: 'rgba(255,215,0,0.15)', padding: '6px 12px', borderRadius: '6px' }}>
              $VIBE
            </span>
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={swapping || !fromAmount || Number(fromAmount) <= 0}
          style={{
            width: '100%',
            fontFamily: 'var(--vv-pixel)',
            fontSize: '11px',
            background: 'linear-gradient(135deg, #00f5ff, #0050ff)',
            border: '2px solid #fff',
            borderRadius: '8px',
            padding: '14px',
            color: '#fff',
            fontWeight: 900,
            cursor: swapping ? 'default' : 'pointer',
            boxShadow: '0 4px 0 #0033aa'
          }}
        >
          {swapping ? 'SWAPPING VIA O1 EXCHANGE...' : 'SWAP NOW ON BASE'}
        </button>
      </div>
    </div>
  );
}
