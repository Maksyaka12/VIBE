import React from 'react';
import { Menu, Wallet } from 'lucide-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import { useVibeBalances } from '../hooks/useVibeBalances';

export function BaseAppHeader({ onOpenSidebar, activeTab }) {
  const { login, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();

  const activeAddress = user?.wallet?.address || wallets?.[0]?.address || wagmiAddress;
  const hasWallet = (authenticated && !!activeAddress) || (isWagmiConnected && !!wagmiAddress);

  const { balance, nftCount, formattedBalance } = useVibeBalances(activeAddress);

  return (
    <header
      style={{
        height: '66px',
        background: '#0b0f19',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        color: '#FFFFFF',
        fontFamily: "'Inter', sans-serif",
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      {/* Left side: Hamburger + Logo + $VIBE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onOpenSidebar}
          aria-label="Open Navigation Menu"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#FFFFFF',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
        >
          <Menu size={20} color="#FFFFFF" strokeWidth={2.5} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
          <img
            src="/new-logo-vibe.png"
            alt="VIBE"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1.5px solid rgba(0, 160, 255, 0.4)',
              boxShadow: '0 2px 8px rgba(0, 82, 255, 0.25)'
            }}
          />
          <span
            style={{
              fontSize: '1.12rem',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            $VIBE
          </span>
        </div>
      </div>

      {/* Right side: Balances or Connect Wallet */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {hasWallet ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* NFT Balance Pill */}
            <div
              title="Vibe Club NFT Balance"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                userSelect: 'none'
              }}
            >
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '0.01em',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {nftCount} NFT
              </span>
              <img
                src="/new-logo-vibe.png"
                alt="NFT"
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </div>

            {/* $VIBE Token Balance Pill */}
            <div
              title="$VIBE Token Balance"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                userSelect: 'none'
              }}
            >
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '0.01em',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {formattedBalance}
              </span>
              <img
                src="/new-logo-vibe.png"
                alt="$VIBE"
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={login}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0052ff 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              padding: '8px 14px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(0, 82, 255, 0.35)',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 82, 255, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 82, 255, 0.35)';
            }}
          >
            <Wallet size={14} strokeWidth={2.5} />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>
    </header>
  );
}
