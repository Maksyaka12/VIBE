import React from 'react';

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'whale_king',  xp: 128_400, change: 'same',  emoji: '🐳' },
  { rank: 2, name: 'vibelord',    xp: 95_200,  change: 'up',    emoji: '⚡' },
  { rank: 3, name: 'base_maxi',   xp: 82_700,  change: 'down',  emoji: '🔵' },
  { rank: 4, name: 'mks',         xp: 61_300,  change: 'up',    emoji: '🐕' },
  { rank: 5, name: 'degen_xo',    xp: 54_800,  change: 'up',    emoji: '💎' },
  { rank: 6, name: 'holdmaster',  xp: 49_100,  change: 'down',  emoji: '🏆' },
  { rank: 7, name: 'nftbro',      xp: 42_600,  change: 'same',  emoji: '🎨' },
  { rank: 8, name: 'vibe_girl',   xp: 38_900,  change: 'up',    emoji: '🌟' },
  { rank: 9, name: 'chad_base',   xp: 31_200,  change: 'down',  emoji: '🦅' },
  { rank: 10, name: 'pump_maxi',  xp: 28_600,  change: 'up',    emoji: '🚀' },
];

function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function LeaderboardPanel({ player }) {
  const top3 = MOCK_LEADERBOARD.slice(0, 3);
  const rest  = MOCK_LEADERBOARD.slice(3);

  return (
    <div className="vv-leaderboard">
      <div className="vv-leaderboard__header">
        <div>
          <div className="vv-leaderboard__title">Leaderboard</div>
          <div className="vv-leaderboard__subtitle">
            Top vibers by XP this season — prizes distributed at end of epoch.
          </div>
        </div>
        <div className="vv-season-badge">
          <div className="vv-season-badge__label">Season 01 Prize</div>
          <div className="vv-season-badge__value">1,000,000 $VIBE</div>
          <div className="vv-season-badge__timer">Ends in 11d 4h 22m</div>
        </div>
      </div>

      {/* Podium */}
      <div className="vv-lb-podium">
        {/* 2nd */}
        <div className="vv-lb-podium__item rank-2">
          <div className="vv-lb-podium__rank">2</div>
          <div className="vv-lb-podium__avatar" style={{ fontSize: 22 }}>
            {top3[1].emoji}
          </div>
          <div className="vv-lb-podium__name">{top3[1].name}.vibe</div>
          <div className="vv-lb-podium__xp">{fmt(top3[1].xp)} XP</div>
        </div>

        {/* 1st */}
        <div className="vv-lb-podium__item rank-1">
          <div className="vv-lb-podium__crown">👑</div>
          <div className="vv-lb-podium__rank">1</div>
          <div className="vv-lb-podium__avatar" style={{ fontSize: 26 }}>
            {top3[0].emoji}
          </div>
          <div className="vv-lb-podium__name">{top3[0].name}.vibe</div>
          <div className="vv-lb-podium__xp" style={{ color: '#ffd700' }}>
            {fmt(top3[0].xp)} XP
          </div>
        </div>

        {/* 3rd */}
        <div className="vv-lb-podium__item rank-3">
          <div className="vv-lb-podium__rank">3</div>
          <div className="vv-lb-podium__avatar" style={{ fontSize: 22 }}>
            {top3[2].emoji}
          </div>
          <div className="vv-lb-podium__name">{top3[2].name}.vibe</div>
          <div className="vv-lb-podium__xp">{fmt(top3[2].xp)} XP</div>
        </div>
      </div>

      {/* Table */}
      <div className="vv-lb-table">
        {rest.map((row) => (
          <div
            key={row.rank}
            className={`vv-lb-row ${player && row.name === player.name ? 'is-me' : ''}`}
          >
            <div className="vv-lb-row__rank">#{row.rank}</div>
            <div className="vv-lb-row__avatar">{row.emoji}</div>
            <div className="vv-lb-row__name">
              {row.name}<span>.vibe</span>
            </div>
            <div className="vv-lb-row__xp">{fmt(row.xp)} XP</div>
            <div
              className={`vv-lb-row__change ${row.change}`}
            >
              {row.change === 'up' ? '↑' : row.change === 'down' ? '↓' : '—'}
            </div>
          </div>
        ))}

        {/* Player's own row if not in top 10 */}
        {player && !MOCK_LEADERBOARD.find((r) => r.name === player.name) && (
          <>
            <div style={{ padding: '8px 16px', color: 'rgba(255,255,255,0.2)', fontSize: 11, textAlign: 'center' }}>
              · · ·
            </div>
            <div className="vv-lb-row is-me">
              <div className="vv-lb-row__rank">#???</div>
              <div className="vv-lb-row__avatar">🐕</div>
              <div className="vv-lb-row__name">
                {player.name}<span>.vibe</span>&nbsp;
                <span style={{ color: '#00f5ff', fontWeight: 600 }}>(You)</span>
              </div>
              <div className="vv-lb-row__xp">{fmt(player.xp || 0)} XP</div>
              <div className="vv-lb-row__change same">—</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
