const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function superCleanErase() {
  const sourceMapPath = "C:/Users/builder/.gemini/antigravity/brain/be1b603b-2161-4e2c-9125-ecbafbf2febb/vibe_verse_clean_terrain_exact_1786317288064.jpg";
  const targetBgPath = "C:/Users/builder/Desktop/vibe/frontend/public/map-bg.jpg";

  console.log('Loading clean empty island map...');
  const bgImg = await Jimp.read(sourceMapPath);
  const W = bgImg.bitmap.width;
  const H = bgImg.bitmap.height;

  // Sample clean bright grass color from map (x: 48%, y: 55%)
  const sampleX = Math.floor(0.48 * W);
  const sampleY = Math.floor(0.55 * H);
  const sampleR = bgImg.bitmap.data[(sampleY * W + sampleX) * 4 + 0];
  const sampleG = bgImg.bitmap.data[(sampleY * W + sampleX) * 4 + 1];
  const sampleB = bgImg.bitmap.data[(sampleY * W + sampleX) * 4 + 2];

  console.log(`Sample grass color: R=${sampleR}, G=${sampleG}, B=${sampleB}`);

  // Define search boxes around Trees 1, 2, 3
  const searchBoxes = [
    // Tree 1: Above Home / next to vertical road (x: 43%..48%, y: 38%..52%)
    { name: 'Tree 1', x1: Math.floor(0.43 * W), x2: Math.floor(0.485 * W), y1: Math.floor(0.38 * H), y2: Math.floor(0.52 * H) },
    // Tree 2: Next to Leaderboard (x: 68%..75%, y: 48%..62%)
    { name: 'Tree 2', x1: Math.floor(0.68 * W), x2: Math.floor(0.75 * W), y1: Math.floor(0.48 * H), y2: Math.floor(0.62 * H) },
    // Tree 3: Next to Holders Zone (x: 70%..78%, y: 62%..78%)
    { name: 'Tree 3', x1: Math.floor(0.70 * W), x2: Math.floor(0.78 * W), y1: Math.floor(0.62 * H), y2: Math.floor(0.78 * H) }
  ];

  // Scan pixel-by-pixel in each box and replace any non-bright-grass pixel
  bgImg.scan(0, 0, W, H, function(x, y, idx) {
    let inAnyBox = false;
    for (const box of searchBoxes) {
      if (x >= box.x1 && x <= box.x2 && y >= box.y1 && y <= box.y2) {
        inAnyBox = true;
        break;
      }
    }

    if (inAnyBox) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];

      // Clean bright grass has G > 140 and G > R + 30
      const isBrightGrass = (g > 135 && g > (r + 25) && b < 100);

      // If not bright grass (i.e. dark tree leaf, dark green shadow, brown trunk), replace with bright grass!
      if (!isBrightGrass) {
        // Copy pixel from clean grass sample tile
        const offsetX = (x % 30);
        const offsetY = (y % 30);
        const srcIdx = ((sampleY + offsetY) * W + (sampleX + offsetX)) * 4;

        this.bitmap.data[idx + 0] = bgImg.bitmap.data[srcIdx + 0];
        this.bitmap.data[idx + 1] = bgImg.bitmap.data[srcIdx + 1];
        this.bitmap.data[idx + 2] = bgImg.bitmap.data[srcIdx + 2];
      }
    }
  });

  await bgImg.write(targetBgPath);
  console.log(`Super clean pixel-by-pixel tree erasure complete! Saved to ${targetBgPath}`);
}

superCleanErase().catch(console.error);
