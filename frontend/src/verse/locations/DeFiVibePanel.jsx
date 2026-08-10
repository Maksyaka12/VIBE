import React, { useState } from 'react';

const BUILDER_CODE = 'bc_wsbqqe2u';

export default function DeFiVibePanel({ player }) {
  const [fromAmount, setFromAmount] = useState('');
  const [toToken, setToToken] = useState('VIBE');
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
    <div style={{ fontFamily: 'var(--vv-pixel)', color: '#fff', fontSize: '9px' }}>
      {/* Builder Code Status Banner */}
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
        <span style={{ fontSize: '16px' }}>⚡</span>
        <div style={{ fontSize: '7.5px', color: '#00f5ff', lineHeight: 1.5 }}>
          <strong>O1 EXCHANGE IN-GAME DEX:</strong> All swaps on Base embed official Builder Code <code>{BUILDER_CODE}</code> for maximal ecosystem routing efficiency!
        </div>
      </div>

      {/* Main Swap Card */}
      <div style={{
        background: 'rgba(4, 20, 48, 0.95)',
        border: '2px solid #00f5ff',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ fontSize: '9px', color: '#ffd700', marginBottom: '12px' }}>
          SWAP TOKENS (O1 ROUTER)
        </div>

        {/* FROM Token Input */}
        <div style={{ background: '#020b1a', border: '1px solid rgba(0,245,255,0.3)', borderRadius: '6px', padding: '10px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '7px', marginBottom: '6px' }}>
            <span>YOU PAY</span>
            <span>BALANCE: 0.42 ETH</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              style={{
                flex: 1,
                fontFamily: 'var(--vv-pixel)',
                fontSize: '10px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                outline: 'none'
              }}
            />
            <span style={{ color: '#00f5ff', fontSize: '9px', fontWeight: 900, background: 'rgba(0,245,255,0.15)', padding: '4px 8px', borderRadius: '4px' }}>
              ETH
            </span>
          </div>
        </div>

        {/* Swap Arrow */}
        <div style={{ textAlign: 'center', margin: '-4px 0', color: '#ffd700', fontSize: '10px' }}>
          ⬇
        </div>

        {/* TO Token Input */}
        <div style={{ background: '#020b1a', border: '1px solid rgba(0,245,255,0.3)', borderRadius: '6px', padding: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '7px', marginBottom: '6px' }}>
            <span>YOU RECEIVE (ESTIMATED)</span>
            <span>SLIPPAGE: 0.5%</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ flex: 1, color: '#00ff88', fontSize: '10px', fontWeight: 900 }}>
              {estimatedVibe}
            </div>
            <span style={{ color: '#ffd700', fontSize: '9px', fontWeight: 900, background: 'rgba(255,215,0,0.15)', padding: '4px 8px', borderRadius: '4px' }}>
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
            fontSize: '9px',
            background: 'linear-gradient(135deg, #00f5ff, #0050ff)',
            border: '2px solid #fff',
            borderRadius: '6px',
            padding: '10px',
            color: '#fff',
            cursor: swapping ? 'default' : 'pointer',
            boxShadow: '0 3px 0 #0033aa'
          }}
        >
          {swapping ? 'SWAPPING VIA O1 EXCHANGE...' : 'SWAP NOW ON BASE'}
        </button>
      </div>
    </div>
  );
}
