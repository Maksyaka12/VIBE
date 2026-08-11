import React from 'react';

const BUILDER_CODE = 'bc_wsbqqe2u';
const VIBE_TOKEN_CA = '0xb200000000000000000000df24ecb8bf51100a01';
const O1_SWAP_URL = `https://launch.o1.exchange/token/${VIBE_TOKEN_CA}?chain=8453`;

export default function DeFiVibePanel({ player }) {
  return (
    <div style={{ fontFamily: 'var(--vv-pixel)', color: '#fff', fontSize: '11px', padding: '4px' }}>
      {/* ── 1. TOP HEADER BANNER ── */}
      <div style={{
        background: 'rgba(0, 245, 255, 0.12)',
        border: '1.5px solid rgba(0, 245, 255, 0.5)',
        borderRadius: '12px',
        padding: '16px 22px',
        marginBottom: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0, 245, 255, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '26px' }}>⚡</span>
          <div>
            <div style={{ color: '#00f5ff', fontSize: '13px', fontWeight: 900, letterSpacing: '0.8px', marginBottom: '2px' }}>
              OFFICIAL O1 LAUNCHPAD DEX INTERFACE
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '10px' }}>
              Direct B20 Token Swap Engine for $VIBE · Tagged with Builder Code <code>{BUILDER_CODE}</code>
            </div>
          </div>
        </div>

        <a
          href={O1_SWAP_URL}
          target="_blank"
          rel="noreferrer"
          style={{
            fontFamily: 'var(--vv-pixel)',
            fontSize: '10px',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #00f5ff 0%, #0050ff 100%)',
            border: '1.5px solid #ffffff',
            borderRadius: '8px',
            color: '#ffffff',
            padding: '8px 16px',
            textDecoration: 'none',
            boxShadow: '0 0 14px rgba(0, 245, 255, 0.4)',
            whiteSpace: 'nowrap'
          }}
        >
          OPEN FULL O1 TAB ↗
        </a>
      </div>

      {/* ── 2. MAIN RETRO PIXEL CONTAINER WITH EMBEDDED O1 LAUNCHPAD ── */}
      <div style={{
        background: 'rgba(4, 20, 48, 0.96)',
        border: '3px solid #00f5ff',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 245, 255, 0.3)',
        position: 'relative'
      }}>
        {/* Frame Title Bar */}
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          paddingBottom: '12px',
          marginBottom: '14px',
          borderBottom: '2px dashed rgba(0, 245, 255, 0.3)'
        }}>
          <div style={{ fontSize: '12px', color: '#ffd700', fontWeight: 900, letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🐶</span> $VIBE / ETH — LIVE O1 SWAP TERMINAL
          </div>
          <div style={{ fontSize: '10px', color: '#00ff88', fontWeight: 900 }}>
            ● BASE MAINNET CONNECTED
          </div>
        </div>

        {/* Embedded o1 Exchange dApp Frame */}
        <div style={{ position: 'relative', width: '100%', height: '540px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid rgba(0, 245, 255, 0.4)' }}>
          <iframe
            src={O1_SWAP_URL}
            title="o1 Exchange VIBE Official Swap"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: '#06070b'
            }}
          />
        </div>

        {/* Footer Info */}
        <div style={{
          marginTop: '14px',
          display: 'flex',
          justify: 'space-between',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '9px'
        }}>
          <span>EXECUTIVE ROUTER: o1 Launchpad B20 Bonding Curve</span>
          <span>BUILDER PROGRAM: {BUILDER_CODE}</span>
        </div>
      </div>
    </div>
  );
}
