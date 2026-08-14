const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function remove3TreesFromBg() {
  const mapBgPath = "C:/Users/builder/Desktop/vibe/frontend/public/map-bg.jpg";

  console.log('Loading map-bg.jpg to remove Trees 1, 2, and 3...');
  const bgImg = await Jimp.read(mapBgPath);
  const W = bgImg.bitmap.width;
  const H = bgImg.bitmap.height;

  // Sample clean grass patch from map (around x: 48%, y: 55%)
  const sampleX = Math.floor(0.48 * W);
  const sampleY = Math.floor(0.55 * H);
  const patchW = 32;
  const patchH = 32;
  const grassPatch = bgImg.clone().crop({ x: sampleX, y: sampleY, w: patchW, h: patchH });

  // Define exact pixel regions for Trees 1, 2, and 3
  const treesToRemove = [
    // Tree 1: Near Home / Poster Office (x: ~42%, y: ~40%)
    { name: 'Tree 1', x: Math.floor(0.415 * W), y: Math.floor(0.39 * H), w: Math.floor(0.06 * W), h: Math.floor(0.12 * H) },
    // Tree 2: Near Leaderboard / Holders Zone (x: ~68%, y: ~53%)
    { name: 'Tree 2', x: Math.floor(0.68 * W),  y: Math.floor(0.53 * H), w: Math.floor(0.06 * W), h: Math.floor(0.12 * H) },
    // Tree 3: Near Holders Zone bottom right (x: ~71%, y: ~65%)
    { name: 'Tree 3', x: Math.floor(0.71 * W),  y: Math.floor(0.65 * H), w: Math.floor(0.065 * W), h: Math.floor(0.13 * H) }
  ];

  for (const tree of treesToRemove) {
    console.log(`Blitting clean grass over ${tree.name} (x=${tree.x}, y=${tree.y}, w=${tree.w}, h=${tree.h})...`);
    for (let x = tree.x; x < tree.x + tree.w; x += patchW) {
      for (let y = tree.y; y < tree.y + tree.h; y += patchH) {
        const blitW = Math.min(patchW, tree.x + tree.w - x);
        const blitH = Math.min(patchH, tree.y + tree.h - y);
        bgImg.blit({ src: grassPatch, x, y, srcX: 0, srcY: 0, srcW: blitW, srcH: blitH });
      }
    }
  }

  await bgImg.write(mapBgPath);
  console.log(`Successfully updated ${mapBgPath} without Trees 1, 2, and 3!`);
}

remove3TreesFromBg().catch(console.error);
