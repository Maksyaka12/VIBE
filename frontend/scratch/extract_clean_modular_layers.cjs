const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function extractCleanModularLayers() {
  const mapPath = "C:/Users/builder/Desktop/vibe/frontend/public/verse-map.jpg";
  const buildingsDir = "C:/Users/builder/Desktop/vibe/frontend/public/buildings";
  const publicDir = "C:/Users/builder/Desktop/vibe/frontend/public";

  if (!fs.existsSync(buildingsDir)) {
    fs.mkdirSync(buildingsDir, { recursive: true });
  }

  console.log('Loading original verse-map.jpg...');
  const mapImg = await Jimp.read(mapPath);
  const W = mapImg.bitmap.width;
  const H = mapImg.bitmap.height;

  // Exact pixel coordinates of the 8 buildings on verse-map.jpg (1376 x 768)
  const buildingCrops = [
    { id: 'arena',       x: 275, y: 15,  w: 300, h: 220 },
    { name: 'poster',    id: 'poster',     x: 580, y: 100, w: 250, h: 175 },
    { name: 'defi',      id: 'defi',       x: 950, y: 260, w: 220, h: 200 },
    { name: 'bank',      id: 'bank',       x: 240, y: 350, w: 220, h: 180 },
    { name: 'home',      id: 'home',       x: 575, y: 310, w: 180, h: 160 },
    { name: 'leaderboard', id: 'leaderboard', x: 670, y: 230, w: 230, h: 210 },
    { name: 'nft_mint',  id: 'nft_mint',   x: 430, y: 550, w: 180, h: 150 },
    { name: 'holders',   id: 'holders',    x: 935, y: 470, w: 220, h: 200 }
  ];

  console.log('Extracting and transparentizing 8 modular building sprites...');
  for (const b of buildingCrops) {
    const cropped = mapImg.clone().crop({ x: b.x, y: b.y, w: b.w, h: b.h });

    // Sample grass background color around building corners
    const topLeftR = cropped.bitmap.data[0];
    const topLeftG = cropped.bitmap.data[1];
    const topLeftB = cropped.bitmap.data[2];

    // Transparentize grass background around building
    cropped.scan(0, 0, b.w, b.h, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const bColor = this.bitmap.data[idx + 2];

      // Green grass detection (G > R and G > B and G > 90)
      const isGrass = (g > 95 && g > r * 1.08 && g > bColor * 1.1) ||
                      (Math.abs(r - topLeftR) < 30 && Math.abs(g - topLeftG) < 30 && Math.abs(bColor - topLeftB) < 30);

      if (isGrass) {
        this.bitmap.data[idx + 3] = 0; // Make transparent
      }
    });

    const outPath = path.join(buildingsDir, `${b.id}.png`);
    await cropped.write(outPath);
    console.log(`Saved modular sprite: ${outPath}`);
  }

  console.log('Modular building sprite extraction complete!');
}

extractCleanModularLayers().catch(console.error);
