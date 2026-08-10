import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

const ADMIN_ADDRESS = '0x4c91D3BEd372C11795b9Ce9a9017dFE447Bf050a';

export default function VibePosterPanel({ player }) {
  const { user } = usePrivy();
  const currentAddress = user?.wallet?.address?.toLowerCase() || '';
  const isAdmin = currentAddress === ADMIN_ADDRESS.toLowerCase();

  const [postUrl, setPostUrl] = useState('');
  const [category, setCategory] = useState('guide');
  const [message, setMessage] = useState('');

  const [submissions, setSubmissions] = useState([
    {
      id: 1,
      user: 'sanoki.vibe',
      url: 'https://x.com/vibe_dog/status/18273918237',
      category: 'Video Guide',
      points: 10,
      status: 'APPROVED',
      date: '2h ago'
    },
    {
      id: 2,
      user: 'degen.vibe',
      url: 'https://x.com/vibe_dog/status/18273999999',
      category: 'Written Guide',
      points: 5,
      status: 'PENDING',
      date: 'Just now'
    }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!postUrl.trim()) return;

    let p = 3;
    let catLabel = 'Meme / Reply (+3 Pts)';
    if (category === 'guide') { p = 5; catLabel = 'Written Guide (+5 Pts)'; }
    if (category === 'video') { p = 10; catLabel = 'Video Guide (+10 Pts)'; }

    const newSub = {
      id: Date.now(),
      user: player?.name ? `${player.name}.vibe` : 'Anon.vibe',
      url: postUrl,
      category: catLabel,
      points: p,
      status: 'PENDING',
      date: 'Just now'
    };

    setSubmissions([newSub, ...submissions]);
    setPostUrl('');
    setMessage('POST LINK SUBMITTED FOR ADMIN VERIFICATION!');
    setTimeout(() => setMessage(''), 4000);
  };

  const handleApprove = (id) => {
    setSubmissions(submissions.map(s => s.id === id ? { ...s, status: 'APPROVED' } : s));
  };

  const handleReject = (id) => {
    setSubmissions(submissions.map(s => s.id === id ? { ...s, status: 'REJECTED' } : s));
  };

  return (
    <div style={{ fontFamily: 'var(--vv-pixel)', color: '#fff', fontSize: '9px' }}>
      {/* Points Hierarchy Info Banner */}
      <div style={{
        background: 'rgba(255, 0, 127, 0.12)',
        border: '1px solid rgba(255, 0, 127, 0.4)',
        borderRadius: '8px',
        padding: '10px 14px',
        marginBottom: '16px'
      }}>
        <div style={{ color: '#ff007f', fontSize: '8px', marginBottom: '6px' }}>
          🏆 BARKING OFFICE QUEST REWARDS
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '7.5px', color: '#aaa' }}>
          <span>📹 Video Guide: <strong style={{ color: '#00ff88' }}>+10 Pts</strong></span>
          <span>📝 Written Guide: <strong style={{ color: '#00f5ff' }}>+5 Pts</strong></span>
          <span>💬 Meme / Reply: <strong style={{ color: '#ffd700' }}>+3 Pts</strong></span>
        </div>
      </div>

      {/* Submission Form Card */}
      <div style={{
        background: 'rgba(4, 20, 48, 0.95)',
        border: '2px solid #00f5ff',
        borderRadius: '10px',
        padding: '14px',
        marginBottom: '16px'
      }}>
        <div style={{ fontSize: '9px', color: '#ffd700', marginBottom: '10px' }}>
          SUBMIT X (TWITTER) POST LINK
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                fontFamily: 'var(--vv-pixel)',
                fontSize: '8px',
                background: '#020b1a',
                border: '1px solid rgba(0,245,255,0.4)',
                color: '#00f5ff',
                borderRadius: '4px',
                padding: '6px'
              }}
            >
              <option value="guide">Written Guide (+5 Pts)</option>
              <option value="video">Video Guide (+10 Pts)</option>
              <option value="meme">Meme / Reply (+3 Pts)</option>
            </select>
            <input
              type="url"
              placeholder="https://x.com/yourhandle/status/..."
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
              required
              style={{
                flex: 1,
                fontFamily: 'var(--vv-pixel)',
                fontSize: '8px',
                background: '#020b1a',
                border: '1px solid rgba(0,245,255,0.4)',
                color: '#fff',
                borderRadius: '4px',
                padding: '6px 10px'
              }}
            />
            <button
              type="submit"
              style={{
                fontFamily: 'var(--vv-pixel)',
                fontSize: '8px',
                background: 'linear-gradient(135deg, #00f5ff, #0050ff)',
                border: '1px solid #fff',
                color: '#fff',
                borderRadius: '4px',
                padding: '6px 12px',
                cursor: 'pointer'
              }}
            >
              SUBMIT
            </button>
          </div>
        </form>
        {message && <div style={{ marginTop: '8px', color: '#00ff88', fontSize: '7.5px' }}>{message}</div>}
      </div>

      {/* Submissions List */}
      <div style={{ background: 'rgba(2, 11, 26, 0.8)', border: '1px solid rgba(0, 245, 255, 0.2)', borderRadius: '8px', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ color: '#aaa', fontSize: '7.5px' }}>SUBMISSIONS & MODERATION</span>
          {isAdmin && <span style={{ color: '#ffd700', fontSize: '7px', background: 'rgba(255,215,0,0.15)', padding: '2px 6px', borderRadius: '3px' }}>👑 ADMIN MODE</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {submissions.map((sub) => (
            <div
              key={sub.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '6px'
              }}
            >
              <div>
                <div style={{ color: '#00f5ff', fontSize: '8px', marginBottom: '2px' }}>
                  {sub.user} · <span style={{ color: '#ffd700' }}>{sub.category}</span>
                </div>
                <a
                  href={sub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#aaa', fontSize: '7px', textDecoration: 'underline' }}
                >
                  {sub.url.substring(0, 42)}...
                </a>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '7.5px',
                  padding: '3px 6px',
                  borderRadius: '3px',
                  background: sub.status === 'APPROVED' ? 'rgba(0,255,136,0.15)' : sub.status === 'REJECTED' ? 'rgba(255,0,127,0.15)' : 'rgba(255,215,0,0.15)',
                  color: sub.status === 'APPROVED' ? '#00ff88' : sub.status === 'REJECTED' ? '#ff007f' : '#ffd700'
                }}>
                  {sub.status}
                </span>

                {isAdmin && sub.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleApprove(sub.id)}
                      style={{
                        fontFamily: 'var(--vv-pixel)',
                        fontSize: '7px',
                        background: '#00ff88',
                        color: '#000',
                        border: 'none',
                        borderRadius: '3px',
                        padding: '3px 6px',
                        cursor: 'pointer'
                      }}
                    >
                      ✓ APPROVE
                    </button>
                    <button
                      onClick={() => handleReject(sub.id)}
                      style={{
                        fontFamily: 'var(--vv-pixel)',
                        fontSize: '7px',
                        background: '#ff007f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '3px',
                        padding: '3px 6px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕ REJECT
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
