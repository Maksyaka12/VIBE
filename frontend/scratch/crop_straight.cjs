const { Jimp } = require('jimp');
const path = require('path');

async function cropStraight() {
  const mapPath = "C:/Users/builder/Desktop/vibe/frontend/public/verse-map.jpg";
  
  console.log('Loading verse-map.jpg...');
  const image = await Jimp.read(mapPath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  console.log(`Map dimensions: ${width}x${height}`);

  // 1. Crop Bank (approx x: 17% to 31.5%, y: 34.5% to 59.0%)
  {
    const sx = Math.floor(0.170 * width);
    const sy = Math.floor(0.345 * height);
    const sw = Math.floor(0.145 * width);
    const sh = Math.floor(0.245 * height);

    console.log(`Cropping bank: x=${sx}, y=${sy}, w=${sw}, h=${sh}`);
    const bank = image.clone().crop({ x: sx, y: sy, w: sw, h: sh });

    // Chroma key green grass to transparent
    bank.scan(0, 0, bank.bitmap.width, bank.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      const isGreen = (g > r * 1.05 && g > b * 1.05 && g > 35) || 
                      (g > 55 && r < 55 && b < 55) ||
                      (g > 100 && r > 50 && r < 150 && b < 110);
      if (isGreen) {
        this.bitmap.data[idx + 3] = 0; // Transparent
      }
    });

    const outputPath = "C:/Users/builder/Desktop/vibe/frontend/public/buildings/bank.png";
    await bank.write(outputPath);
    console.log(`Saved transparent bank.png`);
  }

  // 2. Crop Arena (approx x: 22.0% to 39.0%, y: 10.0% to 36.0%)
  {
    const sx = Math.floor(0.220 * width);
    const sy = Math.floor(0.090 * height);
    const sw = Math.floor(0.170 * width);
    const sh = Math.floor(0.270 * height);

    console.log(`Cropping arena: x=${sx}, y=${sy}, w=${sw}, h=${sh}`);
    const arena = image.clone().crop({ x: sx, y: sy, w: sw, h: sh });

    // Chroma key green grass to transparent
    arena.scan(0, 0, arena.bitmap.width, arena.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      const isGreen = (g > r * 1.05 && g > b * 1.05 && g > 35) || 
                      (g > 55 && r < 55 && b < 55) ||
                      (g > 100 && r > 50 && r < 150 && b < 110);
      if (isGreen) {
        this.bitmap.data[idx + 3] = 0; // Transparent
      }
    });

    const outputPath = "C:/Users/builder/Desktop/vibe/frontend/public/buildings/arena.png";
    await arena.write(outputPath);
    console.log(`Saved transparent arena.png`);
  }
}

cropStraight().catch(console.error);
