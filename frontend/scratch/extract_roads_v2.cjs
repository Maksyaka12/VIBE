const { Jimp } = require('jimp');

async function extractRoadsV2() {
  const versePath = "C:/Users/builder/Desktop/vibe/frontend/public/verse-map.jpg";
  const targetPath = "C:/Users/builder/Desktop/vibe/frontend/public/map-roads.png";

  console.log("Loading verse-map.jpg...");
  const img = await Jimp.read(versePath);
  const W = img.bitmap.width;
  const H = img.bitmap.height;
  console.log(`Image size: ${W}x${H}`);

  const out = new Jimp({ width: W, height: H, color: 0x00000000 });

  // ─────────────────────────────────────────────────────────────────────────────
  // Building exclusion zones — pixels inside these rects are NEVER road
  // ─────────────────────────────────────────────────────────────────────────────
  const excludeZones = [
    { x1: 140, y1: 40, x2: 490, y2: 295 },    // Arena
    { x1: 140, y1: 285, x2: 370, y2: 465 },   // Bank
    { x1: 585, y1: 45, x2: 845, y2: 280 },    // Poster Office
    { x1: 540, y1: 310, x2: 710, y2: 445 },   // Doghouse
    { x1: 920, y1: 225, x2: 1130, y2: 465 },  // DeFi
    { x1: 810, y1: 290, x2: 970, y2: 465 },   // Holder trophy
    { x1: 960, y1: 475, x2: 1150, y2: 640 },  // Leaderboard
  ];

  function isInExcludeZone(x, y) {
    for (const z of excludeZones) {
      if (x >= z.x1 && x <= z.x2 && y >= z.y1 && y <= z.y2) return true;
    }
    return false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Road color: sandy earthy brown — TIGHT range tuned for actual road pixels
  // Sampled from the map: ~(194,145,82), (186,138,75), (178,130,68)
  // ─────────────────────────────────────────────────────────────────────────────
  function isRoad(r, g, b) {
    return (
      r >= 160 && r <= 215 &&  // warm red
      g >= 118 && g <= 168 &&  // medium green
      b >= 55  && b <= 108 &&  // low blue
      r > g + 25 &&            // red clearly dominant
      g > b + 20 &&            // green clearly above blue
      r - b > 80               // strong sandy-earthy contrast
    );
  }

  // Dog/animal color: white/cream small pixel art dogs
  function isAnimalColor(r, g, b) {
    return (
      r >= 200 && r <= 255 &&
      g >= 188 && g <= 255 &&
      b >= 158 && b <= 240 &&
      r >= g && g >= b  // warm white/cream
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Pass 1: Build road mask (excluding building zones)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("Pass 1: detecting road pixels...");
  const roadMask = new Uint8Array(W * H);

  img.scan(0, 0, W, H, function(x, y, idx) {
    if (isInExcludeZone(x, y)) return;
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    if (isRoad(r, g, b)) {
      roadMask[y * W + x] = 1;
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Pass 2: Detect animals/dogs near road pixels
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("Pass 2: detecting animals near roads...");
  const animalMask = new Uint8Array(W * H);
  const radius = 20;

  img.scan(0, 0, W, H, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    if (!isAnimalColor(r, g, b)) return;
    if (isInExcludeZone(x, y)) return;

    // Check if near a road pixel
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < W && ny < H) {
          if (roadMask[ny * W + nx]) {
            animalMask[y * W + x] = 1;
            return;
          }
        }
      }
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Pass 3: Copy marked pixels to transparent PNG
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("Pass 3: compositing output...");
  img.scan(0, 0, W, H, function(x, y, idx) {
    const i = y * W + x;
    if (roadMask[i] || animalMask[i]) {
      const outIdx = i * 4;
      out.bitmap.data[outIdx + 0] = this.bitmap.data[idx + 0];
      out.bitmap.data[outIdx + 1] = this.bitmap.data[idx + 1];
      out.bitmap.data[outIdx + 2] = this.bitmap.data[idx + 2];
      out.bitmap.data[outIdx + 3] = 255;
    }
  });

  console.log("Saving...");
  await out.write(targetPath);
  console.log(`Done! Saved to: ${targetPath}`);
}

extractRoadsV2().catch(console.error);
