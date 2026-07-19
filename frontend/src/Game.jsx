import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

const PIXEL_SIZE = 5;
const GROUND_Y = 220;
const CANVAS_W = 800;
const CANVAS_H = 300;
const JUMP_FORCE = -12.5;
const GRAVITY = 0.65;
const SPEED_START = 5.5;

// Pixel Art Sprites (W=White, B=Black, C=Blue, G=Green, O=Bone)
const SPRITES = {
  dog1: [
    "   BB     ",
    "  BWWBB   ",
    " BBWBBWB  ",
    " BWWWWWB  ",
    "  BCCCB   ",
    "  BWWWBBBB",
    " BWWWWWWWB",
    " BWWWWWWWB",
    " BW B B WWB",
    " BW B B WWB",
    " BB   BB  "
  ],
  dog2: [
    "   BB     ",
    "  BWWBB   ",
    " BBWBBWB  ",
    " BWWWWWB  ",
    "  BCCCB   ",
    "  BWWWBBBB",
    " BWWWWWWWB",
    " BWWWWWWWB",
    " B W B BW B",
    " BB  BB BB "
  ],
  bone: [
    " BB BB ",
    "BOOOOOB",
    " BB BB "
  ],
  cactus: [
    "  B  B ",
    " BGBBGB",
    " BGGGGB",
    " BGGGGB",
    "  BGGB ",
    "  BGGB ",
    "  BGGB ",
    "  BGGB "
  ]
};

function getSpriteDims(sprite) {
  return { w: sprite[0].length * PIXEL_SIZE, h: sprite.length * PIXEL_SIZE };
}

