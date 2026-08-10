import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

export default function HomePanel({ player, onNavigate }) {
  const { authenticated, user, linkTwitter, login } = usePrivy();

  const isClubMember = true; // Will connect to NFT contract balance check
  const nftId = '#042 Aviator';
  const twitterUsername = user?.twitter?.username ? `@${user.twitter.username}` : null;
  const walletAddress = user?.wallet?.address
    ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
    : 'Not Connected';

  return (
    <div style={{ fontFamily: 'var(--vv-pixel)', color: '#fff', fontSize: '9px' }}>
      {/* Header Info Card */}
      <div style={{
        background: 'rgba(4, 20, 48, 0.95)',
        border: '2px solid rgba(0, 245, 255, 0.4)',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.6)'
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src="/vibe-dog.jpg"
            alt="Dog Avatar"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '8px',
              border: '2px solid #00f5ff',
              objectFit: 'cover'
            }}
          />
          {isClubMember && (
            <div style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              background: '#ffd700',
              color: '#000',
              fontSize: '8px',
              borderRadius: '4px',
              padding: '2px 4px',
              fontWeight: 900
            }}>
              👑
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', color: '#00f5ff', marginBottom: '4px' }}>
            {player?.name || 'sanoki'}<span style={{ color: '#ffd700' }}>.vibe</span>
          </div>
          <div style={{ fontSize: '8px', color: isClubMember ? '#ffd700' : '#888', marginBottom: '6px' }}>
            {isClubMember ? `VIBE CLUB MEMBER: ${nftId}` : 'NON-MEMBER'}
          </div>
          <div style={{ fontSize: '7px', color: '#aaa' }}>
            STATUS: <span style={{ color: '#00ff88' }}>ACTIVE VIBER</span>
          </div>
        </div>

        {!isClubMember && (
          <button
            onClick={() => onNavigate?.('nft_mint')}
            style={{
              fontFamily: 'var(--vv-pixel)',
              fontSize: '8px',
              background: 'linear-gradient(135deg, #ff44aa, #b44dff)',
              border: '1px solid #fff',
              borderRadius: '6px',
              color: '#fff',
              padding: '8px 12px',
              cursor: 'pointer',
              boxShadow: '0 2px 0 #660044'
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
        gap: '12px',
        marginBottom: '16px'
      }}>
        {/* Linked X Account */}
        <div style={{
          background: 'rgba(2, 11, 26, 0.8)',
          border: '1px solid rgba(0, 245, 255, 0.2)',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <div style={{ color: '#aaa', fontSize: '7px', marginBottom: '6px' }}>LINKED X ACCOUNT</div>
          <div style={{ fontSize: '9px', color: twitterUsername ? '#00f5ff' : '#888', marginBottom: '8px' }}>
            {twitterUsername || 'Not Linked'}
          </div>
          {authenticated && !twitterUsername && (
            <button
              onClick={linkTwitter}
              style={{
                fontFamily: 'var(--vv-pixel)',
                fontSize: '7px',
                background: 'rgba(0, 245, 255, 0.15)',
                border: '1px solid #00f5ff',
                color: '#00f5ff',
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer'
              }}
            >
              + LINK X ACCOUNT
            </button>
          )}
        </div>

        {/* Wallet Address */}
        <div style={{
          background: 'rgba(2, 11, 26, 0.8)',
          border: '1px solid rgba(0, 245, 255, 0.2)',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <div style={{ color: '#aaa', fontSize: '7px', marginBottom: '6px' }}>CONNECTED WALLET</div>
          <div style={{ fontSize: '9px', color: '#ffd700', marginBottom: '4px' }}>
            {walletAddress}
          </div>
          <div style={{ fontSize: '7px', color: '#00ff88' }}>
            NETWORK: BASE MAINNET
          </div>
        </div>
      </div>

      {/* Balances Card */}
      <div style={{
        background: 'rgba(2, 11, 26, 0.8)',
        border: '1px solid rgba(255, 215, 0, 0.3)',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '7px', marginBottom: '4px' }}>$VIBE BALANCE</div>
          <div style={{ fontSize: '11px', color: '#ffd700', fontWeight: 900 }}>100,000 $VIBE</div>
        </div>
        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '7px', marginBottom: '4px' }}>ETH BALANCE</div>
          <div style={{ fontSize: '11px', color: '#00f5ff', fontWeight: 900 }}>0.42 ETH</div>
        </div>
      </div>
    </div>
  );
}
