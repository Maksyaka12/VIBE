const { Jimp } = require('jimp');
const path = require('path');

async function buildBgNoRoadsNoBuildings() {
  const versePath = "C:/Users/builder/Desktop/vibe/frontend/public/verse-map.jpg";
  const targetPath = "C:/Users/builder/Desktop/vibe/frontend/public/map-bg.jpg";

  console.log("Loading verse-map.jpg...");
  const img = await Jimp.read(versePath);
  const W = img.bitmap.width;
  const H = img.bitmap.height;
  console.log(`Image size: ${W}x${H}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 1: Erase roads by sandy/brown color detection
  // Roads are a warm sandy-brown: R ~170-210, G ~120-160, B ~60-100
  // We'll replace with nearest grass color sampled from the map
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("Erasing sandy road pixels...");

  img.scan(0, 0, W, H, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    // Sandy road color detection: warm brownish-sandy hue
    const isSandyRoad = (
      r >= 155 && r <= 220 &&   // warm red
      g >= 110 && g <= 175 &&   // medium green
      b >= 50  && b <= 115 &&   // low blue
      r > g &&                  // red dominant (sandy)
      g > b                     // green > blue (sandy/earthy)
    );

    if (isSandyRoad) {
      // Replace with typical grass green from the map
      // Sample a fresh grass green: approx rgb(76, 155, 50)
      this.bitmap.data[idx + 0] = 76;
      this.bitmap.data[idx + 1] = 155;
      this.bitmap.data[idx + 2] = 50;
    }
  });

  console.log("Roads erased. Now erasing building bodies...");

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 2: Paint over specific building body rectangles with grass
  // These are TIGHT boxes around building walls/roofs only (not fences around them)
  // ─────────────────────────────────────────────────────────────────────────────

  // Helper: fill rect with grass (averaged from 4 corner samples of that rect edge)
  function fillRect(img, x1, y1, x2, y2) {
    for (let px = x1; px <= x2; px++) {
      for (let py = y1; py <= y2; py++) {
        if (px < 0 || py < 0 || px >= W || py >= H) continue;
        const idx = (py * W + px) * 4;
        img.bitmap.data[idx + 0] = 76;
        img.bitmap.data[idx + 1] = 155;
        img.bitmap.data[idx + 2] = 50;
        img.bitmap.data[idx + 3] = 255;
      }
    }
  }

  // Pixel coords for 1370x768 image:
  // 1. Vibe Arena stadium walls (tight inner oval structure, no outer plaza fencing)
  fillRect(img, 155, 50, 490, 295);

  // 2. Vibe Bank vault building body (grey stone vault walls)
  fillRect(img, 160, 305, 360, 460);

  // 3. Poster Office 2-story building + red-striped awnings + billboard
  fillRect(img, 580, 60, 840, 270);

  // 4. Doghouse/Home small house structure
  fillRect(img, 545, 325, 700, 435);

  // 5. DeFi Exchange glass skyscraper building
  fillRect(img, 920, 235, 1120, 455);

  // 6. Leaderboard trophy/podium structure bottom right
  fillRect(img, 970, 490, 1150, 620);

  console.log("Building bodies erased. Saving...");
  await img.write(targetPath);
  console.log(`Done! Saved to: ${targetPath}`);
}

buildBgNoRoadsNoBuildings().catch(console.error);