export default function Game() {
  const canvasRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Game state refs to avoid stale closures
  const state = useRef({
    dogY: GROUND_Y,
    yVel: 0,
    isJumping: false,
    items: [], // { type: 'bone'|'cactus', x, y, collected? }
    speed: SPEED_START,
    frameCount: 0,
    score: 0
  });

  const animRef = useRef();

  const resetGame = () => {
    state.current = {
      dogY: GROUND_Y,
      yVel: 0,
      isJumping: false,
      items: [],
      speed: SPEED_START,
      frameCount: 0,
      score: 0
    };
    setScore(0);
    setGameOver(false);
    setPlaying(true);
  };

  const jump = () => {
    if (!playing || gameOver) {
      if (gameOver) resetGame();
      else setPlaying(true);
      return;
    }
    if (!state.current.isJumping) {
      state.current.yVel = JUMP_FORCE;
      state.current.isJumping = true;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playing, gameOver]);

  // Main Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const drawSprite = (spriteName, x, y) => {
      const sprite = SPRITES[spriteName];
      for (let r = 0; r < sprite.length; r++) {
        for (let c = 0; c < sprite[r].length; c++) {
          const char = sprite[r][c];
          if (char === ' ') continue;
          if (char === 'W') ctx.fillStyle = '#ffffff';
          else if (char === 'B') ctx.fillStyle = '#000000';
          else if (char === 'C') ctx.fillStyle = '#0000FF'; // VIBE blue
          else if (char === 'G') ctx.fillStyle = '#10B981'; // Cactus green
          else if (char === 'O') ctx.fillStyle = '#ffffff'; // Bone white
          
          ctx.fillRect(x + c * PIXEL_SIZE, y + r * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Sky/Bg
      ctx.fillStyle = '#BEF1FF'; // Match the blue bg
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Ground
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, GROUND_Y + getSpriteDims(SPRITES.dog1).h, CANVAS_W, 4);

      if (!playing) {
        ctx.fillStyle = '#111';
        ctx.font = 'bold 24px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE or TAP to play', CANVAS_W / 2, CANVAS_H / 2);
        
        // Draw static dog
        drawSprite('dog1', 100, GROUND_Y);
        return;
      }

      if (gameOver) {
        ctx.fillStyle = '#111';
        ctx.font = 'bold 36px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 20);
        ctx.font = 'bold 20px "Courier New", monospace';
        ctx.fillText(`Score: ${state.current.score}`, CANVAS_W / 2, CANVAS_H / 2 + 20);
        ctx.fillText('Tap to restart', CANVAS_W / 2, CANVAS_H / 2 + 60);
        drawSprite('dog1', 100, state.current.dogY); // dog in air or ground
        return;
      }

      // Physics
      const s = state.current;
      s.dogY += s.yVel;
      s.yVel += GRAVITY;
      
      if (s.dogY >= GROUND_Y) {
        s.dogY = GROUND_Y;
        s.isJumping = false;
        s.yVel = 0;
      }

      // Spawning
      s.frameCount++;
      if (s.frameCount % Math.max(50, 100 - Math.floor(s.speed * 4)) === 0) {
        // Randomly spawn bone or cactus
        const isBone = Math.random() > 0.45;
        if (isBone) {
          s.items.push({ type: 'bone', x: CANVAS_W, y: GROUND_Y - 40 - Math.random() * 60, collected: false });
        } else {
          s.items.push({ type: 'cactus', x: CANVAS_W, y: GROUND_Y + 15, collected: false }); // slightly offset to touch ground
        }
        
        s.speed += 0.02; // slowly increase speed
      }

      // Update & Draw items
      const dogBox = { x: 100, y: s.dogY, w: getSpriteDims(SPRITES.dog1).w, h: getSpriteDims(SPRITES.dog1).h };

      for (let i = s.items.length - 1; i >= 0; i--) {
        const item = s.items[i];
        item.x -= s.speed;

        if (item.x < -100) {
          s.items.splice(i, 1);
          continue;
        }

        const dims = getSpriteDims(SPRITES[item.type]);
        const itemBox = { x: item.x, y: item.y, w: dims.w, h: dims.h };

        // Collision logic
        if (!item.collected) {
          const overlapX = dogBox.x < itemBox.x + itemBox.w && dogBox.x + dogBox.w > itemBox.x;
          const overlapY = dogBox.y < itemBox.y + itemBox.h && dogBox.y + dogBox.h > itemBox.y;
          
          if (overlapX && overlapY) {
            // tight hitboxes
            const tightOverlapX = dogBox.x + 8 < itemBox.x + itemBox.w - 5 && dogBox.x + dogBox.w - 8 > itemBox.x + 5;
            const tightOverlapY = dogBox.y + 8 < itemBox.y + itemBox.h - 5 && dogBox.y + dogBox.h - 8 > itemBox.y + 5;
            
            if (tightOverlapX && tightOverlapY) {
              if (item.type === 'bone') {
                item.collected = true;
                s.score += 1;
                setScore(s.score);
              } else if (item.type === 'cactus') {
                setGameOver(true);
              }
            }
          }
        }

        if (!item.collected) {
          drawSprite(item.type, item.x, item.y);
        }
      }

      // Draw Dog (animate legs if running)
      const dogSprite = (s.isJumping || Math.floor(s.frameCount / 6) % 2 === 0) ? 'dog1' : 'dog2';
      drawSprite(dogSprite, 100, s.dogY);

      // Draw UI Score
      ctx.fillStyle = '#111';
      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE: ${s.score}`, 20, 40);

      animRef.current = requestAnimationFrame(draw);
    };

    if (playing && !gameOver) {
      animRef.current = requestAnimationFrame(draw);
    } else {
      draw(); // Draw initial static screen
    }

    return () => cancelAnimationFrame(animRef.current);
  }, [playing, gameOver]);

  return (
    <section id="game" className="alt">
      <div className="wrap">
        <div className="sec-head">
          <h2><span className="bl">VIBE</span> Runner.</h2>
          <p className="sec-sub">Help the Base Dog collect bones and avoid obstacles. Press Space or tap to jump!</p>
        </div>
        
        <div 
          className="game-container" 
          onClick={jump}
          style={{
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            border: '2px solid var(--border)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            cursor: 'pointer',
            background: '#BEF1FF',
            position: 'relative'
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              imageRendering: 'pixelated'
            }}
          />
        </div>
      </div>
    </section>
  );
}
