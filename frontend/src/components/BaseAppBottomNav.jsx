import React from 'react';
import {
  ArrowLeftRight,
  Crown,
  Gift,
  CheckCircle2,
  User
} from 'lucide-react';

export function BaseAppBottomNav({ activeTab, onSelectTab }) {
  const navItems = [
    {
      id: 'buy',
      label: 'BUY',
      icon: ArrowLeftRight,
    },
    {
      id: 'vibeclub',
      label: 'MINT NFT',
      icon: Crown,
    },
    {
      id: 'hub',
      label: 'REWARDS',
      icon: Gift,
    },
    {
      id: 'claim',
      label: 'CLAIM',
      icon: CheckCircle2,
    },
    {
      id: 'profile',
      label: 'PROFILE',
      icon: User,
    }
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: 'linear-gradient(180deg, rgba(6, 26, 60, 0.97) 0%, rgba(2, 11, 26, 0.99) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1.5px solid rgba(0, 245, 255, 0.35)',
        boxShadow: '0 -6px 24px rgba(0, 0, 0, 0.8), 0 -1px 0 rgba(0, 245, 255, 0.2)',
        paddingTop: '8px',
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '2px',
          padding: '0 4px',
          boxSizing: 'border-box'
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'claim' && activeTab === 'claim');
          
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                background: isActive ? 'rgba(0, 245, 255, 0.08)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 2px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                color: isActive ? '#00f5ff' : '#88aacc',
                boxShadow: isActive ? 'inset 0 0 10px rgba(0, 245, 255, 0.15)' : 'none'
              }}
            >
              <Icon
                size={18}
                color={isActive ? '#00f5ff' : '#88aacc'}
                strokeWidth={isActive ? 2.5 : 2}
                style={{
                  filter: isActive ? 'drop-shadow(0 0 6px rgba(0, 245, 255, 0.6))' : 'none',
                  transition: 'all 0.15s ease'
                }}
              />
              <span
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '5.5px',
                  fontWeight: 900,
                  letterSpacing: '0.2px',
                  whiteSpace: 'nowrap',
                  lineHeight: 1,
                  color: isActive ? '#00f5ff' : '#88aacc',
                  textShadow: isActive ? '0 0 8px rgba(0, 245, 255, 0.6)' : 'none'
                }}
              >
                {item.label}
              </span>
              {isActive ? (
                <span
                  style={{
                    width: '3.5px',
                    height: '3.5px',
                    borderRadius: '50%',
                    background: '#00f5ff',
                    boxShadow: '0 0 6px #00f5ff',
                    marginTop: '-1px'
                  }}
                />
              ) : (
                <span style={{ width: '3.5px', height: '3.5px', marginTop: '-1px' }} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
