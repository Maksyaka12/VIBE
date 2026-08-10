const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function erase3TreesFromCleanTerrain() {
  // Use the clean empty island image (WITHOUT buildings!)
  const cleanTerrainPath = "C:/Users/builder/.gemini/antigravity/brain/be1b603b-2161-4e2c-9125-ecbafbf2febb/vibe_verse_clean_terrain_exact_1786317288064.jpg";
  const targetBgPath = "C:/Users/builder/Desktop/vibe/frontend/public/map-bg.jpg";

  console.log(`Loading clean empty terrain (WITHOUT buildings): ${cleanTerrainPath}`);
  const bgImg = await Jimp.read(cleanTerrainPath);
  const W = bgImg.bitmap.width;
  const H = bgImg.bitmap.height;

  // Sample clean grass patch from map (around x: 48%, y: 55%)
  const sampleX = Math.floor(0.48 * W);
  const sampleY = Math.floor(0.55 * H);
  const patchW = 40;
  const patchH = 40;
  const grassPatch = bgImg.clone().crop({ x: sampleX, y: sampleY, w: patchW, h: patchH });

  // Regions for Trees 1, 2, and 3
  const treesToRemove = [
    // Tree 1: Near Home / Poster Office / intersection
    { name: 'Tree 1', x: Math.floor(0.395 * W), y: Math.floor(0.36 * H), w: Math.floor(0.09 * W), h: Math.floor(0.16 * H) },
    // Tree 2: Near Leaderboard / Holders Zone middle right
    { name: 'Tree 2', x: Math.floor(0.665 * W), y: Math.floor(0.50 * H), w: Math.floor(0.09 * W), h: Math.floor(0.16 * H) },
    // Tree 3: Near Holders Zone bottom right
    { name: 'Tree 3', x: Math.floor(0.690 * W), y: Math.floor(0.63 * H), w: Math.floor(0.10 * W), h: Math.floor(0.17 * H) }
  ];

  for (const tree of treesToRemove) {
    console.log(`Blitting clean grass over ${tree.name} on empty terrain...`);
    for (let x = tree.x; x < tree.x + tree.w; x += patchW) {
      for (let y = tree.y; y < tree.y + tree.h; y += patchH) {
        const blitW = Math.min(patchW, tree.x + tree.w - x);
        const blitH = Math.min(patchH, tree.y + tree.h - y);
        bgImg.blit({ src: grassPatch, x, y, srcX: 0, srcY: 0, srcW: blitW, srcH: blitH });
      }
    }
  }

  await bgImg.write(targetBgPath);
  console.log(`Successfully deployed clean empty terrain WITHOUT BUILDINGS to ${targetBgPath}!`);
}

erase3TreesFromCleanTerrain().catch(console.error);
