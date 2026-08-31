import React from 'react';
import { X, Gift, Coins, Crown, LogOut, Wallet, Check, Copy } from 'lucide-react';
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
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
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
          background: '#020b1a',
          borderRight: '1.5px solid rgba(0, 245, 255, 0.25)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 16px',
          boxSizing: 'border-box',
          fontFamily: "'Press Start 2P', monospace",
          boxShadow: '10px 0 40px rgba(0, 0, 0, 0.85), 0 0 20px rgba(0, 245, 255, 0.1)',
          animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          textTransform: 'uppercase'
        }}
      >
        <div>
          {/* Header with Logo + $VIBE + Close button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(0, 245, 255, 0.15)',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/new-logo-vibe.png"
                alt="VIBE"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  border: '1.5px solid #00f5ff',
                  boxShadow: '0 0 10px rgba(0, 245, 255, 0.4)'
                }}
              />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 900,
                  color: '#00f5ff',
                  letterSpacing: '0.5px',
                  textShadow: 'none'
                }}
              >
                $VIBE
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close Menu"
              style={{
                background: 'rgba(0, 245, 255, 0.08)',
                border: '1px solid rgba(0, 245, 255, 0.25)',
                borderRadius: '8px',
                color: '#00f5ff',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none'
              }}
            >
              <X size={16} color="#00f5ff" />
            </button>
          </div>

          {/* Navigation Items (3 Options) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Option 1: Rewards Hub */}
            <button
              onClick={() => {
                onSelectTab('hub');
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: activeTab === 'hub' ? '1.5px solid #00f5ff' : '1.5px solid rgba(0, 245, 255, 0.12)',
                background: activeTab === 'hub' ? 'rgba(0, 245, 255, 0.15)' : 'rgba(4, 14, 36, 0.8)',
                color: activeTab === 'hub' ? '#00f5ff' : '#88aacc',
                fontSize: '8px',
                fontWeight: 900,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: activeTab === 'hub' ? '0 0 12px rgba(0, 245, 255, 0.25)' : 'none',
                fontFamily: "'Press Start 2P', monospace",
                textTransform: 'uppercase'
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: activeTab === 'hub' ? '#0052ff' : 'rgba(0, 245, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}
              >
                <Gift size={14} strokeWidth={2.5} />
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
                gap: '10px',
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: activeTab === 'claim' ? '1.5px solid #00f5ff' : '1.5px solid rgba(0, 245, 255, 0.12)',
                background: activeTab === 'claim' ? 'rgba(0, 245, 255, 0.15)' : 'rgba(4, 14, 36, 0.8)',
                color: activeTab === 'claim' ? '#00f5ff' : '#88aacc',
                fontSize: '8px',
                fontWeight: 900,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: activeTab === 'claim' ? '0 0 12px rgba(0, 245, 255, 0.25)' : 'none',
                fontFamily: "'Press Start 2P', monospace",
                textTransform: 'uppercase'
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: activeTab === 'claim' ? '#0052ff' : 'rgba(0, 245, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}
              >
                <Coins size={14} strokeWidth={2.5} />
              </div>
              <span>Claim Portal</span>
            </button>

            {/* Option 3: Join Vibe Club */}
            <button
              onClick={() => {
                onSelectTab('vibeclub');
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: activeTab === 'vibeclub' ? '1.5px solid #ffd700' : '1.5px solid rgba(255, 215, 0, 0.2)',
                background: activeTab === 'vibeclub' ? 'rgba(255, 215, 0, 0.18)' : 'rgba(4, 14, 36, 0.8)',
                color: activeTab === 'vibeclub' ? '#ffd700' : '#88aacc',
                fontSize: '8px',
                fontWeight: 900,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: activeTab === 'vibeclub' ? '0 0 12px rgba(255, 215, 0, 0.25)' : 'none',
                fontFamily: "'Press Start 2P', monospace",
                textTransform: 'uppercase'
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: activeTab === 'vibeclub' ? '#ffd700' : 'rgba(255, 215, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: activeTab === 'vibeclub' ? '#000000' : '#ffd700'
                }}
              >
                <Crown size={14} strokeWidth={2.5} />
              </div>
              <span>Join Vibe Club</span>
            </button>
          </div>
        </div>

        {/* Footer: Wallet status */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(0, 245, 255, 0.15)' }}>
          {hasWallet ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                style={{
                  background: 'rgba(4, 14, 36, 0.9)',
                  border: '1.5px solid rgba(0, 245, 255, 0.25)',
                  borderRadius: '10px',
                  padding: '10px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img
                    src="/new-logo-vibe.png"
                    alt="avatar"
                    style={{ width: '20px', height: '20px', borderRadius: '4px' }}
                  />
                  <span style={{ fontSize: '7.5px', fontWeight: 900, color: '#00ff88' }}>
                    {shortAddress(activeAddress)}
                  </span>
                </div>

                <button
                  onClick={handleCopy}
                  title="Copy address"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: copied ? '#00ff88' : '#00f5ff',
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
                  background: 'rgba(255, 68, 102, 0.12)',
                  border: '1.5px solid rgba(255, 68, 102, 0.35)',
                  color: '#ff4466',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '7.5px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  fontFamily: "'Press Start 2P', monospace",
                  textTransform: 'uppercase'
                }}
              >
                <LogOut size={12} />
                <span>DISCONNECT</span>
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
                background: 'linear-gradient(135deg, #00f5ff, #0050ff)',
                color: '#FFFFFF',
                border: '1.5px solid #ffffff',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '8px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 0 14px rgba(0, 245, 255, 0.4)',
                fontFamily: "'Press Start 2P', monospace",
                textTransform: 'uppercase'
              }}
            >
              <Wallet size={14} strokeWidth={2.5} />
              <span>CONNECT WALLET</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
