const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function processGenArena() {
  const genImagePath = "C:/Users/builder/.gemini/antigravity/brain/be1b603b-2161-4e2c-9125-ecbafbf2febb/building_vibe_arena_gen_1786320189052.jpg";
  const publicBuildingsDir = "C:/Users/builder/Desktop/vibe/frontend/public/buildings";

  if (!fs.existsSync(publicBuildingsDir)) {
    fs.mkdirSync(publicBuildingsDir, { recursive: true });
  }

  console.log(`Loading generated Arena building image: ${genImagePath}`);
  const img = await Jimp.read(genImagePath);

  // Transparentize solid black background (#000000)
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const brightness = (r + g + b) / 3;
    if (brightness < 35) {
      this.bitmap.data[idx + 3] = 0; // Transparent
    }
  });

  // Autobox crop transparent padding around the sprite
  img.autocrop();

  const outPath = path.join(publicBuildingsDir, "arena.png");
  await img.write(outPath);
  console.log(`Successfully processed generated Vibe Arena building PNG to ${outPath}`);
}

processGenArena().catch(console.error);
