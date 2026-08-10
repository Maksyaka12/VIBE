import React, { useRef, useEffect, useState } from 'react';

const WALK_FRAMES = 4;
const FRAME_MS    = 110;

/** Remove near-black pixels from ImageData (in-place) */
function removeBlackBg(data) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const brightness = (r + g + b) / 3;
    if (brightness < 20) {
      data[i + 3] = 0;
    } else if (brightness < 55) {
      data[i + 3] = Math.round((brightness / 55) * 255);
    }
  }
}

function loadTransparentImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const d = ctx.getImageData(0, 0, c.width, c.height);
        removeBlackBg(d.data);
        ctx.putImageData(d, 0, 0);
      } catch (e) { /* CORS fallback */ }
      resolve(c);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * direction: 'down' | 'up' | 'left' | 'right'
 * walking: boolean
 *
 * Sprite map:
 *   down  idle  → vibe-dog-idle.jpg      (front facing)
 *   up    idle  → vibe-dog-back.jpg      (back view)
 *   side  idle  → vibe-dog-side.jpg      (right profile; flip for left)
 *   down  walk  → vibe-dog-walk.jpg      (4-frame front walk)
 *   up    walk  → vibe-dog-walk-back.jpg (4-frame back walk)
 *   side  walk  → vibe-dog-walk-side.jpg (4-frame side walk; flip for left)
 */
export default function DogSprite({ walking = false, direction = 'down' }) {
  const canvasRef  = useRef(null);
  const spritesRef = useRef({});   // { frontIdle, backIdle, sideIdle, frontWalk, backWalk, sideWalk }
  const frameRef   = useRef(0);
  const timerRef   = useRef(null);

  // Mutable refs to avoid stale closure in interval
  const walkingRef   = useRef(walking);
  const directionRef = useRef(direction);
  walkingRef.current   = walking;
  directionRef.current = direction;

  const [ready, setReady] = useState(false);

  // ── Load all sprites once ──
  useEffect(() => {
    Promise.all([
      loadTransparentImage('/vibe-dog-idle.jpg'),
      loadTransparentImage('/vibe-dog-back.jpg'),
      loadTransparentImage('/vibe-dog-side.jpg'),
      loadTransparentImage('/vibe-dog-walk.jpg'),
      loadTransparentImage('/vibe-dog-walk-back.jpg'),
      loadTransparentImage('/vibe-dog-walk-side.jpg'),
      loadTransparentImage('/vibe-dog-walk-side2.jpg'),
    ]).then(([frontIdle, backIdle, sideIdle, frontWalk, backWalk, sideWalk, sideWalkLeft]) => {
      spritesRef.current = { frontIdle, backIdle, sideIdle, frontWalk, backWalk, sideWalk, sideWalkLeft };
      setReady(true);
    });
  }, []);

  // ── Draw & animate ──
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const s = spritesRef.current;

    function getCurrentSprites() {
      const dir = directionRef.current;
      const walk = walkingRef.current;
      const isSide = dir === 'left' || dir === 'right';
      if (!walk) {
        return {
          img:    isSide ? s.sideIdle  : dir === 'up' ? s.backIdle  : s.frontIdle,
          frames: 1,
        };
      }
      // Use pre-flipped sprite for left direction
      if (dir === 'left') {
        return { img: s.sideWalkLeft, frames: WALK_FRAMES };
      }
      return {
        img:    isSide ? s.sideWalk : dir === 'up' ? s.backWalk : s.frontWalk,
        frames: WALK_FRAMES,
      };
    }

    function drawFrame() {
      ctx.clearRect(0, 0, W, H);
      const { img, frames } = getCurrentSprites();
      if (!img) return;

      if (frames === 1) {
        ctx.drawImage(img, 0, 0, W, H);
      } else {
        const fw = Math.floor(img.width / frames);
        const f  = frameRef.current % frames;
        ctx.drawImage(img, f * fw, 0, fw, img.height, 0, 0, W, H);
      }
    }

    function stopAnim() {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      frameRef.current = 0;
    }

    function startAnim() {
      if (timerRef.current) return;
      timerRef.current = setInterval(() => {
        if (!walkingRef.current) { stopAnim(); drawFrame(); return; }
        frameRef.current = (frameRef.current + 1) % WALK_FRAMES;
        drawFrame();
      }, FRAME_MS);
    }

    drawFrame();
    if (walking) startAnim(); else stopAnim();
    return () => stopAnim();
  // Re-run when walking state changes (direction changes are handled via ref in interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, walking]);

  // Flip horizontally when idling left (side idle sprite is right-facing)
  const flipX = direction === 'left' && !walking;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        width={72}
        height={72}
        className={walking ? 'dog-canvas-walk' : 'dog-canvas-idle'}
        style={{
          display: 'block',
          transform: flipX ? 'scaleX(-1)' : 'scaleX(1)',
          transformOrigin: 'center center',
          filter: 'drop-shadow(0 0 7px rgba(0,245,255,0.75)) drop-shadow(0 3px 6px rgba(0,0,0,0.6))',
          imageRendering: 'crisp-edges',
        }}
      />
    </div>
  );
}
