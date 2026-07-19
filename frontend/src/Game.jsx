import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

const PIXEL_SIZE = 4;
const GROUND_Y = 230;
const CANVAS_W = 800;
const CANVAS_H = 300;
const JUMP_FORCE = -12.5;
const GRAVITY = 0.65;
const SPEED_START = 5.5;

// Pixel Art Sprites
const SPRITES = {
  dog1: [
    "   WW                 ",
    "  WWWW      WWWWWW    ",
    " WDWWWW   WWWWWWWWWW  ",
    "  WWWW   WWWWWWWWWWWW ",
    "   WW   WWWWW B WWWWWB",
    "    W  WWWWWWWWWWWWWWW",
    "       WWDWWWWWWWWWWWW",
    "        WWWWWWWWWWWWP ",
    "         WWWWWWWWW    ",
    "         CCCCCCCCC    ",
    "       WWWWWWWWWWWWW  ",
    "    WWWWWWWWWWWWWWWWWW",
    "   WWDWWWWWWWWWWWWWWWW",
    "  WWWWWWWWWWWWWWWWWWWW",
    "  WWWWWWWWWWWWWWWWWWWW",
    "   WWWWWWWWWWWWWWWWWW ",
    "    WWWW          WWW ",
    "    WWW           WWW ",
    "    WDW           WDW ",
    "    WW            WW  "
  ],
  dog2: [
    "  WW                  ",
    " WWWWW      WWWWWW    ",
    "  WDWW    WWWWWWWWWW  ",
    "   WW    WWWWWWWWWWWW ",
    "    W   WWWWW B WWWWWB",
    "       WWWWWWWWWWWWWWW",
    "       WWDWWWWWWWWWWWW",
    "        WWWWWWWWWWWWP ",
    "         WWWWWWWWW    ",
    "         CCCCCCCCC    ",
    "       WWWWWWWWWWWWW  ",
    "    WWWWWWWWWWWWWWWWWW",
    "   WWDWWWWWWWWWWWWWWWW",
    "  WWWWWWWWWWWWWWWWWWWW",
    "  WWWWWWWWWWWWWWWWWWWW",
    "   WWWWWWWWWWWWWWWWWW ",
    "     WWWW        WWWW ",
    "      WWW         WWW ",
    "      WDW         WDW ",
    "       W           W  "
  ],
  bone: [
    " WW WW ",
    "WOOOOOW",
    " WW WW "
  ],
  cactus: [
    "  G  G ",
    " GGGGGG",
    " GGGGGG",
    " GGGGGG",
    "  GGGG ",
    "  GGGG ",
    "  GGGG ",
    "  GGGG "
  ]
};

function getSpriteDims(sprite) {
  return { w: sprite[0].length * PIXEL_SIZE, h: sprite.length * PIXEL_SIZE };
}

const formatScore = (score) => {
  const val = score * 10;
  if (val >= 1000) {
    return `$${(val / 1000).toFixed(val % 100 === 0 ? 0 : 1)}M MC`;
  }
  return `$${val}K MC`;
};

