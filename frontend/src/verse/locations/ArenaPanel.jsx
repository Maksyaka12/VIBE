import React from 'react';

const GAMES = [
  {
    id: 'vibe-run',
    name: 'Vibe Run',
    desc: 'Endless runner — dodge FUD, collect $VIBE. Your balance multiplies your score.',
    status: 'live',
    reward: '10,000 $VIBE / week',
    players: '342 playing',
    gradient: 'linear-gradient(135deg, #0a1628, #0050ff40)',
    emoji: '🐕',
  },
  {
    id: 'mood-blaster',
    name: 'Mood Blaster',
    desc: 'Tap-based rhythm game. Hit the vibes in time to earn XP streaks.',
    status: 'soon',
    reward: '5,000 $VIBE / week',
    players: 'Coming Soon',
    gradient: 'linear-gradient(135deg, #0a0020, #b44dff30)',
    emoji: '🎵',
  },
  {
    id: 'vibe-clash',
    name: 'Vibe Clash',
    desc: 'PvP 1v1 strategy card game. Challenge other Vibers for their staked tokens.',
    status: 'soon',
    reward: '25,000 $VIBE / match',
    players: 'Coming Soon',
    gradient: 'linear-gradient(135deg, #200a00, #ff443040)',
    emoji: '⚔️',
  },
  {
    id: 'community-1',
    name: 'Community Slot',
    desc: 'This slot is open for community-built games. Submit your game to be featured.',
    status: 'soon',
    reward: 'TBA',
    players: 'Open for submissions',
    gradient: 'linear-gradient(135deg, #0a0a0a, #ffffff10)',
    emoji: '🔧',
  },
];

export default function ArenaPanel({ player }) {
  return (
    <div className="vv-arena">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1,
            }}
          >
            Vibe Arena
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              color: 'rgba(255,255,255,0.35)',
              maxWidth: 480,
            }}
          >
            Mini-games, challenges, and community-created experiences. Each game has its own
            leaderboard and $VIBE prize pool.
          </div>
        </div>

        <div
          style={{
            background: 'rgba(180,77,255,0.08)',
            border: '1px solid rgba(180,77,255,0.2)',
            borderRadius: 12,
            padding: '12px 20px',
          }}
        >
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Total Prizes This Week
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#b44dff', marginTop: 4 }}>
            40,000 $VIBE
          </div>
        </div>
      </div>

      <div className="vv-arena__grid">
        {GAMES.map((game) => (
          <div
            key={game.id}
            className={`vv-game-card ${game.status === 'soon' ? 'coming-soon' : ''}`}
          >
            <div className="vv-game-card__banner" style={{ background: game.gradient }}>
              <span style={{ fontSize: 52, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))', zIndex: 1 }}>
                {game.emoji}
              </span>
              <div className={`vv-game-card__status ${game.status}`}>
                {game.status === 'live' ? 'LIVE' : 'COMING SOON'}
              </div>
            </div>

            <div className="vv-game-card__body">
              <div className="vv-game-card__name">{game.name}</div>
              <div className="vv-game-card__desc">{game.desc}</div>
              <div className="vv-game-card__footer">
                <div className="vv-game-card__reward">{game.reward}</div>
                <div className="vv-game-card__players">{game.players}</div>
              </div>

              {game.status === 'live' && (
                <button
                  style={{
                    marginTop: 14,
                    width: '100%',
                    height: 40,
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #0050ff, #00f5ff)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: 0.5,
                  }}
                >
                  Play Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Community game submission */}
      <div
        style={{
          marginTop: 32,
          padding: '24px 28px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
            Built something cool?
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            Submit your game to be featured in Vibe Arena. Community games earn a share of the weekly prize pool.
          </div>
        </div>
        <a
          href="https://x.com/mksvibe"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          Submit Game →
        </a>
      </div>
    </div>
  );
}
