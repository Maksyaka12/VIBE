const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function deployOriginalMapRoadsJpg() {
  const publicDir = "C:/Users/builder/Desktop/vibe/frontend/public";
  const jpgPath = path.join(publicDir, "map-roads.jpg");
  const pngPath = path.join(publicDir, "map-roads.png");

  console.log(`Processing original public/map-roads.jpg...`);
  const img = await Jimp.read(jpgPath);

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

  await img.write(pngPath);
  console.log(`Successfully deployed original map-roads.jpg -> ${pngPath}`);
}

deployOriginalMapRoadsJpg().catch(console.error);
