const { Jimp } = require('jimp');

async function buildBgV3() {
  const versePath = "C:/Users/builder/Desktop/vibe/frontend/public/verse-map.jpg";
  const targetPath = "C:/Users/builder/Desktop/vibe/frontend/public/map-bg.jpg";

  console.log("Loading verse-map.jpg...");
  const img = await Jimp.read(versePath);
  const W = img.bitmap.width;
  const H = img.bitmap.height;
  console.log(`Image size: ${W}x${H}`);

  // STEP 1: Erase roads by sandy/brown color detection
  console.log("Erasing road pixels by color...");
  img.scan(0, 0, W, H, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const isSandyRoad = (
      r >= 150 && r <= 220 &&
      g >= 100 && g <= 170 &&
      b >= 45  && b <= 120 &&
      r > g + 20 &&
      g > b
    );
    if (isSandyRoad) {
      this.bitmap.data[idx + 0] = 78;
      this.bitmap.data[idx + 1] = 158;
      this.bitmap.data[idx + 2] = 48;
    }
  });

  // STEP 2: Erase building bodies (all 8 zones including trophies)
  function fillRect(x1, y1, x2, y2, label) {
    console.log(`  Erasing: ${label} [${x1},${y1} -> ${x2},${y2}]`);
    for (let px = x1; px <= x2; px++) {
      for (let py = y1; py <= y2; py++) {
        if (px < 0 || py < 0 || px >= W || py >= H) continue;
        const i = (py * W + px) * 4;
        img.bitmap.data[i + 0] = 78;
        img.bitmap.data[i + 1] = 158;
        img.bitmap.data[i + 2] = 48;
        img.bitmap.data[i + 3] = 255;
      }
    }
  }

  // 1. Vibe Arena — circular stadium walls
  fillRect(162, 55, 468, 280, "Arena stadium");

  // 2. Vibe Bank — grey stone vault
  fillRect(165, 300, 348, 448, "Bank vault");

  // 3. Poster Office — 2-story red+grey building
  fillRect(608, 65, 810, 262, "Poster building");

  // 4. Home / Doghouse — small wooden house
  fillRect(566, 330, 688, 428, "Doghouse");

  // 5. DeFi Exchange — glass skyscraper
  fillRect(942, 240, 1112, 450, "DeFi skyscraper");

  // 6. Holder Zone — large gold trophy cup (center-right area)
  fillRect(830, 305, 960, 460, "Holder trophy cup");

  // 7. Leaderboard — gold trophy + podium (bottom-right corner)
  fillRect(970, 490, 1130, 625, "Leaderboard podium");

  // 8. NFT Mint — if there's any structure between home and exchange (small item bottom center-right)
  //    Looking at map: seems to be small item ~x:780-860, y:480-570
  fillRect(780, 480, 870, 570, "NFT Mint item");

  console.log("Done! Saving...");
  await img.write(targetPath);
  console.log(`Saved to: ${targetPath}`);
}

buildBgV3().catch(console.error);
