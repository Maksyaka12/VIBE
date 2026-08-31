import React from 'react';
import { X, Gift, Coins, Crown, ArrowUpRight, LogOut, Wallet, Check, Copy } from 'lucide-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount, useDisconnect } from 'wagmi';

const shortAddress = (a) => (a ? a.slice(0, 6) + '...' + a.slice(-4) : '');

export function BaseAppSidebar({ isOpen, onClose, activeTab, onSelectTab }) {
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = React.useState(false);

  const activeAddress = user?.wallet?.address || wallets?.[0]?.address || wagmiAddress;
  const hasWallet = (authenticated && !!activeAddress) || (isWagmiConnected && !!wagmiAddress);

  const handleCopy = () => {
    if (!activeAddress) return;
    navigator.clipboard.writeText(activeAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = () => {
    disconnect?.();
    logout?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 998,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Sidebar Drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          maxWidth: '85vw',
          height: '100vh',
          background: '#0b0f19',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 16px',
          boxSizing: 'border-box',
          fontFamily: "'Inter', sans-serif",
          boxShadow: '10px 0 40px rgba(0, 0, 0, 0.75)',
          animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div>
          {/* Header with Logo + $VIBE + Close button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '18px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/new-logo-vibe.png"
                alt="VIBE"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid rgba(0, 160, 255, 0.4)'
                }}
              />
              <span style={{ fontSize: '1.18rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                $VIBE
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close Menu"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <X size={18} color="#FFFFFF" />
            </button>
          </div>

          {/* Navigation Items (3 Options) - Using div instead of nav to avoid index.css collision */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Option 1: Rewards Hub */}
            <button
              onClick={() => {
                onSelectTab('hub');
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 14px',
                borderRadius: '14px',
                border: 'none',
                background: activeTab === 'hub' ? 'rgba(0, 82, 255, 0.2)' : 'transparent',
                color: activeTab === 'hub' ? '#FFFFFF' : '#94a3b8',
                fontSize: '0.94rem',
                fontWeight: activeTab === 'hub' ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'hub') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'hub') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: activeTab === 'hub' ? '#0052ff' : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}
              >
                <Gift size={16} strokeWidth={2.5} />
              </div>
              <span>Rewards Hub</span>
            </button>

            {/* Option 2: Claim Portal */}
            <button
              onClick={() => {
                onSelectTab('claim');
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 14px',
                borderRadius: '14px',
                border: 'none',
                background: activeTab === 'claim' ? 'rgba(0, 82, 255, 0.2)' : 'transparent',
                color: activeTab === 'claim' ? '#FFFFFF' : '#94a3b8',
                fontSize: '0.94rem',
                fontWeight: activeTab === 'claim' ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'claim') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'claim') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: activeTab === 'claim' ? '#0052ff' : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}
              >
                <Coins size={16} strokeWidth={2.5} />
              </div>
              <span>Claim Portal</span>
            </button>

            {/* Option 3: Join Vibe Club (Internal Section) */}
            <button
              onClick={() => {
                onSelectTab('vibeclub');
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 14px',
                borderRadius: '14px',
                border: 'none',
                background: activeTab === 'vibeclub' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: activeTab === 'vibeclub' ? '#FFFFFF' : '#94a3b8',
                fontSize: '0.94rem',
                fontWeight: activeTab === 'vibeclub' ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'vibeclub') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'vibeclub') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: activeTab === 'vibeclub' ? '#f59e0b' : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: activeTab === 'vibeclub' ? '#000000' : '#f59e0b'
                }}
              >
                <Crown size={16} strokeWidth={2.5} />
              </div>
              <span>Join Vibe Club</span>
            </button>
          </div>
        </div>

        {/* Footer: Wallet status */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {hasWallet ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src="/new-logo-vibe.png"
                    alt="avatar"
                    style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                  />
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'monospace' }}>
                    {shortAddress(activeAddress)}
                  </span>
                </div>

                <button
                  onClick={handleCopy}
                  title="Copy address"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: copied ? '#10b981' : '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              <button
                onClick={handleDisconnect}
                style={{
                  width: '100%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#ef4444',
                  borderRadius: '12px',
                  padding: '9px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <LogOut size={13} />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                login();
                onClose();
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #0284c7 0%, #0052ff 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '14px',
                padding: '11px 14px',
                fontSize: '0.86rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0, 82, 255, 0.35)'
              }}
            >
              <Wallet size={15} strokeWidth={2.5} />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
