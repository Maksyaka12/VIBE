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
    <div style={{ fontFamily: 'var(--vv-pixel)', color: '#fff', fontSize: '11px' }}>
      {/* Points Hierarchy Info Banner */}
      <div style={{
        background: 'rgba(255, 0, 127, 0.15)',
        border: '1.5px solid rgba(255, 0, 127, 0.5)',
        borderRadius: '10px',
        padding: '14px 18px',
        marginBottom: '20px',
        boxShadow: '0 4px 16px rgba(255, 0, 127, 0.2)'
      }}>
        <div style={{ color: '#ff007f', fontSize: '12px', marginBottom: '8px', letterSpacing: '0.5px' }}>
          🏆 BARKING OFFICE QUEST REWARDS
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '10px', color: '#aaa', flexWrap: 'wrap' }}>
          <span>📹 Video Guide: <strong style={{ color: '#00ff88' }}>+10 Pts</strong></span>
          <span>📝 Written Guide: <strong style={{ color: '#00f5ff' }}>+5 Pts</strong></span>
          <span>💬 Meme / Reply: <strong style={{ color: '#ffd700' }}>+3 Pts</strong></span>
        </div>
      </div>

      {/* Submission Form Card */}
      <div style={{
        background: 'rgba(4, 20, 48, 0.95)',
        border: '2px solid #00f5ff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.6)'
      }}>
        <div style={{ fontSize: '12px', color: '#ffd700', marginBottom: '14px', letterSpacing: '0.5px' }}>
          SUBMIT X (TWITTER) POST LINK
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                fontFamily: 'var(--vv-pixel)',
                fontSize: '10px',
                background: '#020b1a',
                border: '1.5px solid rgba(0,245,255,0.4)',
                color: '#00f5ff',
                borderRadius: '6px',
                padding: '10px 12px'
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
                minWidth: '220px',
                fontFamily: 'var(--vv-pixel)',
                fontSize: '10px',
                background: '#020b1a',
                border: '1.5px solid rgba(0,245,255,0.4)',
                color: '#fff',
                borderRadius: '6px',
                padding: '10px 14px'
              }}
            />
            <button
              type="submit"
              style={{
                fontFamily: 'var(--vv-pixel)',
                fontSize: '10px',
                background: 'linear-gradient(135deg, #00f5ff, #0050ff)',
                border: '2px solid #fff',
                color: '#fff',
                fontWeight: 900,
                borderRadius: '6px',
                padding: '10px 18px',
                cursor: 'pointer',
                boxShadow: '0 3px 0 #002288'
              }}
            >
              SUBMIT
            </button>
          </div>
        </form>
        {message && <div style={{ marginTop: '10px', color: '#00ff88', fontSize: '10px', fontWeight: 900 }}>{message}</div>}
      </div>

      {/* Submissions List */}
      <div style={{ background: 'rgba(2, 11, 26, 0.85)', border: '1.5px solid rgba(0, 245, 255, 0.3)', borderRadius: '10px', padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ color: '#aaa', fontSize: '10px', letterSpacing: '0.5px' }}>SUBMISSIONS & MODERATION</span>
          {isAdmin && <span style={{ color: '#ffd700', fontSize: '9px', background: 'rgba(255,215,0,0.15)', padding: '4px 8px', borderRadius: '4px', fontWeight: 900 }}>👑 ADMIN MODE</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {submissions.map((sub) => (
            <div
              key={sub.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px'
              }}
            >
              <div>
                <div style={{ color: '#00f5ff', fontSize: '11px', marginBottom: '4px', fontWeight: 900 }}>
                  {sub.user} · <span style={{ color: '#ffd700' }}>{sub.category}</span>
                </div>
                <a
                  href={sub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#aaa', fontSize: '9px', textDecoration: 'underline' }}
                >
                  {sub.url.substring(0, 50)}...
                </a>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  fontSize: '10px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: 900,
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
