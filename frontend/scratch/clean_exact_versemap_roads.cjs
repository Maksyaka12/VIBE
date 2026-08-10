const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function cleanExactVersemapRoads() {
  const mapPath = "C:/Users/builder/Desktop/vibe/frontend/public/verse-map.jpg";
  const publicDir = "C:/Users/builder/Desktop/vibe/frontend/public";

  console.log('Loading verse-map.jpg to extract clean identical road network...');
  const mapImg = await Jimp.read(mapPath);
  const W = mapImg.bitmap.width;
  const H = mapImg.bitmap.height;

  const roadsImg = mapImg.clone();

  roadsImg.scan(0, 0, W, H, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    const relX = x / W;
    const relY = y / H;

    // Check if pixel is within clean road corridors
    const inMainHorizontal = (relY >= 0.60 && relY <= 0.68 && relX >= 0.25 && relX <= 0.76);
    const inLeftVertical   = (relX >= 0.40 && relX <= 0.44 && relY >= 0.35 && relY <= 0.80);
    const inRightVertical  = (relX >= 0.70 && relX <= 0.74 && relY >= 0.35 && relY <= 0.78);
    const inBridgePath     = (relX >= 0.18 && relX <= 0.42 && relY >= 0.62 && relY <= 0.85);

    const isRoadCorridor = inMainHorizontal || inLeftVertical || inRightVertical || inBridgePath;

    // Detect dirt sand color
    const isSand = (r > 170 && g > 115 && g < r && b < 115 && (r - b) > 45);
    const isBorder = (r > 70 && r < 140 && g > 40 && g < 95 && b > 15 && b < 65);

    if (isRoadCorridor && (isSand || isBorder)) {
      this.bitmap.data[idx + 3] = 255; // Keep road pixel
    } else {
      this.bitmap.data[idx + 3] = 0; // Transparent
    }
  });

  const outPath = path.join(publicDir, "map-roads.png");
  await roadsImg.write(outPath);
  console.log(`Saved clean identical roads PNG to ${outPath}`);
}

cleanExactVersemapRoads().catch(console.error);
