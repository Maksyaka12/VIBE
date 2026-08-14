const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function fixTree3Precision() {
  // Source clean terrain image without buildings
  const cleanTerrainPath = "C:/Users/builder/.gemini/antigravity/brain/be1b603b-2161-4e2c-9125-ecbafbf2febb/vibe_verse_clean_terrain_exact_1786317288064.jpg";
  const targetBgPath = "C:/Users/builder/Desktop/vibe/frontend/public/map-bg.jpg";

  console.log(`Loading clean empty terrain...`);
  const bgImg = await Jimp.read(cleanTerrainPath);
  const W = bgImg.bitmap.width;
  const H = bgImg.bitmap.height;

  // Sample clean grass patch
  const sampleX = Math.floor(0.48 * W);
  const sampleY = Math.floor(0.55 * H);
  const patchW = 32;
  const patchH = 32;
  const grassPatch = bgImg.clone().crop({ x: sampleX, y: sampleY, w: patchW, h: patchH });

  // Tree 1 (near Home): Precision box
  const t1 = { x: Math.floor(0.415 * W), y: Math.floor(0.39 * H), w: Math.floor(0.055 * W), h: Math.floor(0.12 * H) };
  // Tree 2 (middle-right near Leaderboard): Precision box
  const t2 = { x: Math.floor(0.685 * W), y: Math.floor(0.53 * H), w: Math.floor(0.055 * W), h: Math.floor(0.12 * H) };
  // Tree 3 (bottom-right near Holders): PRECISE box targeted ONLY at Tree 3, preserving neighboring trees!
  const t3 = { x: Math.floor(0.725 * W), y: Math.floor(0.64 * H), w: Math.floor(0.048 * W), h: Math.floor(0.125 * H) };

  const treesToErase = [t1, t2, t3];

  for (const t of treesToErase) {
    for (let x = t.x; x < t.x + t.w; x += patchW) {
      for (let y = t.y; y < t.y + t.h; y += patchH) {
        const blitW = Math.min(patchW, t.x + t.w - x);
        const blitH = Math.min(patchH, t.y + t.h - y);
        bgImg.blit({ src: grassPatch, x, y, srcX: 0, srcY: 0, srcW: blitW, srcH: blitH });
      }
    }
  }

  await bgImg.write(targetBgPath);
  console.log(`Precision update complete for Tree 3 on ${targetBgPath}! Neighboring trees preserved!`);
}

fixTree3Precision().catch(console.error);
