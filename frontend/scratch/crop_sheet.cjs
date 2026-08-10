const { Jimp } = require('jimp');
const path = require('path');

async function cropSheet() {
  const sheetPath = "C:/Users/builder/.gemini/antigravity/brain/be1b603b-2161-4e2c-9125-ecbafbf2febb/buildings_sheet_1786304680273.jpg";
  
  console.log('Loading buildings sprite sheet...');
  const image = await Jimp.read(sheetPath);
  const W = image.bitmap.width;
  const H = image.bitmap.height;
  console.log(`Sheet dimensions: ${W}x${H}`);

  const colW = Math.floor(W / 3);
  const rowH = Math.floor(H / 2);

  const targets = [
    { name: 'bank',        row: 0, col: 0 },
    { name: 'poster',      row: 0, col: 1 },
    { name: 'arena',       row: 0, col: 2 },
    { name: 'defi',        row: 1, col: 0 },
    { name: 'leaderboard', row: 1, col: 1 },
    { name: 'holders',     row: 1, col: 2 }
  ];

  for (const t of targets) {
    const sx = t.col * colW;
    const sy = t.row * rowH;
    
    console.log(`Cropping ${t.name}: x=${sx}, y=${sy}, w=${colW}, h=${rowH}`);
    const cropped = image.clone().crop({ x: sx, y: sy, w: colW, h: rowH });

    // Chroma key dark/black background to transparent
    cropped.scan(0, 0, cropped.bitmap.width, cropped.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      const brightness = (r + g + b) / 3;

      if (brightness < 35) {
        this.bitmap.data[idx + 3] = 0; // Transparent
      }
    });

    const outputPath = `C:/Users/builder/Desktop/vibe/frontend/public/buildings/${t.name}.jpg`;
    await cropped.write(outputPath);
    console.log(`Saved ${t.name} to ${outputPath}`);
  }
}

cropSheet().catch(console.error);
