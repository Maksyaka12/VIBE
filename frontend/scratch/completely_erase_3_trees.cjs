const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function completelyErase3Trees() {
  const mapBgPath = "C:/Users/builder/Desktop/vibe/frontend/public/map-bg.jpg";
  const sourceMapPath = "C:/Users/builder/Desktop/vibe/frontend/public/verse-map.jpg";

  console.log('Loading clean map background to completely erase all tree remnants...');
  // Start from verse-map.jpg to ensure a clean base
  const bgImg = await Jimp.read(sourceMapPath);
  const W = bgImg.bitmap.width;
  const H = bgImg.bitmap.height;

  // Sample clean grass patch from map (around x: 48%, y: 55%)
  const sampleX = Math.floor(0.48 * W);
  const sampleY = Math.floor(0.55 * H);
  const patchW = 40;
  const patchH = 40;
  const grassPatch = bgImg.clone().crop({ x: sampleX, y: sampleY, w: patchW, h: patchH });

  // Expanded bounding boxes to cover tree crowns, trunks, and shadows 100%
  const treesToRemove = [
    // Tree 1: Near Home / Poster Office / intersection
    { name: 'Tree 1', x: Math.floor(0.395 * W), y: Math.floor(0.36 * H), w: Math.floor(0.09 * W), h: Math.floor(0.16 * H) },
    // Tree 2: Near Leaderboard / Holders Zone middle right
    { name: 'Tree 2', x: Math.floor(0.665 * W), y: Math.floor(0.50 * H), w: Math.floor(0.09 * W), h: Math.floor(0.16 * H) },
    // Tree 3: Near Holders Zone bottom right
    { name: 'Tree 3', x: Math.floor(0.690 * W), y: Math.floor(0.63 * H), w: Math.floor(0.10 * W), h: Math.floor(0.17 * H) }
  ];

  for (const tree of treesToRemove) {
    console.log(`Blitting clean grass over expanded ${tree.name} region (x=${tree.x}, y=${tree.y}, w=${tree.w}, h=${tree.h})...`);
    for (let x = tree.x; x < tree.x + tree.w; x += patchW) {
      for (let y = tree.y; y < tree.y + tree.h; y += patchH) {
        const blitW = Math.min(patchW, tree.x + tree.w - x);
        const blitH = Math.min(patchH, tree.y + tree.h - y);
        bgImg.blit({ src: grassPatch, x, y, srcX: 0, srcY: 0, srcW: blitW, srcH: blitH });
      }
    }
  }

  await bgImg.write(mapBgPath);
  console.log(`Successfully updated ${mapBgPath} with 100% clean grass where Trees 1, 2, and 3 used to be!`);
}

completelyErase3Trees().catch(console.error);
