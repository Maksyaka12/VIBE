const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function restoreUserMapRoads() {
  const userRoadsPath = "C:/Users/builder/.gemini/antigravity/brain/be1b603b-2161-4e2c-9125-ecbafbf2febb/map_roads_layer_1786306042491.jpg";
  const publicDir = "C:/Users/builder/Desktop/vibe/frontend/public";

  console.log(`Restoring exact user road layer: ${userRoadsPath}`);
  const img = await Jimp.read(userRoadsPath);

  // Transparentize solid black background (#000000)
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const brightness = (r + g + b) / 3;
    if (brightness < 35) {
      this.bitmap.data[idx + 3] = 0; // Make transparent
    }
  });

  const outPath = path.join(publicDir, "map-roads.png");
  await img.write(outPath);
  console.log(`Successfully restored user's exact roads PNG to ${outPath}`);
}

restoreUserMapRoads().catch(console.error);
