const { Jimp } = require('jimp');

async function buildBgV2() {
  const versePath = "C:/Users/builder/Desktop/vibe/frontend/public/verse-map.jpg";
  const targetPath = "C:/Users/builder/Desktop/vibe/frontend/public/map-bg.jpg";

  console.log("Loading verse-map.jpg...");
  const img = await Jimp.read(versePath);
  const W = img.bitmap.width;
  const H = img.bitmap.height;
  console.log(`Image size: ${W}x${H}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 1: Erase roads by sandy/brown color detection
  // On verse-map.jpg roads are sandy-earthy: R ~160-215, G ~115-165, B ~55-110
  // We sample a clean grass pixel from the image to replace roads with
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("Erasing road pixels by color...");

  img.scan(0, 0, W, H, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    // Sandy road color range — tuned for verse-map.jpg
    const isSandyRoad = (
      r >= 150 && r <= 220 &&
      g >= 100 && g <= 170 &&
      b >= 45  && b <= 120 &&
      r > g + 20 &&          // red significantly higher than green
      g > b                  // earthy/sandy hue
    );

    if (isSandyRoad) {
      // Grass green matching the island
      this.bitmap.data[idx + 0] = 78;
      this.bitmap.data[idx + 1] = 158;
      this.bitmap.data[idx + 2] = 48;
    }
  });

  console.log("Roads erased. Now erasing building body rectangles...");

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 2: Erase TIGHT building rectangles (pixels, 1376x768 image)
  // These are tighter bounding boxes that DON'T cover surrounding fences/lanterns
  // ─────────────────────────────────────────────────────────────────────────────
  function fillRect(x1, y1, x2, y2, label) {
    console.log(`  Erasing: ${label} [${x1},${y1} -> ${x2},${y2}]`);
    for (let px = x1; px <= x2; px++) {
      for (let py = y1; py <= y2; py++) {
        if (px < 0 || py < 0 || px >= W || py >= H) continue;
        const idx = (py * W + px) * 4;
        img.bitmap.data[idx + 0] = 78;
        img.bitmap.data[idx + 1] = 158;
        img.bitmap.data[idx + 2] = 48;
        img.bitmap.data[idx + 3] = 255;
      }
    }
  }

  // ───────────────────────────────────────────────────
  // Building coordinates (tightly fitted, not fences):
  // ───────────────────────────────────────────────────

  // 1. Vibe Arena – concrete circular stadium walls only
  //    (inner stadium + outer rim wall, not the trees/fences around it)
  fillRect(162, 55, 468, 280, "Arena stadium");

  // 2. Vibe Bank – grey stone vault + facade only
  fillRect(165, 300, 348, 448, "Bank vault");

  // 3. Poster/City Hall – 2-story red+grey building body
  //    (the actual walls of the building, not the fence perimeter)
  fillRect(608, 65, 810, 262, "Poster building");

  // 4. Home / Doghouse – small wooden doghouse structure
  fillRect(566, 330, 688, 428, "Doghouse");

  // 5. DeFi Exchange – glass high-tech building body
  fillRect(942, 240, 1112, 450, "DeFi skyscraper");

  // 6. Leaderboard podium/trophy structure (bottom right)
  fillRect(990, 490, 1110, 610, "Leaderboard podium");

  console.log("Done! Saving...");
  await img.write(targetPath);
  console.log(`Saved to: ${targetPath}`);
}

buildBgV2().catch(console.error);
