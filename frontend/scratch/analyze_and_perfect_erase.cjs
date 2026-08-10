const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function analyzeAndPerfectErase() {
  const sourceMapPath = "C:/Users/builder/.gemini/antigravity/brain/be1b603b-2161-4e2c-9125-ecbafbf2febb/vibe_verse_clean_terrain_exact_1786317288064.jpg";
  const targetBgPath = "C:/Users/builder/Desktop/vibe/frontend/public/map-bg.jpg";

  console.log(`Loading clean empty island map (WITHOUT BUILDINGS): ${sourceMapPath}`);
  const bgImg = await Jimp.read(sourceMapPath);
  const W = bgImg.bitmap.width;
  const H = bgImg.bitmap.height;

  // Sample clean grass tile from map (around x: 48%, y: 55%)
  const sampleX = Math.floor(0.48 * W);
  const sampleY = Math.floor(0.55 * H);
  const patchW = 32;
  const patchH = 32;
  const grassPatch = bgImg.clone().crop({ x: sampleX, y: sampleY, w: patchW, h: patchH });

  // Define search regions for Trees 1, 2, and 3
  const regions = [
    // Tree 1: Near Home / Poster Office / vertical road (x: 40%..47%, y: 35%..50%)
    { name: 'Tree 1', minX: Math.floor(0.40 * W), maxX: Math.floor(0.46 * W), minY: Math.floor(0.35 * H), maxY: Math.floor(0.50 * H) },

    // Tree 2: Middle right near Leaderboard (x: 67%..73%, y: 50%..63%)
    { name: 'Tree 2', minX: Math.floor(0.67 * W), maxX: Math.floor(0.74 * W), minY: Math.floor(0.50 * H), maxY: Math.floor(0.63 * H) },

    // Tree 3: Bottom right near Holders Zone (x: 70%..77%, y: 62%..78%)
    { name: 'Tree 3', minX: Math.floor(0.70 * W), maxX: Math.floor(0.77 * W), minY: Math.floor(0.62 * H), maxY: Math.floor(0.78 * H) }
  ];

  for (const reg of regions) {
    console.log(`Clearing ${reg.name} region (x: ${reg.minX}..${reg.maxX}, y: ${reg.minY}..${reg.maxY})...`);
    for (let x = reg.minX; x < reg.maxX; x += patchW) {
      for (let y = reg.minY; y < reg.maxY; y += patchH) {
        const blitW = Math.min(patchW, reg.maxX - x);
        const blitH = Math.min(patchH, reg.maxY - y);
        bgImg.blit({ src: grassPatch, x, y, srcX: 0, srcY: 0, srcW: blitW, srcH: blitH });
      }
    }
  }

  await bgImg.write(targetBgPath);
  console.log(`Perfect erasure complete! Saved clean map-bg.jpg to ${targetBgPath}`);
}

analyzeAndPerfectErase().catch(console.error);
