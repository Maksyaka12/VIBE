const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function prepareLayers() {
  const mapPath = "C:/Users/builder/Desktop/vibe/frontend/public/verse-map.jpg";
  const publicDir = "C:/Users/builder/Desktop/vibe/frontend/public";

  console.log('Loading original verse-map.jpg...');
  const mapImg = await Jimp.read(mapPath);
  const W = mapImg.bitmap.width;
  const H = mapImg.bitmap.height;
  console.log(`Original map dimensions: ${W}x${H}`);

  // 1. Extract Roads Layer (map-roads.png)
  const roadsImg = mapImg.clone();
  roadsImg.scan(0, 0, W, H, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    // Detect dirt road pixels (golden sand/orange-brown hue)
    const isDirtRoad = (r > 160 && g > 110 && g < r && b < 110 && (r - b) > 60) ||
                       (r > 190 && g > 130 && b < 120);

    if (isDirtRoad) {
      // Keep road pixel
      this.bitmap.data[idx + 3] = 255;
    } else {
      // Make non-road pixel transparent
      this.bitmap.data[idx + 3] = 0;
    }
  });

  const roadsPath = path.join(publicDir, "map-roads.png");
  await roadsImg.write(roadsPath);
  console.log(`Saved extracted roads layer to ${roadsPath}`);

  // 2. Create Clean Background Terrain Layer (map-bg.jpg)
  // Fill building areas with clean grass texture from neighboring grass areas
  const bgImg = mapImg.clone();

  // Define building bounding boxes on original map to replace with grass
  const zonesToClean = [
    { name: 'arena',       x: 0.20, y: 0.08, w: 0.20, h: 0.28 },
    { name: 'poster',      x: 0.40, y: 0.12, w: 0.18, h: 0.24 },
    { name: 'defi',        x: 0.64, y: 0.12, w: 0.18, h: 0.24 },
    { name: 'bank',        x: 0.15, y: 0.32, w: 0.18, h: 0.26 },
    { name: 'home',        x: 0.42, y: 0.35, w: 0.16, h: 0.24 },
    { name: 'leaderboard', x: 0.64, y: 0.40, w: 0.18, h: 0.24 },
    { name: 'holders',     x: 0.58, y: 0.52, w: 0.18, h: 0.24 },
    { name: 'nft_mint',    x: 0.20, y: 0.50, w: 0.18, h: 0.24 }
  ];

  // Sample clean grass tile from map (around x: 50%, y: 55%)
  const sampleGrassX = Math.floor(0.48 * W);
  const sampleGrassY = Math.floor(0.55 * H);
  const patchW = 40;
  const patchH = 40;
  const grassPatch = mapImg.clone().crop({ x: sampleGrassX, y: sampleGrassY, w: patchW, h: patchH });

  // Blit grass texture over building areas to create clean background
  for (const zone of zonesToClean) {
    const startX = Math.floor(zone.x * W);
    const startY = Math.floor(zone.y * H);
    const zoneW = Math.floor(zone.w * W);
    const zoneH = Math.floor(zone.h * H);

    for (let x = startX; x < startX + zoneW; x += patchW) {
      for (let y = startY; y < startY + zoneH; y += patchH) {
        const blitW = Math.min(patchW, startX + zoneW - x);
        const blitH = Math.min(patchH, startY + zoneH - y);
        bgImg.blit({ src: grassPatch, x, y, srcX: 0, srcY: 0, srcW: blitW, srcH: blitH });
      }
    }
  }

  const bgPath = path.join(publicDir, "map-bg.jpg");
  await bgImg.write(bgPath);
  console.log(`Saved clean background terrain layer to ${bgPath}`);
}

prepareLayers().catch(console.error);