export default function Game() {
  const canvasRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const state = useRef({
    dogY: GROUND_Y - getSpriteDims(SPRITES.dog1).h,
    yVel: 0,
    isJumping: false,
    items: [],
    speed: SPEED_START,
    frameCount: 0,
    score: 0,
    bgX: 0
  });

  const animRef = useRef();

  const getDogGroundY = () => GROUND_Y - getSpriteDims(SPRITES.dog1).h;

  const resetGame = () => {
    state.current = {
      dogY: getDogGroundY(),
      yVel: 0,
      isJumping: false,
      items: [],
      speed: SPEED_START,
      frameCount: 0,
      score: 0,
      bgX: 0
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
          else if (char === 'C') ctx.fillStyle = '#0000FF'; // Blue collar
          else if (char === 'G') ctx.fillStyle = '#10B981'; // Cactus
          else if (char === 'O') ctx.fillStyle = '#e2e8f0'; // Bone inner
          else if (char === 'P') ctx.fillStyle = '#ff8a80'; // Tongue
          else if (char === 'D') ctx.fillStyle = '#e0e0e0'; // Fluff shade
          
          ctx.fillRect(x + c * PIXEL_SIZE, y + r * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
      }
    };

    const drawBackground = (s) => {
      // Sky gradient
      let grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      grad.addColorStop(0, '#4fc3f7');
      grad.addColorStop(1, '#e1f5fe');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Sun and rays
      ctx.save();
      ctx.translate(CANVAS_W / 2 + 100, 100);
      ctx.rotate(s.frameCount * 0.002);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let i = 0; i < 16; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(800, -30);
        ctx.lineTo(800, 30);
        ctx.fill();
        ctx.rotate((Math.PI * 2) / 16);
      }
      ctx.restore();

      ctx.fillStyle = '#FFD54F';
      ctx.beginPath();
      ctx.arc(CANVAS_W / 2 + 100, 100, 35, 0, Math.PI * 2);
      ctx.fill();

      // Mountains (Parallax 1)
      ctx.fillStyle = '#64b5f6';
      for (let i = 0; i < 4; i++) {
        let mx = ((s.bgX * 0.2) % 400) + i * 400 - 200;
        ctx.beginPath();
        ctx.moveTo(mx, GROUND_Y);
        ctx.lineTo(mx + 200, 80);
        ctx.lineTo(mx + 400, GROUND_Y);
        ctx.fill();
      }

      // Hills (Parallax 2)
      ctx.fillStyle = '#81c784';
      for (let i = 0; i < 4; i++) {
        let hx = ((s.bgX * 0.5) % 400) + i * 400 - 200;
        ctx.beginPath();
        ctx.moveTo(hx, GROUND_Y);
        ctx.quadraticCurveTo(hx + 200, 140, hx + 400, GROUND_Y);
        ctx.fill();
      }
      
      // Front Hills (Parallax 3)
      ctx.fillStyle = '#aed581';
      for (let i = 0; i < 4; i++) {
        let hx = ((s.bgX * 0.8) % 400) + i * 400 - 400;
        ctx.beginPath();
        ctx.moveTo(hx, GROUND_Y);
        ctx.quadraticCurveTo(hx + 200, 170, hx + 400, GROUND_Y);
        ctx.fill();
      }

      // Ground Base
      ctx.fillStyle = '#7cb342';
      ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);

      // Dirt Path
      ctx.fillStyle = '#bcaaa4';
      ctx.fillRect(0, GROUND_Y + 15, CANVAS_W, 25);
    };

    const draw = () => {
      const s = state.current;
      
      if (playing && !gameOver) {
        s.bgX -= s.speed;
      }
      
      drawBackground(s);

      if (!playing) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE or TAP to play', CANVAS_W / 2, CANVAS_H / 2);
        ctx.font = '16px "Inter", sans-serif';
        ctx.fillText('Help $VIBE reach $100M MC!', CANVAS_W / 2, CANVAS_H / 2 + 30);
        
        drawSprite('dog1', 100, getDogGroundY());
        return;
      }

      if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 20);
        ctx.fillStyle = '#FFD54F';
        ctx.font = 'bold 24px "Inter", sans-serif';
        ctx.fillText(`Market Cap Reached: ${formatScore(s.score)}`, CANVAS_W / 2, CANVAS_H / 2 + 20);
        ctx.fillStyle = '#fff';
        ctx.font = '16px "Inter", sans-serif';
        ctx.fillText('Tap to try again', CANVAS_W / 2, CANVAS_H / 2 + 60);
        
        drawSprite('dog1', 100, s.dogY);
        return;
      }

      // Physics
      s.dogY += s.yVel;
      s.yVel += GRAVITY;
      
      if (s.dogY >= getDogGroundY()) {
        s.dogY = getDogGroundY();
        s.isJumping = false;
        s.yVel = 0;
      }

      // Spawning
      s.frameCount++;
      if (s.frameCount % Math.max(50, 100 - Math.floor(s.speed * 4)) === 0) {
        const isBone = Math.random() > 0.45;
        if (isBone) {
          s.items.push({ type: 'bone', x: CANVAS_W, y: GROUND_Y - 80 - Math.random() * 40, collected: false });
        } else {
          s.items.push({ type: 'cactus', x: CANVAS_W, y: GROUND_Y - getSpriteDims(SPRITES.cactus).h + 20, collected: false });
        }
        s.speed += 0.02;
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

        // Collision
        if (!item.collected) {
          const overlapX = dogBox.x < itemBox.x + itemBox.w && dogBox.x + dogBox.w > itemBox.x;
          const overlapY = dogBox.y < itemBox.y + itemBox.h && dogBox.y + dogBox.h > itemBox.y;
          
          if (overlapX && overlapY) {
            const tightOverlapX = dogBox.x + 10 < itemBox.x + itemBox.w - 5 && dogBox.x + dogBox.w - 10 > itemBox.x + 5;
            const tightOverlapY = dogBox.y + 10 < itemBox.y + itemBox.h - 5 && dogBox.y + dogBox.h - 10 > itemBox.y + 5;
            
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

      // Draw Dog
      const dogSprite = (s.isJumping || Math.floor(s.frameCount / 6) % 2 === 0) ? 'dog1' : 'dog2';
      drawSprite(dogSprite, 100, s.dogY);

      // Draw UI Score
      ctx.fillStyle = '#111';
      ctx.font = 'bold 24px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${formatScore(s.score)}`, 20, 40);

      // Goal UI
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = 'bold 16px "Inter", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Goal: $100M MC`, CANVAS_W - 20, 40);

      animRef.current = requestAnimationFrame(draw);
    };

    if (playing && !gameOver) {
      animRef.current = requestAnimationFrame(draw);
    } else {
      draw();
    }

    return () => cancelAnimationFrame(animRef.current);
  }, [playing, gameOver]);

  return (
    <section id="game" className="alt">
      <div className="wrap">
        <div className="sec-head">
          <h2><span className="bl">VIBE</span> Runner.</h2>
          <p className="sec-sub">Help the Base Dog collect bones and reach $100M Market Cap. Press Space or tap to jump!</p>
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
            boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
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
