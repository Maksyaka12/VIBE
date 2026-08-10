const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function processHoldersSprite() {
  const genPath = "C:/Users/builder/.gemini/antigravity/brain/be1b603b-2161-4e2c-9125-ecbafbf2febb/holders_chest_sprite_1786315817192.jpg";
  const publicDir = "C:/Users/builder/Desktop/vibe/frontend/public/buildings";

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('Loading generated Holders chest sprite...');
  const img = await Jimp.read(genPath);

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

  const outPath = path.join(publicDir, "holders.png");
  await img.write(outPath);
  console.log(`Saved transparent PNG to ${outPath}`);
}

processHoldersSprite().catch(console.error);
