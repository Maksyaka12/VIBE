const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function checkAndDeployEditedRoads() {
  const publicDir = "C:/Users/builder/Desktop/vibe/frontend/public";
  const pngPath = path.join(publicDir, "map-roads.png");
  const jpgPath = path.join(publicDir, "map-roads.jpg");

  let targetPath = fs.existsSync(pngPath) ? pngPath : (fs.existsSync(jpgPath) ? jpgPath : null);

  if (!targetPath) {
    console.log('No map-roads file found in public directory');
    return;
  }

  console.log(`Processing user hand-edited road file: ${targetPath}`);
  const img = await Jimp.read(targetPath);

  // Transparentize any pure black background (#000000)
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
  console.log(`Successfully transparentized and saved user edited roads PNG to ${outPath}`);
}

checkAndDeployEditedRoads().catch(console.error);
