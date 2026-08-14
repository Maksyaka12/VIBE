const { Jimp } = require('jimp');
const path = require('path');

async function cropAssets() {
  const mapPath = "C:/Users/builder/Desktop/vibe/frontend/public/verse-map.jpg";
  
  console.log('Loading verse-map.jpg...');
  const image = await Jimp.read(mapPath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  console.log(`Original dimensions: ${width}x${height}`);

  // 1. Crop Bank (approx x: 17% to 31.5%, y: 35.0% to 59.0%)
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

      // Detect and strip all shades of green grass/leaves
      const isGreen = (g > r * 1.05 && g > b * 1.05 && g > 35) || 
                      (g > 55 && r < 55 && b < 55) ||
                      (g > 100 && r > 50 && r < 150 && b < 110);

      if (isGreen) {
        this.bitmap.data[idx + 3] = 0; // Transparent
      }
    });

    const outputPath = "C:/Users/builder/Desktop/vibe/frontend/public/buildings/bank.png";
    await bank.write(outputPath);
    console.log(`Saved transparent bank to: ${outputPath}`);
  }

  // 2. Crop Poster Office (approx x: 45.5% to 62.5%, y: 12.0% to 36.0%)
  {
    const sx = Math.floor(0.455 * width);
    const sy = Math.floor(0.120 * height);
    const sw = Math.floor(0.17 * width);
    const sh = Math.floor(0.24 * height);

    console.log(`Cropping poster office: x=${sx}, y=${sy}, w=${sw}, h=${sh}`);
    const poster = image.clone().crop({ x: sx, y: sy, w: sw, h: sh });

    // Chroma key green grass to transparent
    poster.scan(0, 0, poster.bitmap.width, poster.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];

      const isGreen = (g > 85 && g > r * 1.15 && g > b * 1.25) || 
                      (g > 65 && r < 55 && b < 55) ||
                      (g > 130 && r > 90 && r < 140 && b < 100);

      if (isGreen) {
        this.bitmap.data[idx + 3] = 0; // Transparent
      }
    });

    const outputPath = "C:/Users/builder/Desktop/vibe/frontend/public/buildings/poster.png";
    await poster.write(outputPath);
    console.log(`Saved transparent poster office to: ${outputPath}`);
  }
}

cropAssets().catch(console.error);

