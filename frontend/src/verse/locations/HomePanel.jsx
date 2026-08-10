import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

export default function HomePanel({ player, onNavigate }) {
  const { authenticated, user, linkTwitter, login } = usePrivy();

  const isClubMember = true;
  const twitterUsername = user?.twitter?.username ? `@${user.twitter.username}` : null;
  const walletAddress = user?.wallet?.address
    ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
    : 'Not Connected';

  return (
    <div style={{ fontFamily: 'var(--vv-pixel)', color: '#fff', fontSize: '11px' }}>
      {/* Header Info Card */}
      <div style={{
        background: 'rgba(4, 20, 48, 0.95)',
        border: '2px solid rgba(0, 245, 255, 0.4)',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '20px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.6)'
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src="/vibe-dog.jpg"
            alt="Dog Avatar"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '10px',
              border: '3px solid #00f5ff',
              objectFit: 'cover'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            right: '-6px',
            background: '#ffd700',
            color: '#000',
            fontSize: '12px',
            borderRadius: '6px',
            padding: '2px 5px',
            fontWeight: 900,
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}>
            👑
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '18px', color: '#00f5ff', marginBottom: '6px', letterSpacing: '0.5px', fontWeight: 900 }}>
            {player?.name || 'sanoki'}<span style={{ color: '#ffd700' }}>.vibe</span>
          </div>
          <div style={{ fontSize: '11px', color: '#ffd700', marginBottom: '4px', fontWeight: 900 }}>
            VIBE CLUB MEMBER
          </div>
          <div style={{ fontSize: '9px', color: '#aaa' }}>
            STATUS: <span style={{ color: '#00ff88', fontWeight: 900 }}>ACTIVE VIBER</span>
          </div>
        </div>

        {!isClubMember && (
          <button
            onClick={() => onNavigate?.('nft_mint')}
            style={{
              fontFamily: 'var(--vv-pixel)',
              fontSize: '10px',
              background: 'linear-gradient(135deg, #ff44aa, #b44dff)',
              border: '2px solid #fff',
              borderRadius: '8px',
              color: '#fff',
              padding: '12px 18px',
              cursor: 'pointer',
              boxShadow: '0 3px 0 #660044'
            }}
          >
            MINT NFT
          </button>
        )}
      </div>

      {/* Account & Balances Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Linked X Account */}
        <div style={{
          background: 'rgba(2, 11, 26, 0.85)',
          border: '1.5px solid rgba(0, 245, 255, 0.25)',
          borderRadius: '10px',
          padding: '16px'
        }}>
          <div style={{ color: '#aaa', fontSize: '9px', marginBottom: '8px', letterSpacing: '0.5px' }}>LINKED X ACCOUNT</div>
          <div style={{ fontSize: '12px', color: twitterUsername ? '#00f5ff' : '#888', marginBottom: '10px', fontWeight: 900 }}>
            {twitterUsername || 'Not Linked'}
          </div>
          {authenticated && !twitterUsername && (
            <button
              onClick={linkTwitter}
              style={{
                fontFamily: 'var(--vv-pixel)',
                fontSize: '9px',
                background: 'rgba(0, 245, 255, 0.15)',
                border: '1.5px solid #00f5ff',
                color: '#00f5ff',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer'
              }}
            >
              + LINK X ACCOUNT
            </button>
          )}
        </div>

        {/* Wallet Address */}
        <div style={{
          background: 'rgba(2, 11, 26, 0.85)',
          border: '1.5px solid rgba(0, 245, 255, 0.25)',
          borderRadius: '10px',
          padding: '16px'
        }}>
          <div style={{ color: '#aaa', fontSize: '9px', marginBottom: '8px', letterSpacing: '0.5px' }}>CONNECTED WALLET</div>
          <div style={{ fontSize: '12px', color: '#ffd700', marginBottom: '6px', fontWeight: 900 }}>
            {walletAddress}
          </div>
          <div style={{ fontSize: '9px', color: '#00ff88' }}>
            NETWORK: BASE MAINNET
          </div>
        </div>
      </div>

      {/* Balances Card */}
      <div style={{
        background: 'rgba(2, 11, 26, 0.85)',
        border: '1.5px solid rgba(255, 215, 0, 0.35)',
        borderRadius: '10px',
        padding: '18px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '9px', marginBottom: '6px' }}>$VIBE BALANCE</div>
          <div style={{ fontSize: '15px', color: '#ffd700', fontWeight: 900 }}>100,000 $VIBE</div>
        </div>
        <div style={{ width: '2px', height: '32px', background: 'rgba(255,255,255,0.12)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '9px', marginBottom: '6px' }}>ETH BALANCE</div>
          <div style={{ fontSize: '15px', color: '#00f5ff', fontWeight: 900 }}>0.42 ETH</div>
        </div>
      </div>
    </div>
  );
}
