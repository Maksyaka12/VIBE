const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function processStep2Roads() {
  const genRoadsPath = "C:/Users/builder/.gemini/antigravity/brain/be1b603b-2161-4e2c-9125-ecbafbf2febb/vibe_verse_step2_roads_1786317490504.jpg";
  const publicDir = "C:/Users/builder/Desktop/vibe/frontend/public";

  console.log('Loading generated Step 2 roads image...');
  const img = await Jimp.read(genRoadsPath);

  // Chroma key black background (brightness < 35) to transparent
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const brightness = (r + g + b) / 3;
    if (brightness < 35) {
      this.bitmap.data[idx + 3] = 0; // Transparent
    }
  });

  const outPath = path.join(publicDir, "map-roads.png");
  await img.write(outPath);
  console.log(`Saved transparent roads PNG to ${outPath}`);
}

processStep2Roads().catch(console.error);
