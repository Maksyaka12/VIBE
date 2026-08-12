import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useUserBalances } from '../hooks/useUserBalances';

export default function HomePanel({ player, onNavigate }) {
  const { authenticated, user, linkTwitter } = usePrivy();
  const rawAddress = user?.wallet?.address;
  const balances = useUserBalances(rawAddress);

  // Check if player owns an NFT or is a club member
  const isClubMember = Boolean(player?.hasNft || player?.isClubMember);

  const twitterUsername = user?.twitter?.username ? `@${user.twitter.username}` : null;
  const walletAddress = user?.wallet?.address
    ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
    : 'Not Connected';

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: '#fff', fontSize: '12px', padding: '4px' }}>
      {/* ── 1. HEADER PROFILE CARD (2X TALLER & ENLARGED AVATAR) ── */}
      <div className="vv-home-profile-card" style={{
        background: 'rgba(4, 20, 48, 0.95)',
        border: '2.5px solid rgba(0, 245, 255, 0.45)',
        borderRadius: '16px',
        padding: '36px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        marginBottom: '24px',
        minHeight: '200px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 24px rgba(0, 245, 255, 0.25)'
      }}>
        {/* Enlarge Avatar Container */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={player?.nftImage || "/vibe-dog.jpg"}
            alt="Dog Avatar"
            className="vv-home-avatar"
            style={{
              width: '130px',
              height: '130px',
              borderRadius: '14px',
              border: '4px solid #00f5ff',
              objectFit: 'cover',
              boxShadow: '0 0 24px rgba(0, 245, 255, 0.45)',
              imageRendering: 'pixelated'
            }}
          />
          {isClubMember && (
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              right: '-8px',
              background: '#ffd700',
              color: '#000',
              fontSize: '18px',
              borderRadius: '10px',
              padding: '4px 8px',
              fontWeight: 900,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
              border: '2px solid #fff'
            }}>
              👑
            </div>
          )}
        </div>

        {/* User Info & Member Status */}
        <div style={{ flex: 1 }}>
          <div className="vv-home-username" style={{
            fontSize: '26px',
            color: '#00f5ff',
            marginBottom: '10px',
            letterSpacing: '1px',
            fontWeight: 900,
            textShadow: '3px 3px 0 #000, 0 0 16px rgba(0, 245, 255, 0.6)'
          }}>
            {player?.name || 'mks'}<span style={{ color: '#ffd700' }}>.vibe</span>
          </div>

          {isClubMember ? (
            <div style={{
              fontSize: '14px',
              color: '#ffd700',
              fontWeight: 900,
              letterSpacing: '0.8px',
              textShadow: '1px 1px 0 #000, 0 0 10px rgba(255, 215, 0, 0.6)'
            }}>
              VIBE CLUB MEMBER
            </div>
          ) : (
            <div style={{
              fontSize: '14px',
              color: '#ffffff',
              fontWeight: 900,
              letterSpacing: '0.8px',
              textShadow: '1px 1px 0 #000'
            }}>
              STANDARD DOG
            </div>
          )}
        </div>

        {/* Join Vibe Club Button for Standard Dogs */}
        {!isClubMember && (
          <button
            onClick={() => onNavigate?.('nft_mint')}
            style={{
              fontFamily: 'var(--vv-pixel)',
              fontSize: '12px',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #ffd700 0%, #ff8800 100%)',
              border: '2px solid #ffffff',
              borderRadius: '12px',
              color: '#020b1a',
              padding: '16px 26px',
              cursor: 'pointer',
              boxShadow: '0 4px 0 #cc6600, 0 0 20px rgba(255, 215, 0, 0.6)',
              transition: 'all 0.15s ease',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexShrink: 0
            }}
          >
            <span>👑</span> JOIN VIBE CLUB
          </button>
        )}
      </div>

      {/* ── 2. BALANCES CARD ── */}
      <div className="vv-home-balances-card" style={{
        background: 'rgba(2, 11, 26, 0.9)',
        border: '2px solid rgba(255, 215, 0, 0.45)',
        borderRadius: '14px',
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: '24px',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6), 0 0 16px rgba(255, 215, 0, 0.2)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#88aacc', fontSize: '10px', marginBottom: '8px', letterSpacing: '0.8px', fontWeight: 900 }}>
            $VIBE BALANCE
          </div>
          <div style={{ fontSize: '20px', color: '#ffd700', fontWeight: 900, textShadow: '0 0 14px rgba(255, 215, 0, 0.5)' }}>
            {balances.loading ? 'Loading...' : `${balances.vibeFormatted} $VIBE`}
          </div>
        </div>

        <div className="vv-home-balances-divider" style={{ width: '2px', height: '44px', background: 'rgba(0, 245, 255, 0.25)' }} />

        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#88aacc', fontSize: '10px', marginBottom: '8px', letterSpacing: '0.8px', fontWeight: 900 }}>
            ETH BALANCE
          </div>
          <div style={{ fontSize: '20px', color: '#00f5ff', fontWeight: 900, textShadow: '0 0 14px rgba(0, 245, 255, 0.5)' }}>
            {balances.loading ? 'Loading...' : `${balances.ethFormatted} ETH`}
          </div>
        </div>
      </div>

      {/* ── 3. LINKED ACCOUNTS GRID ── */}
      <div className="vv-home-accounts-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
        {/* Linked X Account */}
        <div style={{
          background: 'rgba(2, 11, 26, 0.9)',
          border: '1.5px solid rgba(0, 245, 255, 0.3)',
          borderRadius: '14px',
          padding: '22px',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ color: '#88aacc', fontSize: '10px', marginBottom: '10px', letterSpacing: '0.8px', fontWeight: 900 }}>
            LINKED X ACCOUNT
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', minHeight: '32px' }}>
            <div style={{ fontSize: '15px', color: twitterUsername ? '#00f5ff' : '#6688aa', fontWeight: 900 }}>
              {twitterUsername || 'Not Linked'}
            </div>
            {!twitterUsername && (
              <button
                onClick={() => {
                  if (authenticated && linkTwitter) {
                    linkTwitter();
                  } else if (login) {
                    login();
                  }
                }}
                style={{
                  fontFamily: 'var(--vv-pixel)',
                  fontSize: '10px',
                  fontWeight: 900,
                  background: 'rgba(0, 245, 255, 0.15)',
                  border: '1.5px solid #00f5ff',
                  color: '#00f5ff',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 0 10px rgba(0, 245, 255, 0.3)',
                  letterSpacing: '0.8px'
                }}
              >
                + LINK
              </button>
            )}
          </div>
        </div>

        {/* Connected Wallet */}
        <div style={{
          background: 'rgba(2, 11, 26, 0.9)',
          border: '1.5px solid rgba(0, 245, 255, 0.3)',
          borderRadius: '14px',
          padding: '22px',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ color: '#88aacc', fontSize: '10px', marginBottom: '10px', letterSpacing: '0.8px', fontWeight: 900 }}>
            CONNECTED WALLET
          </div>
          <div style={{ fontSize: '15px', color: '#ffd700', fontWeight: 900, minHeight: '32px', display: 'flex', alignItems: 'center' }}>
            {walletAddress}
          </div>
        </div>
      </div>
    </div>
  );
}
